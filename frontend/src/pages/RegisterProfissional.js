// ============================================================================
// PÁGINA DE CADASTRO DE PROFISSIONAL
// ============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';

const TIPOS = [
  { value: 'personal', label: 'Personal Trainer', registro: 'CREF' },
  { value: 'nutricionista', label: 'Nutricionista', registro: 'CRN' },
  { value: 'psicologo', label: 'Psicólogo', registro: 'CRP' },
];

const RegisterProfissional = () => {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipo: '',
    registro: '',
    bio: '',
    especialidade: '',
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const tipoSelecionado = TIPOS.find(t => t.value === form.tipo);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErro('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (!form.nome || !form.email || !form.password || !form.tipo || !form.registro) {
      setErro('Preencha todos os campos obrigatórios.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErro('As senhas não coincidem.');
      return;
    }

    if (form.password.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const API = process.env.REACT_APP_API_URL || 'https://gainyourmuscle-v2.onrender.com';
      const res = await fetch(`${API}/api/auth/register-profissional`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          password: form.password,
          tipo: form.tipo,
          registro: form.registro,
          bio: form.bio,
          especialidade: form.especialidade,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.message || 'Erro ao criar cadastro.');
        return;
      }

      localStorage.setItem('token', data.token);
      window.location.href = '/dashboard-profissional';
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box register-box">
        <h1 className="auth-title">GainYourMuscle</h1>
        <h2 className="auth-subtitle">Cadastro Profissional</h2>

        {erro && <div className="alert alert-error">{erro}</div>}

        <div className="alert alert-info" style={{ marginBottom: '1rem', fontSize: '0.88rem' }}>
          Seu cadastro sera analisado pela nossa equipe. Voce tera acesso completo apos a aprovacao.
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <fieldset className="form-fieldset">
            <legend>Dados Profissionais</legend>

            <div className="form-group">
              <label htmlFor="tipo">Tipo de profissional *</label>
              <select
                id="tipo"
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Selecione...</option>
                {TIPOS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="registro">
                Numero de registro{tipoSelecionado ? ` (${tipoSelecionado.registro})` : ''} *
              </label>
              <input
                type="text"
                id="registro"
                name="registro"
                placeholder={tipoSelecionado ? `Numero do ${tipoSelecionado.registro}` : 'Selecione o tipo primeiro'}
                value={form.registro}
                onChange={handleChange}
                required
                disabled={!form.tipo || loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="especialidade">Especialidade</label>
              <input
                type="text"
                id="especialidade"
                name="especialidade"
                placeholder="Ex: Musculacao e emagrecimento"
                value={form.especialidade}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Apresentacao / Bio</label>
              <textarea
                id="bio"
                name="bio"
                placeholder="Fale um pouco sobre voce e sua experiencia..."
                value={form.bio}
                onChange={handleChange}
                disabled={loading}
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
          </fieldset>

          <fieldset className="form-fieldset">
            <legend>Informacoes Pessoais</legend>

            <div className="form-group">
              <label htmlFor="nome">Nome completo *</label>
              <input
                type="text"
                id="nome"
                name="nome"
                placeholder="Seu nome completo"
                value={form.nome}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail *</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha *</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Minimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar senha *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Repita a senha"
                value={form.confirmPassword}
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
            {loading ? 'Cadastrando...' : 'Criar cadastro'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/login">Ja tem conta? Fazer login</Link>
          <Link to="/escolher-conta">&#8592; Voltar a escolha de conta</Link>
        </div>

        <div className="auth-back">
          <Link to="/">&#8592; Voltar para home</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterProfissional;
