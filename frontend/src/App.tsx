import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { CandidatosList } from './components/CandidatosList';
import { CandidatoDetail } from './components/CandidatoDetail';
import { EmpleadosList } from './components/EmpleadosList';
import { EmpleadoDetail } from './components/EmpleadoDetail';
import { EmpleadoFormWrapper } from './components/EmpleadoFormWrapper';
import { HireCandidatoWrapper } from './components/HireCandidatoWrapper';
import { Configuracion } from './components/Configuracion';
import { PuestosPage } from './components/PuestosPage';
import { CandidatoFormWrapper } from './components/CandidatoFormWrapper';
import { Layout } from './components/Layout';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="App">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              {/* Candidatos routes */}
              <Route path="/candidatos" element={<ProtectedRoute><Layout><CandidatosList /></Layout></ProtectedRoute>} />
              <Route path="/candidatos/:id" element={<ProtectedRoute><Layout><CandidatoDetail /></Layout></ProtectedRoute>} />
              <Route path="/candidatos/nuevo" element={<ProtectedRoute><Layout><CandidatoFormWrapper /></Layout></ProtectedRoute>} />
              <Route path="/candidatos/buscar" element={<ProtectedRoute><Layout><div>Búsqueda (Coming Soon)</div></Layout></ProtectedRoute>} />
              {/* Empleados routes */}
              <Route path="/empleados" element={<ProtectedRoute><Layout><EmpleadosList /></Layout></ProtectedRoute>} />
              <Route path="/empleados/:id" element={<ProtectedRoute><Layout><EmpleadoDetail /></Layout></ProtectedRoute>} />
              <Route path="/empleados/nuevo" element={<ProtectedRoute><Layout><EmpleadoFormWrapper /></Layout></ProtectedRoute>} />
              <Route path="/empleados/:id/editar" element={<ProtectedRoute><Layout><EmpleadoFormWrapper /></Layout></ProtectedRoute>} />
              <Route path="/candidatos/:id/contratar" element={<ProtectedRoute><Layout><HireCandidatoWrapper /></Layout></ProtectedRoute>} />
              
              <Route path="/puestos" element={<ProtectedRoute><Layout><PuestosPage /></Layout></ProtectedRoute>} />
              <Route path="/reportes" element={<ProtectedRoute><Layout><div>Reportes (Coming Soon)</div></Layout></ProtectedRoute>} />
              <Route path="/configuracion" element={<ProtectedRoute><Layout><Configuracion /></Layout></ProtectedRoute>} />
            </Routes>
            
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </AuthProvider>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
