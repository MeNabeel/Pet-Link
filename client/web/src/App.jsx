import React, { useState } from 'react';
import Splash from './pages/Splash';
import LoginSignup from './pages/LoginSignup';

function App() {
  const [screen, setScreen] = useState('splash');

  return (
    <div className="App">
      {screen === 'splash' && (
        <Splash onProceed={() => setScreen('auth')} />
      )}
      {screen === 'auth' && (
        <LoginSignup />
      )}
    </div>
  );
}

export default App;
