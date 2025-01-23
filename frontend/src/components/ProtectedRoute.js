import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  useEffect(() => {
  }, [isAuthenticated]);
  if (loading) {
    return <div>Loading...</div>;  
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
