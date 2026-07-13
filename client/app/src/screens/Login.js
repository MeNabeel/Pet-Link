import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../constants/theme';

export default function Login({ onNavigateToSignup, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    if (!email || !password) {
      return 'Please enter both email and password.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return null;
  };

  const handleSubmit = () => {
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSuccess('Logging in... Authenticating JWT token from backend...');
    console.log('Mobile Login credentials submitted:', { email, password });

    if (onLoginSuccess) {
      setTimeout(() => {
        onLoginSuccess();
      }, 1500);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Image source={require('../../assets/logo/logo.jpeg')} style={styles.logo} />
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>Access your PetLink mobile account</Text>
        </View>

        {error ? (
          <View style={styles.errorAlert}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={styles.successAlert}>
            <Text style={styles.successText}>✅ {success}</Text>
          </View>
        ) : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput 
            style={styles.input} 
            placeholder="name@example.com" 
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.passwordInput} 
              placeholder="Enter password" 
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              style={styles.eyeBtn} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerLink} onPress={onNavigateToSignup}>
          <Text style={styles.footerLinkText}>
            Don't have an account? <Text style={styles.linkText}>Register Here</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.native || StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgLight,
    paddingVertical: 40,
  },
  card: {
    maxWidth: 450,
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  errorAlert: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '500',
  },
  successAlert: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  successText: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.darkLight,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.dark,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: COLORS.dark,
  },
  eyeBtn: {
    paddingHorizontal: 16,
  },
  eyeText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  footerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerLinkText: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
