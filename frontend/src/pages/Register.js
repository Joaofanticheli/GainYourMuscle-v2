// ============================================================================
// PÁGINA REGISTER - Cadastro de Novo Usuário
// ============================================================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmaPassword: '',
    idade: '',
    peso: '',
    altura: '',
    sexo: '',
    frequencia: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (formData.password !== formData.confirmaPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { confirmaPassword, ...userData } = formData;
      await register(userData);
      navigate('/dashboard');
    } catch (error) {
      setError(
        error.response?.data?.message || 'Erro ao criar conta. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box register-box">
        <h1 className="auth-title">GainYourMuscle</h1>
        <h2 className="auth-subtitle">Criar Conta</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <fieldset className="form-fieldset">
            <legend>Informações Pessoais</legend>

            <div className="form-group">
              <label htmlFor="nome">Nome:</label>
              <input
                type="text"
                id="nome"
                name="nome"
                placeholder="Seu nome"
                value={formData.nome}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="idade">Idade:</label>
                <input
                  type="number"
                  id="idade"
                  name="idade"
                  placeholder="25"
                  min="13"
                  max="120"
                  value={formData.idade}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="sexo">Sexo Biológico:</label>
                <select
                  id="sexo"
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Selecione</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="peso">Peso (kg):</label>
                <input
                  type="number"
                  id="peso"
                  name="peso"
                  placeholder="75"
                  min="30"
                  max="300"
                  value={formData.peso}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="altura">Altura (cm):</label>
                <input
                  type="number"
                  id="altura"
                  name="altura"
                  placeholder="175"
                  min="100"
                  max="250"
                  value={formData.altura}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="frequencia">
                Frequência de atividade física (vezes/semana):
              </label>
              <input
                type="number"
                id="frequencia"
                name="frequencia"
                placeholder="0-7"
                min="0"
                max="7"
                value={formData.frequencia}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend>Dados de Login</legend>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha:</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmaPassword">Confirmar Senha:</label>
              <input
                type="password"
                id="confirmaPassword"
                name="confirmaPassword"
                placeholder="Confirme sua senha"
                value={formData.confirmaPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </fieldset>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Já tem conta? Fazer login</Link>
        </div>

        <div className="auth-back">
          <Link to="/">← Voltar para home</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
