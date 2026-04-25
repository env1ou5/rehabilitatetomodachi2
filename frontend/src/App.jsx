import { useState, useEffect } from 'react';
import { auth } from './api';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  const [token, setToken] = useState(() => auth.getToken());

  useEffect(() => {
    const onStorage = () => setToken(auth.getToken());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogin = (newToken) => {
    auth.setToken(newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    auth.clear();
    setToken(null);
  };

  return token
    ? <Dashboard onLogout={handleLogout} />
    : <Login onAuthenticated={handleLogin} />;
}
