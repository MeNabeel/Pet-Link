import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Splash from './src/screens/Splash';
import LoginSignup from './src/screens/LoginSignup';
import { COLORS } from './src/constants/theme';

export default function App() {
  const [screen, setScreen] = useState('splash');

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {screen === 'splash' && (
        <Splash onProceed={() => setScreen('auth')} />
      )}
      {screen === 'auth' && (
        <LoginSignup />
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
