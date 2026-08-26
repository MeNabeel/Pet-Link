import API_URL from '../config';
import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, address, role, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess('Account created successfully! Auto-authenticating...');
      if (onSignupSuccess) {
        setTimeout(() => {
          onSignupSuccess(data);
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Network error or server inactive.');
    } finally {
      setSubmitting(false);
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
        {/* Top Header */}
        <View style={styles.header}>
          <Image source={require('../../assets/logo/logo.jpeg')} style={styles.logo} />
          <Text style={styles.title}>Register</Text>
          <Text style={styles.subtitle}>Create your centralized PetLink account</Text>
        </View>

        {error ? (
          <View style={styles.errorAlert}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={styles.successAlert}>
            <Text style={styles.successText}>✨ {success}</Text>
          </View>
        ) : null}

        {/* Full Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Feather name="user" size={16} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Enter full name" 
              placeholderTextColor={COLORS.muted}
              value={name}
              onChangeText={setName}
              editable={!submitting}
            />
          </View>
        </View>

        {/* Email Address */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Feather name="mail" size={16} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="name@example.com" 
              placeholderTextColor={COLORS.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!submitting}
            />
          </View>
        </View>

        {/* Phone Number */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWrapper}>
            <Feather name="phone" size={16} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="03xxxxxxxxx" 
              placeholderTextColor={COLORS.muted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              editable={!submitting}
            />
          </View>
        </View>

        {/* Physical Address */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Physical Address</Text>
          <View style={styles.inputWrapper}>
            <Feather name="map-pin" size={16} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput 
              style={styles.input} 
              placeholder="Street address, City" 
              placeholderTextColor={COLORS.muted}
              value={address}
              onChangeText={setAddress}
              editable={!submitting}
            />
          </View>
        </View>

        {/* Role Selector Grid */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Select Your Role</Text>
          <View style={styles.roleGrid}>
            {roles.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[styles.roleBtn, role === item.value && styles.roleBtnSelected]}
                onPress={() => setRole(item.value)}
                disabled={submitting}
              >
                <Text style={[styles.roleBtnText, role === item.value && styles.roleBtnTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Password */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <Feather name="lock" size={16} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput 
              style={styles.passwordInput} 
              placeholder="Enter password" 
              placeholderTextColor={COLORS.muted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              editable={!submitting}
            />
            <TouchableOpacity 
              style={styles.eyeBtn} 
              onPress={() => setShowPassword(!showPassword)}
              disabled={submitting}
            >
              <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={COLORS.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.submitBtnText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Footer Navigation */}
        <TouchableOpacity style={styles.footerLink} onPress={onNavigateToLogin} disabled={submitting}>
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
    maxWidth: 440,
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    shadowColor: '#111827',
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
    width: 50,
    height: 50,
    borderRadius: 12,
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
    textAlign: 'center',
  },
  errorAlert: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
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
    marginBottom: 18,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    paddingLeft: 14,
    color: COLORS.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
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
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.dark,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  footerLink: {
    marginTop: 18,
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
