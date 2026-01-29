// src/components/Shared/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Authentication/Auth';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;