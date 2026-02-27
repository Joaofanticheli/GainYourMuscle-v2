// ============================================================================
// APP PRINCIPAL - GainYourMuscle
// ============================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import ResetPassword from './pages/ResetPassword';
import Perfil from './pages/Perfil';
import Progresso from './pages/Progresso';
import NutricaoPlanner from './pages/NutricaoPlanner';
import Duvidas from './pages/Duvidas';
import Psicologo from './pages/Psicologo';
import RegisterProfissional from './pages/RegisterProfissional';
import DashboardProfissional from './pages/DashboardProfissional';
import BuscarProfissional from './pages/BuscarProfissional';
import EscolherConta from './pages/EscolherConta';
import Anamnese from './pages/Anamnese';

// Estilos globais
import './App.css';

// Rota exclusiva para profissionais
const ProfissionalRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'profissional') return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/escolher-conta" element={<EscolherConta />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-profissional" element={<RegisterProfissional />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

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

            <Route
              path="/duvidas"
              element={
                <PrivateRoute>
                  <Duvidas />
                </PrivateRoute>
              }
            />

            <Route
              path="/psicologo"
              element={
                <PrivateRoute>
                  <Psicologo />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard-profissional"
              element={
                <ProfissionalRoute>
                  <DashboardProfissional />
                </ProfissionalRoute>
              }
            />

            <Route
              path="/profissionais"
              element={
                <PrivateRoute>
                  <BuscarProfissional />
                </PrivateRoute>
              }
            />

            <Route
              path="/minha-anamnese"
              element={
                <PrivateRoute>
                  <Anamnese />
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
