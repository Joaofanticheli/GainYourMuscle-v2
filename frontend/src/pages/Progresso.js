// ============================================================================
// PÁGINA PROGRESSO - Registrar e visualizar evolução
// ============================================================================

import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Progresso.css';

const Progresso = () => {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [error, setError] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);

  const [formData, setFormData] = useState({
    peso: '',
    notas: '',
    medidas: {
      braco: '',
      peito: '',
      cintura: '',
      quadril: '',
      coxa: ''
    }
  });

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      const response = await userAPI.getProgress();
      setHistorico(response.data.progresso || []);
    } catch (err) {
      console.error('Erro ao carregar progresso:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMedida = (e) => {
    setFormData({
      ...formData,
      medidas: { ...formData.medidas, [e.target.name]: e.target.value }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSucesso('');
    setError('');
    setSalvando(true);

    try {
      const payload = {
        peso: formData.peso ? Number(formData.peso) : undefined,
        notas: formData.notas,
        medidas: {
          braco: formData.medidas.braco ? Number(formData.medidas.braco) : undefined,
          peito: formData.medidas.peito ? Number(formData.medidas.peito) : undefined,
          cintura: formData.medidas.cintura ? Number(formData.medidas.cintura) : undefined,
          quadril: formData.medidas.quadril ? Number(formData.medidas.quadril) : undefined,
          coxa: formData.medidas.coxa ? Number(formData.medidas.coxa) : undefined
        }
      };

      await userAPI.addProgress(payload);
      setSucesso('Progresso registrado! Continue assim! 💪');
      setMostrarForm(false);
      setFormData({
        peso: '', notas: '',
        medidas: { braco: '', peito: '', cintura: '', quadril: '', coxa: '' }
      });
      carregarHistorico();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar progresso.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="progresso-container">
          <div className="loading">Carregando histórico...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="progresso-container">
        <header className="progresso-header">
          <div>
            <h1>📈 Meu Progresso</h1>
            <p>Registre seu peso e medidas para acompanhar sua evolução</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setMostrarForm(!mostrarForm); setSucesso(''); setError(''); }}
          >
            {mostrarForm ? 'Cancelar' : '+ Registrar Hoje'}
          </button>
        </header>

        {sucesso && <div className="alert alert-success">{sucesso}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Formulário de registro */}
        {mostrarForm && (
          <div className="card progresso-form-card">
            <h2>Novo Registro</h2>
            <form onSubmit={handleSubmit} className="progresso-form">
              <div className="form-section">
                <h3>Peso e Observações</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Peso atual (kg)</label>
                    <input
                      type="number"
                      name="peso"
                      value={formData.peso}
                      onChange={handleChange}
                      placeholder="Ex: 75.5"
                      step="0.1"
                      min="30" max="300"
                      disabled={salvando}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Observações (opcional)</label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleChange}
                    placeholder="Como você está se sentindo? Alguma conquista do dia?"
                    rows="3"
                    disabled={salvando}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Medidas (cm) — opcional</h3>
                <div className="medidas-grid">
                  {[
                    { name: 'braco', label: 'Braço' },
                    { name: 'peito', label: 'Peito' },
                    { name: 'cintura', label: 'Cintura' },
                    { name: 'quadril', label: 'Quadril' },
                    { name: 'coxa', label: 'Coxa' }
                  ].map(({ name, label }) => (
                    <div className="form-group" key={name}>
                      <label>{label}</label>
                      <input
                        type="number"
                        name={name}
                        value={formData.medidas[name]}
                        onChange={handleMedida}
                        placeholder="cm"
                        step="0.5"
                        min="10" max="200"
                        disabled={salvando}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : '💾 Salvar Registro'}
              </button>
            </form>
          </div>
        )}

        {/* Histórico */}
        {historico.length === 0 ? (
          <div className="card empty-state">
            <h2>Nenhum registro ainda 📋</h2>
            <p>Clique em "Registrar Hoje" para começar a acompanhar seu progresso!</p>
          </div>
        ) : (
          <div className="historico-lista">
            <h2>Histórico</h2>
            {historico.map((registro, index) => (
              <div className="card registro-card" key={registro._id || index}>
                <div className="registro-header">
                  <span className="registro-data">
                    📅 {new Date(registro.data).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </span>
                  {registro.peso && (
                    <span className="registro-peso">{registro.peso} kg</span>
                  )}
                </div>

                {registro.medidas && Object.values(registro.medidas).some(v => v) && (
                  <div className="registro-medidas">
                    {registro.medidas.braco && <span>💪 Braço: {registro.medidas.braco}cm</span>}
                    {registro.medidas.peito && <span>🫁 Peito: {registro.medidas.peito}cm</span>}
                    {registro.medidas.cintura && <span>⬛ Cintura: {registro.medidas.cintura}cm</span>}
                    {registro.medidas.quadril && <span>🍑 Quadril: {registro.medidas.quadril}cm</span>}
                    {registro.medidas.coxa && <span>🦵 Coxa: {registro.medidas.coxa}cm</span>}
                  </div>
                )}

                {registro.notas && (
                  <p className="registro-notas">💬 {registro.notas}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progresso;
