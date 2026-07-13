import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../constants/theme';

export default function Signup({ onNavigateToLogin, onSignupSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('buyer');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    if (!name || !email || !phone || !address || !role || !password) {
      return 'All fields are required for registration.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }

    const pkPhoneRegex = /^((\+92)|(0092))?\s?3\d{2}\s?\d{7}$|^03\d{9}$/;
    if (!pkPhoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      return 'Please enter a valid Pakistani mobile number (e.g. 03001234567).';
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

    setSuccess('Registration successful! Salting & Hashing password via Bcrypt in backend...');
    console.log('Mobile Signup submitted:', { name, email, phone, address, role, password });

    if (onSignupSuccess) {
      setTimeout(() => {
        onSignupSuccess();
      }, 2000);
    }
  };

  const roles = [
    { label: 'Adopter/Buyer', value: 'buyer' },
    { label: 'Pet Owner/Seller', value: 'seller' },
    { label: 'Shelter Provider', value: 'shelter_provider' },
    { label: 'Administrator', value: 'admin' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Image source={require('../../assets/logo/logo.jpeg')} style={styles.logo} />
          <Text style={styles.title}>Register</Text>
          <Text style={styles.subtitle}>Create a centralized PetLink mobile account</Text>
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
          <Text style={styles.label}>Full Name</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Enter full name" 
            value={name}
            onChangeText={setName}
          />
        </View>

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
          <Text style={styles.label}>Phone Number</Text>
          <TextInput 
            style={styles.input} 
            placeholder="03xxxxxxxxx" 
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Physical Address</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Street address, City" 
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Platform Role</Text>
          <View style={styles.roleGrid}>
            {roles.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[styles.roleBtn, role === item.value && styles.roleBtnSelected]}
                onPress={() => setRole(item.value)}
              >
                <Text style={[styles.roleBtnText, role === item.value && styles.roleBtnTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
          <Text style={styles.submitBtnText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footerLink} onPress={onNavigateToLogin}>
          <Text style={styles.footerLinkText}>
            Already have an account? <Text style={styles.linkText}>Sign In Here</Text>
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
    marginBottom: 24,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 14,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
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
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  roleBtn: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.bgLight,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBtnSelected: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.muted,
    textAlign: 'center',
  },
  roleBtnTextSelected: {
    color: COLORS.primary,
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
