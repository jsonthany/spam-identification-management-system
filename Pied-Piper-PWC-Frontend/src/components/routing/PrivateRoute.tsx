import React from 'react';
import { Navigate } from 'react-router-dom';
import { FixMeLater } from '../../fixMeLater';

function PrivateRoute({ children }: FixMeLater): JSX.Element {
  const isAuthenticated = localStorage.getItem('jwtToken');

  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
