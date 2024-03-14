import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export function RequireAuth({ children }) {
  const location = useLocation();
  const user = useSelector((state) => state.authReducer.currentUser);

  if (!user) {
    return <Navigate to="/" state={{ from: location }} />;
  }

  return children;
}
