import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/auth';

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
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
      manager: '/manager/dashboard'
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
