// ============================================================================
// PÁGINA DE CADASTRO DE PROFISSIONAL
// ============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Profissional.css';

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
      const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
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
    <div className="register-prof-container">
      <div className="register-prof-card">
        <h2>Cadastro Profissional</h2>
        <p className="subtitulo">
          Personal Trainer · Nutricionista · Psicólogo
        </p>

        <div className="aviso-pendente">
          Seu cadastro será analisado pela nossa equipe. Você terá acesso completo
          ao painel após a aprovação.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome completo *</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Seu nome completo"
            />
          </div>

          <div className="form-group">
            <label>E-mail *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="form-group">
            <label>Tipo de profissional *</label>
            <select name="tipo" value={form.tipo} onChange={handleChange}>
              <option value="">Selecione...</option>
              {TIPOS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Número de registro{tipoSelecionado ? ` (${tipoSelecionado.registro})` : ''} *
            </label>
            <input
              name="registro"
              value={form.registro}
              onChange={handleChange}
              placeholder={tipoSelecionado ? `Número do ${tipoSelecionado.registro}` : 'Selecione o tipo primeiro'}
              disabled={!form.tipo}
            />
          </div>

          <div className="form-group">
            <label>Especialidade</label>
            <input
              name="especialidade"
              value={form.especialidade}
              onChange={handleChange}
              placeholder="Ex: Musculação e emagrecimento"
            />
          </div>

          <div className="form-group">
            <label>Apresentação / Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Fale um pouco sobre você e sua experiência..."
            />
          </div>

          <div className="form-group">
            <label>Senha *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="form-group">
            <label>Confirmar senha *</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repita a senha"
            />
          </div>

          {erro && (
            <p style={{ color: '#e94560', fontSize: '0.88rem', marginBottom: '1rem' }}>
              {erro}
            </p>
          )}

          <button type="submit" className="btn-prof-primary" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Criar cadastro'}
          </button>
        </form>

        <p className="register-prof-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
          {' · '}
          <Link to="/register">Cadastro de usuário</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterProfissional;
