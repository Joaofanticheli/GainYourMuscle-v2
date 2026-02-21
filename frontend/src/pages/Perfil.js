// ============================================================================
// PÁGINA PERFIL - Ver e editar dados do usuário
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Perfil.css';

const EyeIcon = ({ visivel }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {visivel ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const Perfil = () => {
  const { user } = useAuth();

  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [error, setError] = useState('');
  const [ocultarDados, setOcultarDados] = useState(false);

  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    idade: user?.idade || '',
    peso: user?.peso || '',
    altura: user?.altura || '',
    frequencia: user?.frequencia || 0
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSucesso('');
    setLoading(true);

    try {
      await userAPI.updateProfile(formData);
      setSucesso('Perfil atualizado com sucesso!');
      setEditando(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  const cancelar = () => {
    setFormData({
      nome: user?.nome || '',
      idade: user?.idade || '',
      peso: user?.peso || '',
      altura: user?.altura || '',
      frequencia: user?.frequencia || 0
    });
    setEditando(false);
    setError('');
  };

  // Máscara de privacidade
  const m = (valor, sufixo = '') => ocultarDados ? '•••' : (valor ? `${valor}${sufixo}` : '—');

  return (
    <div>
      <Navbar />
      <div className="perfil-container">
        <header className="perfil-header">
          <h1>Meu Perfil</h1>
          <p>Suas informações pessoais e físicas</p>
        </header>

        {sucesso && <div className="alert alert-success">{sucesso}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="perfil-grid">
          {/* Card de identificação */}
          <div className="card perfil-card">
            <div className="perfil-avatar">
              <span>{user?.nome?.charAt(0).toUpperCase()}</span>
            </div>
            <h2>{user?.nome}</h2>
            <p className="perfil-email">{user?.email}</p>
            <p className="perfil-membro">
              Membro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '—'}
            </p>
          </div>

          {/* Formulário de dados */}
          <div className="card">
            <div className="perfil-form-header">
              <h2>Dados Pessoais</h2>
              <div className="perfil-form-actions">
                {/* Botão ocultar dados físicos */}
                <button
                  className="btn-ocultar"
                  onClick={() => setOcultarDados(!ocultarDados)}
                  title={ocultarDados ? 'Mostrar dados físicos' : 'Ocultar dados físicos'}
                >
                  <EyeIcon visivel={!ocultarDados} />
                  {ocultarDados ? 'Mostrar' : 'Ocultar'}
                </button>

                {!editando && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setEditando(true)}
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>

            {!editando ? (
              <div className="perfil-dados">
                <div className="dado-item">
                  <span className="dado-label">Nome</span>
                  <span className="dado-valor">{user?.nome}</span>
                </div>
                <div className="dado-item">
                  <span className="dado-label">Email</span>
                  <span className="dado-valor">{user?.email}</span>
                </div>
                <div className="dado-item">
                  <span className="dado-label">Idade</span>
                  <span className="dado-valor">{user?.idade} anos</span>
                </div>
                <div className="dado-item">
                  <span className="dado-label">Sexo Biológico</span>
                  <span className="dado-valor" style={{ textTransform: 'capitalize' }}>
                    {user?.sexo}
                  </span>
                </div>
                <div className="dado-item">
                  <span className="dado-label">Peso</span>
                  <span className={`dado-valor ${ocultarDados ? 'dado-oculto' : ''}`}>
                    {m(user?.peso, ' kg')}
                  </span>
                </div>
                <div className="dado-item">
                  <span className="dado-label">Altura</span>
                  <span className={`dado-valor ${ocultarDados ? 'dado-oculto' : ''}`}>
                    {m(user?.altura, ' cm')}
                  </span>
                </div>
                <div className="dado-item">
                  <span className="dado-label">Frequência Atual</span>
                  <span className="dado-valor">{user?.frequencia}x por semana</span>
                </div>
              </div>
            ) : (
              <form className="perfil-edit-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Idade</label>
                    <input
                      type="number"
                      name="idade"
                      value={formData.idade}
                      onChange={handleChange}
                      min="13" max="120"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Frequência (dias/semana)</label>
                    <input
                      type="number"
                      name="frequencia"
                      value={formData.frequencia}
                      onChange={handleChange}
                      min="0" max="7"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Peso (kg)</label>
                    <input
                      type="number"
                      name="peso"
                      value={formData.peso}
                      onChange={handleChange}
                      min="30" max="300"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Altura (cm)</label>
                    <input
                      type="number"
                      name="altura"
                      value={formData.altura}
                      onChange={handleChange}
                      min="100" max="250"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="perfil-edit-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : '✅ Salvar'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={cancelar}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* IMC calculado */}
        <div className="card imc-card">
          <h2>Seu IMC</h2>
          <ImcDisplay peso={user?.peso} altura={user?.altura} oculto={ocultarDados} />
        </div>
      </div>
    </div>
  );
};

const ImcDisplay = ({ peso, altura, oculto }) => {
  if (!peso || !altura) return <p>Dados insuficientes para calcular o IMC.</p>;

  if (oculto) {
    return (
      <div className="imc-display">
        <div className="imc-valor dado-oculto" style={{ color: 'var(--muted)' }}>•••</div>
        <div className="imc-categoria dado-oculto" style={{ color: 'var(--muted)' }}>oculto</div>
        <p className="imc-info">O IMC é apenas uma referência. Massa muscular não é gordura!</p>
      </div>
    );
  }

  const alturaM = altura / 100;
  const imc = (peso / (alturaM * alturaM)).toFixed(1);

  let categoria = '';
  let cor = '';

  if (imc < 18.5)      { categoria = 'Abaixo do peso'; cor = '#3498db'; }
  else if (imc < 25)   { categoria = 'Peso normal';    cor = '#27ae60'; }
  else if (imc < 30)   { categoria = 'Sobrepeso';      cor = '#f39c12'; }
  else                  { categoria = 'Obesidade';      cor = '#e74c3c'; }

  return (
    <div className="imc-display">
      <div className="imc-valor" style={{ color: cor }}>{imc}</div>
      <div className="imc-categoria" style={{ color: cor }}>{categoria}</div>
      <p className="imc-info">
        O IMC é apenas uma referência. Massa muscular não é gordura!
        Foque no seu bem-estar e desempenho.
      </p>
    </div>
  );
};

export default Perfil;
