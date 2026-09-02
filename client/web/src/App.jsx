import React, { useState, useEffect } from 'react';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';

import { safeSetUserStorage } from './utils/storage';

function App() {
  const [screen, setScreen] = useState('splash');
  const [user, setUser] = useState(null);

  // Auto-restore session from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setScreen('dashboard');
      } catch (e) {
        console.error('Error parsing session user:', e);
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    safeSetUserStorage(userData);
    setScreen('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setScreen('login');
  };

  return (
    <div className="App">
      {screen === 'splash' && (
        <Splash onProceed={() => setScreen('login')} />
      )}
      
      {screen === 'login' && (
        <Login 
          onNavigateToSignup={() => setScreen('signup')} 
          onNavigateToForgot={() => setScreen('forgot')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      
      {screen === 'signup' && (
        <Signup 
          onNavigateToLogin={() => setScreen('login')} 
          onSignupSuccess={handleLoginSuccess}
        />
      )}
      
      {screen === 'forgot' && (
        <ForgotPassword 
          onNavigateToLogin={() => setScreen('login')}
        />
      )}

      {screen === 'dashboard' && (
        <Dashboard 
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
