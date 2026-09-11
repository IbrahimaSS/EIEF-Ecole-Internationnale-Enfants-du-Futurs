import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';
import { LoadingScreen } from '../ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  redirectTo = '/login'
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading, isInitialized } = useAuthStore();

  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    const roleRedirectMap: Record<UserRole, string> = {
      admin: '/admin/dashboard',
      enseignant: '/enseignant/dashboard',
      parent: '/parent/dashboard',
      eleve: '/eleve/dashboard',
      comptable: '/comptable/dashboard',
      coordinator: '/coordinator/dashboard',
      surveillant: '/surveillant/dashboard',
      superadmin: '/superadmin/dashboard',
    };
    
    return (
      <Navigate 
        to={roleRedirectMap[user.role]} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
