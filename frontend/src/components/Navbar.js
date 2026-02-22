// ============================================================================
// COMPONENTE NAVBAR - Barra de Navegação
// ============================================================================

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'Home', icon: '🏠' },
    { to: '/meu-treino', label: 'Treino', icon: '💪' },
    { to: '/gerar-treino', label: 'Gerar', icon: '⚡' },
    { to: '/nutricao', label: 'Nutrição', icon: '🥗' },
    { to: '/duvidas', label: 'Dúvidas', icon: '💬' },
    { to: '/perfil', label: 'Perfil', icon: '👤' },
  ];

  return (
    <>
      {/* Navbar desktop (topo) */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-brand">
            <h1>GainYourMuscle 💪</h1>
          </Link>

          <ul className="navbar-menu">
            {navItems.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
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

      {/* Bottom nav mobile */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`bottom-nav-item ${location.pathname === item.to ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
