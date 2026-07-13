import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/theme';

export default function Splash({ onProceed }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ display: 'flex', flex: 1, backgroundColor: COLORS.bgLight, alignItems: 'center', justifyContent: 'center' }}>
      <View style={styles.card}>
        <Image 
          source={require('../../assets/logo/logo.jpeg')} 
          style={styles.logo} 
        />
        <Text style={styles.title}>PetLink</Text>
        <Text style={styles.tagline}>
          Bringing paws and people together, one click at a time.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={onProceed}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footer}>Group ID: S26SE025 | UCP</Text>
      </View>
    </div>
  );
}

const styles = StyleSheet.native || StyleSheet.create({
  card: {
    maxWidth: 450,
    width: '90%',
    padding: 32,
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 22,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
    fontWeight: '500',
  },
  loader: {
    marginVertical: 12,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 36,
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
