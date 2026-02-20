// ============================================================================
// PÁGINA PERFIL - Ver e editar dados do usuário
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Perfil.css';

const Perfil = () => {
  const { user, login } = useAuth();

  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [error, setError] = useState('');

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

  return (
    <div>
      <Navbar />
      <div className="perfil-container">
        <header className="perfil-header">
          <h1>👤 Meu Perfil</h1>
          <p>Suas informações pessoais e físicas</p>
        </header>

        {sucesso && (
          <div className="alert alert-success">{sucesso}</div>
        )}
        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <div className="perfil-grid">
          {/* Card de informações */}
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
              {!editando && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditando(true)}
                >
                  ✏️ Editar
                </button>
              )}
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
                  <span className="dado-valor">{user?.peso} kg</span>
                </div>
                <div className="dado-item">
                  <span className="dado-label">Altura</span>
                  <span className="dado-valor">{user?.altura} cm</span>
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
          <h2>📊 Seu IMC</h2>
          <ImcDisplay peso={user?.peso} altura={user?.altura} />
        </div>
      </div>
    </div>
  );
};

const ImcDisplay = ({ peso, altura }) => {
  if (!peso || !altura) return <p>Dados insuficientes para calcular o IMC.</p>;

  const alturaM = altura / 100;
  const imc = (peso / (alturaM * alturaM)).toFixed(1);

  let categoria = '';
  let cor = '';

  if (imc < 18.5) { categoria = 'Abaixo do peso'; cor = '#3498db'; }
  else if (imc < 25) { categoria = 'Peso normal'; cor = '#27ae60'; }
  else if (imc < 30) { categoria = 'Sobrepeso'; cor = '#f39c12'; }
  else { categoria = 'Obesidade'; cor = '#e74c3c'; }

  return (
    <div className="imc-display">
      <div className="imc-valor" style={{ color: cor }}>{imc}</div>
      <div className="imc-categoria" style={{ color: cor }}>{categoria}</div>
      <p className="imc-info">
        O IMC é apenas uma referência. Massa muscular não é gordura!
        Foque no seu bem-estar e desempenho. 💪
      </p>
    </div>
  );
};

export default Perfil;
