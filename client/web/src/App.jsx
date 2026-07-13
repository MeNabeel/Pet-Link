import React, { useState } from 'react';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  const [screen, setScreen] = useState('splash');

  return (
    <div className="App">
      {screen === 'splash' && (
        <Splash onProceed={() => setScreen('login')} />
      )}
      {screen === 'login' && (
        <Login 
          onNavigateToSignup={() => setScreen('signup')} 
          onLoginSuccess={() => alert('Successfully Logged In!')}
        />
      )}
      {screen === 'signup' && (
        <Signup 
          onNavigateToLogin={() => setScreen('login')} 
          onSignupSuccess={() => setScreen('login')}
        />
      )}
    </div>
  );
}

export default App;
