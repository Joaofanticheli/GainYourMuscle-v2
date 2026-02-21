// ============================================================================
// COMPONENTE NAVBAR - Barra de Navegação
// ============================================================================

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <h1>GainYourMuscle 💪</h1>
        </Link>

        <ul className="navbar-menu">
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/meu-treino">Meu Treino</Link>
          </li>
          <li>
            <Link to="/gerar-treino">Gerar Treino</Link>
          </li>
          <li>
            <Link to="/treino-manual">Treino Manual</Link>
          </li>
          <li>
            <Link to="/progresso">Progresso</Link>
          </li>
          <li>
            <Link to="/perfil">Perfil</Link>
          </li>
          <li className="navbar-user">
            <span>Olá, {user?.nome}!</span>
          </li>
          <li>
            <button className="btn btn-logout" onClick={handleLogout}>
              Sair
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
