import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Splash from './src/screens/Splash';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import ForgotPassword from './src/screens/ForgotPassword';
import Dashboard from './src/screens/Dashboard';
import { COLORS } from './src/constants/theme';

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setScreen('login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
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
          user={user}
          onLogout={handleLogout}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
});
