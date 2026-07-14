import React, { useState, useEffect } from 'react';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';

function App() {
  const [screen, setScreen] = useState('splash');
  const [user, setUser] = useState(null);

  // Auto-restore session from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setScreen('dashboard');
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
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
