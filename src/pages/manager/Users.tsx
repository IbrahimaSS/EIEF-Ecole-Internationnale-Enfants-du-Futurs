// src/pages/manager/Users.tsx
// Vue Utilisateurs pour les managers (rôle STAFF).
// Réutilise le composant admin Users.tsx mais masque l'onglet "Employés"
// (administrateurs, comptables, autres managers) — seul l'admin gère ces rôles.

import React from 'react';
import AdminUsers from '../admin/Users';

const ManagerUsers: React.FC = () => <AdminUsers hideEmployeesTab />;

export default ManagerUsers;
