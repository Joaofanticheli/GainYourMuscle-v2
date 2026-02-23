// ============================================================================
// PAINEL DO PROFISSIONAL
// ============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import '../styles/Profissional.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DashboardProfissional = () => {
  const { user, token } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);

  const prof = user?.profissional || {};

  const tipoLabel = {
    personal: 'Personal Trainer',
    nutricionista: 'Nutricionista',
    psicologo: 'Psicólogo',
  };

  const headers = { Authorization: `Bearer ${token}` };

  const carregar = useCallback(async () => {
    try {
      const [resClientes, resPendentes] = await Promise.all([
        fetch(`${API}/api/profissional/meus-clientes`, { headers }),
        fetch(`${API}/api/profissional/vinculos/pendentes`, { headers }),
      ]);

      const dataClientes = await resClientes.json();
      const dataPendentes = await resPendentes.json();

      if (dataClientes.success) setClientes(dataClientes.clientes);
      if (dataPendentes.success) setPendentes(dataPendentes.pendentes);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const responder = async (vinculoId, acao) => {
    try {
      const res = await fetch(`${API}/api/profissional/vinculos/${vinculoId}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao }),
      });
      const data = await res.json();
      if (data.success) carregar();
    } catch (err) {
      console.error('Erro ao responder:', err);
    }
  };

  const formatarData = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <>
      <Navbar />
      <div className="dash-prof-container">
        {/* Header */}
        <div className="dash-prof-header">
          <h1>Olá, {user?.nome}!</h1>
          <p>{tipoLabel[prof.tipo] || 'Profissional'}</p>
          <span className={`badge-status badge-${prof.status || 'pendente'}`}>
            {prof.status === 'ativo' ? 'Aprovado' : prof.status === 'rejeitado' ? 'Rejeitado' : 'Em análise'}
          </span>
        </div>

        {/* Banner pendente */}
        {prof.status !== 'ativo' && (
          <div className="banner-pendente">
            Seu cadastro está em análise. Enquanto isso, você pode explorar o painel,
            mas algumas funcionalidades estarão disponíveis após a aprovação.
          </div>
        )}

        {loading ? (
          <div className="loading-state">Carregando...</div>
        ) : (
          <>
            {/* Solicitações pendentes */}
            <div className="dash-prof-section">
              <h2>Solicitações pendentes ({pendentes.length})</h2>
              {pendentes.length === 0 ? (
                <p className="empty-state">Nenhuma solicitação pendente.</p>
              ) : (
                pendentes.map(v => (
                  <div key={v._id} className="solicitacao-card">
                    <div className="cliente-card-info">
                      <h3>{v.cliente?.nome}</h3>
                      <p>{v.cliente?.email}</p>
                      <p>
                        {v.cliente?.peso ? `${v.cliente.peso}kg` : ''}
                        {v.cliente?.altura ? ` · ${v.cliente.altura}cm` : ''}
                      </p>
                    </div>
                    <div className="solicitacao-acoes">
                      <button className="btn-aceitar" onClick={() => responder(v._id, 'aceitar')}>
                        Aceitar
                      </button>
                      <button className="btn-recusar" onClick={() => responder(v._id, 'recusar')}>
                        Recusar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Lista de clientes */}
            <div className="dash-prof-section">
              <h2>Meus clientes ({clientes.length})</h2>
              {clientes.length === 0 ? (
                <p className="empty-state">
                  Você ainda não tem clientes vinculados.
                </p>
              ) : (
                clientes.map(c => (
                  <div key={c._id} className="cliente-card">
                    <div className="cliente-card-info">
                      <h3>{c.nome}</h3>
                      <p>
                        {c.peso ? `${c.peso}kg` : ''}
                        {c.altura ? ` · ${c.altura}cm` : ''}
                        {c.frequencia !== undefined ? ` · ${c.frequencia}x/semana` : ''}
                      </p>
                      <p>Último acesso: {formatarData(c.lastLogin)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DashboardProfissional;
