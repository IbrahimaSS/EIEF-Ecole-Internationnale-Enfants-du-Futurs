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
import AdminProfile from './pages/admin/Profile';

import Login from './pages/auth/Login';
import EnseignantDashboard from './pages/enseignant/Dashboard';
import EnseignantClasses from './pages/enseignant/Classes';
import EnseignantNotes from './pages/enseignant/Notes';
import EnseignantCommunication from './pages/enseignant/Communication';
import EnseignantRessources from './pages/enseignant/Ressources';
import EnseignantProfile from './pages/enseignant/Profile';
import EnseignantPreferences from './pages/enseignant/Preferences';
import ParentDashboard from './pages/parent/Dashboard';
import ParentEleves from './pages/parent/Eleves';
import ParentPaiements from './pages/parent/Paiements';
import ParentCommunication from './pages/parent/Communication';
import ParentProfile from './pages/parent/Profile';
import ParentPreferences from './pages/parent/Preferences';
import EleveDashboard from './pages/eleve/Dashboard';
import EleveNotes from './pages/eleve/Notes';
import EleveEmploi from './pages/eleve/Emploi';
import EleveRessources from './pages/eleve/Ressources';
import EleveCommunication from './pages/eleve/Communication';
import EleveProfile from './pages/eleve/Profile';
import ElevePreferences from './pages/eleve/Preferences';
import EleveLanding from './pages/EleveLanding';
import ParentLanding from './pages/ParentLanding';
import EmployeLanding from './pages/EmployeLanding';
import AdminLanding from './pages/AdminLanding';
import Accueil from './pages/Accueil';
import Programmes from './pages/Programmes';
import Admission from './pages/Admission';
import Contact from './pages/Contact';

// Composants partagés
import ProtectedRoute from './components/shared/ProtectedRoute';

// Layouts
import Layout from './components/layout/Layout';
import { useLocation } from 'react-router-dom';

// Composant de page d'erreur 404
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-semibold text-gray-900 mb-4">404</h1>
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
            <Route path="profil" element={<AdminProfile />} />
          </Route>
          
          {/* Routes protégées - Enseignant */}
          <Route path="/enseignant" element={
            <ProtectedRoute allowedRoles={['enseignant']}>
              <LayoutRoutes role="enseignant" />
            </ProtectedRoute>
          }>
            <Route index element={<EnseignantDashboard />} />
            <Route path="dashboard" element={<EnseignantDashboard />} />
            <Route path="classes" element={<EnseignantClasses />} />
            <Route path="notes" element={<EnseignantNotes />} />
            <Route path="communication" element={<EnseignantCommunication />} />
            <Route path="ressources" element={<EnseignantRessources />} />
            <Route path="profil" element={<EnseignantProfile />} />
            <Route path="preferences" element={<EnseignantPreferences />} />
          </Route>
          
          {/* Routes protégées - Parent */}
          <Route path="/parent" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <LayoutRoutes role="parent" />
            </ProtectedRoute>
          }>
            <Route index element={<ParentDashboard />} />
            <Route path="dashboard" element={<ParentDashboard />} />
            <Route path="eleves" element={<ParentEleves />} />
            <Route path="paiements" element={<ParentPaiements />} />
            <Route path="communication" element={<ParentCommunication />} />
            <Route path="profil" element={<ParentProfile />} />
            <Route path="preferences" element={<ParentPreferences />} />
          </Route>
          
          {/* Routes protégées - Élève */}
          <Route path="/eleve" element={
            <ProtectedRoute allowedRoles={['eleve']}>
              <LayoutRoutes role="eleve" />
            </ProtectedRoute>
          }>
            <Route index element={<EleveDashboard />} />
            <Route path="dashboard" element={<EleveDashboard />} />
            <Route path="notes" element={<EleveNotes />} />
            <Route path="emploi" element={<EleveEmploi />} />
            <Route path="ressources" element={<EleveRessources />} />
            <Route path="communication" element={<EleveCommunication />} />
            <Route path="profil" element={<EleveProfile />} />
            <Route path="preferences" element={<ElevePreferences />} />
          </Route>
          
          {/* Route par défaut - Accès public */}
          <Route path="/" element={<Accueil />} />
          <Route path="/programmes" element={<Programmes />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/contact" element={<Contact />} />
          
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
          'profil': { title: 'Profil Utilisateur', subtitle: 'Vos informations personnelles' },
        };
        return adminPages[currentPage] || adminPages['dashboard'];
      
      case 'enseignant':
        const teacherPages: Record<string, { title: string; subtitle: string }> = {
          'dashboard': { title: 'Espace Enseignant', subtitle: `Bonjour, ${user?.firstName} !` },
          'classes': { title: 'Mes Classes', subtitle: 'Gérez vos effectifs' },
          'notes': { title: 'Saisie des Notes', subtitle: 'Évaluations et bulletins' },
          'communication': { title: 'Communication', subtitle: 'Messagerie avec les élèves et parents' },
          'ressources': { title: 'Ressources Pédagogiques', subtitle: 'Exercices, TP, Sujets et Compositions' },
          'profil': { title: 'Mon Profil', subtitle: 'Gérez vos informations personnelles' },
          'preferences': { title: 'Mes Préférences', subtitle: 'Paramètres et notifications' },
        };
        return teacherPages[currentPage] || teacherPages['dashboard'];
      case 'parent':
        const parentPages: Record<string, { title: string; subtitle: string }> = {
          'dashboard': { title: 'Espace Parent', subtitle: `Bienvenue, M. ${user?.lastName}` },
          'eleves': { title: 'Mes Enfants', subtitle: 'Suivi scolaire et bulletins' },
          'paiements': { title: 'Finances & Paiements', subtitle: 'Gérez vos frais de scolarité' },
          'communication': { title: 'Communication', subtitle: 'Échangez avec l\'équipe pédagogique' },
          'profil': { title: 'Mon Profil', subtitle: 'Gérez vos informations' },
          'preferences': { title: 'Préférences', subtitle: 'Paramètres et notifications' },
        };
        return parentPages[currentPage] || parentPages['dashboard'];
      case 'eleve':
        const elevePages: Record<string, { title: string; subtitle: string }> = {
          'dashboard': { title: `Salut, ${user?.firstName} !`, subtitle: "C'est une belle journée pour apprendre." },
          'notes': { title: 'Mes Notes', subtitle: 'Consulte tes derniers résultats' },
          'emploi': { title: 'Emploi du Temps', subtitle: 'Ton planning de la semaine' },
          'ressources': { title: 'Ressources', subtitle: 'Accède à tes supports de cours' },
          'communication': { title: 'Communication', subtitle: 'Dispute avec tes profs et camardes' },
          'profil': { title: 'Mon Profil', subtitle: 'Vérifie tes informations' },
          'preferences': { title: 'Réglages', subtitle: 'Personnalise ton espace' },
        };
        return elevePages[currentPage] || elevePages['dashboard'];
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
