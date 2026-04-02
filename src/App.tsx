import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Pages Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminScolarite from './pages/admin/Scolarite';
import AdminAccounting from './pages/admin/Accounting';
import AdminCanteen from './pages/admin/Canteen';
import AdminStore from './pages/admin/Store';
import AdminLibrary from './pages/admin/Library';
import AdminTransport from './pages/admin/Transport';
import AdminCommunication from './pages/admin/Communication';
import AdminSettings from './pages/admin/Settings';

import Login from './pages/auth/Login';
import EnseignantDashboard from './pages/enseignant/Dashboard';
import ParentDashboard from './pages/parent/Dashboard';
import EleveDashboard from './pages/eleve/Dashboard';
import EleveLanding from './pages/EleveLanding';
import ParentLanding from './pages/ParentLanding';
import EmployeLanding from './pages/EmployeLanding';
import AdminLanding from './pages/AdminLanding';
import Landing from './pages/Landing';

// Composants partagés
import ProtectedRoute from './components/shared/ProtectedRoute';

// Layouts
import Layout from './components/layout/Layout';
import { useLocation } from 'react-router-dom';

// Composant de page d'erreur 404
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
      <button 
        onClick={() => window.history.back()}
        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
      >
        Retour
      </button>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Route publique - Login */}
          <Route path="/login" element={<Login />} />
          <Route path="/eleve/landing" element={<EleveLanding />} />
          <Route path="/parent/landing" element={<ParentLanding />} />
          <Route path="/employe/landing" element={<EmployeLanding />} />
          <Route path="/admin/landing" element={<AdminLanding />} />
          
          {/* Routes protégées - Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <LayoutRoutes role="admin" />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="utilisateurs" element={<AdminUsers />} />
            <Route path="scolarite" element={<AdminScolarite />} />
            <Route path="comptabilite" element={<AdminAccounting />} />
            <Route path="cantine" element={<AdminCanteen />} />
            <Route path="superette" element={<AdminStore />} />
            <Route path="bibliotheque" element={<AdminLibrary />} />
            <Route path="transport" element={<AdminTransport />} />
            <Route path="communication" element={<AdminCommunication />} />
            <Route path="administration" element={<AdminSettings />} />
          </Route>
          
          {/* Routes protégées - Enseignant */}
          <Route path="/enseignant" element={
            <ProtectedRoute allowedRoles={['enseignant']}>
              <LayoutRoutes role="enseignant" />
            </ProtectedRoute>
          }>
            <Route index element={<EnseignantDashboard />} />
            <Route path="dashboard" element={<EnseignantDashboard />} />
          </Route>
          
          {/* Routes protégées - Parent */}
          <Route path="/parent" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <LayoutRoutes role="parent" />
            </ProtectedRoute>
          }>
            <Route index element={<ParentDashboard />} />
            <Route path="dashboard" element={<ParentDashboard />} />
          </Route>
          
          {/* Routes protégées - Élève */}
          <Route path="/eleve" element={
            <ProtectedRoute allowedRoles={['eleve']}>
              <LayoutRoutes role="eleve" />
            </ProtectedRoute>
          }>
            <Route index element={<EleveDashboard />} />
            <Route path="dashboard" element={<EleveDashboard />} />
          </Route>
          
          {/* Route par défaut - Redirection vers login */}
          <Route path="/" element={<Landing />} />
          
          {/* Route 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

// Composant interne pour gérer les routes avec layout
interface LayoutRoutesProps {
  role: 'admin' | 'enseignant' | 'parent' | 'eleve';
}

const LayoutRoutes: React.FC<LayoutRoutesProps> = ({ role }) => {
  const { user } = useAuthStore();
  const location = useLocation();
  
  // Extraire la page actuelle de l'URL pour la sidebar
  const pathParts = location.pathname.split('/');
  const currentPage = pathParts[pathParts.length - 1] || 'dashboard';

  const getPageConfig = () => {
    switch (role) {
      case 'admin':
        const adminPages: Record<string, { title: string; subtitle: string }> = {
          'dashboard': { title: 'Tableau de bord', subtitle: `Bienvenue, ${user?.firstName} !` },
          'utilisateurs': { title: 'Gestion des Utilisateurs', subtitle: 'Gérez les élèves, enseignants et le personnel' },
          'scolarite': { title: 'Scolarité', subtitle: 'Organisation des classes et inscriptions' },
          'comptabilite': { title: 'Comptabilité', subtitle: 'Suivi financier et encaissements' },
          'cantine': { title: 'Cantine Scolaire', subtitle: 'Gestion des menus et planification' },
          'superette': { title: 'Supérette', subtitle: 'Inventaire et ventes de fournitures' },
          'bibliotheque': { title: 'Bibliothèque', subtitle: 'Catalogue et gestion des emprunts' },
          'transport': { title: 'Transport Scolaire', subtitle: 'Gestion des lignes et des bus' },
          'communication': { title: 'Communication', subtitle: 'Messagerie et annonces globales' },
          'administration': { title: 'Administration', subtitle: 'Configuration système et sécurité' },
        };
        return adminPages[currentPage] || adminPages['dashboard'];
      
      case 'enseignant': return { title: 'Espace Enseignant', subtitle: `Bonjour, ${user?.firstName} !` };
      case 'parent': return { title: 'Espace Parent', subtitle: `Bienvenue, M. ${user?.lastName}` };
      case 'eleve': return { title: 'Espace Élève', subtitle: `Content de te revoir, ${user?.firstName} !` };
      default: return { title: 'Espace EIEF', subtitle: '' };
    }
  };

  const { title, subtitle } = getPageConfig();

  return (
    <Layout
      userRole={role}
      userName={user ? `${user.firstName} ${user.lastName}` : ''}
      currentPage={currentPage}
      title={title}
      subtitle={subtitle}
    />
  );
};


export default App;
