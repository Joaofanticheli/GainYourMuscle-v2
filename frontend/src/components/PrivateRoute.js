// ============================================================================
// COMPONENTE PRIVATE ROUTE - Proteção de Rotas
// ============================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
