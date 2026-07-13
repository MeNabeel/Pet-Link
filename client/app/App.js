import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Splash from './src/screens/Splash';
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import { COLORS } from './src/constants/theme';

export default function App() {
  const [screen, setScreen] = useState('splash');

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
});
