// ============================================================================
// APP PRINCIPAL - GainYourMuscle
// ============================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkoutGenerator from './pages/WorkoutGenerator';
import WorkoutManual from './pages/WorkoutManual';
import WorkoutView from './pages/WorkoutView';
import ForgotPassword from './pages/ForgotPassword';
import Perfil from './pages/Perfil';
import Progresso from './pages/Progresso';
import NutricaoPlanner from './pages/NutricaoPlanner';

// Estilos globais
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Rotas Privadas (precisam de autenticação) */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/gerar-treino"
              element={
                <PrivateRoute>
                  <WorkoutGenerator />
                </PrivateRoute>
              }
            />

            <Route
              path="/treino-manual"
              element={
                <PrivateRoute>
                  <WorkoutManual />
                </PrivateRoute>
              }
            />

            <Route
              path="/meu-treino"
              element={
                <PrivateRoute>
                  <WorkoutView />
                </PrivateRoute>
              }
            />

            <Route
              path="/treino-hoje"
              element={
                <PrivateRoute>
                  <WorkoutView />
                </PrivateRoute>
              }
            />

            <Route
              path="/perfil"
              element={
                <PrivateRoute>
                  <Perfil />
                </PrivateRoute>
              }
            />

            <Route
              path="/progresso"
              element={
                <PrivateRoute>
                  <Progresso />
                </PrivateRoute>
              }
            />

            <Route
              path="/nutricao"
              element={
                <PrivateRoute>
                  <NutricaoPlanner />
                </PrivateRoute>
              }
            />

            {/* Rota 404 - Redireciona para home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
