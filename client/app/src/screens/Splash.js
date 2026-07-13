import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function Splash({ onProceed }) {
  return (
    <View style={styles.container}>
      {/* Upper content / Circular logo */}
      <View style={styles.content}>
        <View style={styles.logoRing}>
          <Image 
            source={require('../../assets/logo/logo.jpeg')} 
            style={styles.logo} 
          />
        </View>
        <Text style={styles.title}>PetLink</Text>
        <Text style={styles.tagline}>Your Pet's Complete Digital Companion</Text>
      </View>

      {/* Get Started Button at bottom */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={onProceed}>
          <Text style={styles.buttonText}>Get Started  →</Text>
        </TouchableOpacity>
        <Text style={styles.groupTag}>Group ID: S26SE025 | UCP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.native || StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: 24,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 18,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 20,
    fontWeight: '500',
  },
  footer: {
    width: '90%',
    maxWidth: 380,
    alignItems: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  groupTag: {
    marginTop: 20,
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
