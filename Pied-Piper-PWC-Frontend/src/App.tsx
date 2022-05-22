import React, { useState } from 'react';
import {
  Routes, Route, useLocation, Navigate,
} from 'react-router-dom';
import useTheme from '@mui/material/styles/useTheme';
import LoginPage from './containers/Login';
import Dashboard from './containers/Dashboard';
import QuarantineViewer from './containers/QuarantineViewer';
import AlgorithmTesting from './containers/AlgorithmTesting';
import AlgorithmSettings from './containers/AlgorithmSettings';
import MenuAppBar from './components/MenuAppBar';
// import jwt_decode from 'jwt-decode';
import { StateSetterType } from './utilities/interfaces/Emails';
import { setAuthHeader } from './services/httpService';

type RequireAuthProps = {
  children: JSX.Element;
  account: boolean; // TODO change from boolean once backend has endpoint
  setAccount: StateSetterType<boolean>;
};
function RequireAuth(props: RequireAuthProps): JSX.Element {
  const { children, account, setAccount } = props;
  const location = useLocation();
  const existingSession = localStorage.getItem('jwtTokenCybermail');

  if (!account) {
    if (existingSession) {
      setAuthHeader(existingSession);
      setAccount(true);
    } else {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  return children;
}

function App(): JSX.Element {
  const [account, setAccount] = useState(false);
  const theme = useTheme();

  return (
    <div className="app-container">
      {account ? <MenuAppBar setAccount={setAccount} /> : null}
      <div style={theme.mixins.toolbar} />

      <Routes>
        <Route path="/login" element={<LoginPage setAccount={setAccount} />} />
        <Route
          path="/"
          element={(
            <RequireAuth account={account} setAccount={setAccount}>
              <Dashboard />
            </RequireAuth>
          )}
        />
        <Route
          path="/dashboard"
          element={(
            <RequireAuth account={account} setAccount={setAccount}>
              <Dashboard />
            </RequireAuth>
          )}
        />
        <Route
          path="/view"
          element={(
            <RequireAuth account={account} setAccount={setAccount}>
              <QuarantineViewer />
            </RequireAuth>
          )}
        />
        <Route
          path="/view/:id"
          element={(
            <RequireAuth account={account} setAccount={setAccount}>
              <QuarantineViewer />
            </RequireAuth>
          )}
        />
        <Route
          path="/test/*"
          element={(
            <RequireAuth account={account} setAccount={setAccount}>
              <AlgorithmTesting />
            </RequireAuth>
          )}
        />
        <Route
          path="/settings/*"
          element={(
            <RequireAuth account={account} setAccount={setAccount}>
              <AlgorithmSettings />
            </RequireAuth>
          )}
        />
      </Routes>
    </div>
  );
}

export default App;
