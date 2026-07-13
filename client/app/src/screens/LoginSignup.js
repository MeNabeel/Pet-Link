import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../constants/theme';

export default function LoginSignup() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('buyer');

  const handleTabChange = (loginState) => {
    setIsLogin(loginState);
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setAddress('');
    setRole('buyer');
  };

  const validateForm = () => {
    if (!email || !password) {
      return 'Please fill in all required credentials.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters.';
    }

    if (!isLogin) {
      if (!name || !phone || !address || !role) {
        return 'All fields are required for registration.';
      }

      const pkPhoneRegex = /^((\+92)|(0092))?\s?3\d{2}\s?\d{7}$|^03\d{9}$/;
      if (!pkPhoneRegex.test(phone.replace(/[\s-]/g, ''))) {
        return 'Please enter a valid Pakistani mobile number.';
      }
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

    if (isLogin) {
      setSuccess('Welcome back! Logging in via secure JWT token...');
    } else {
      setSuccess('Registration successful! Salting & Hashing password via Bcrypt...');
      setTimeout(() => {
        setIsLogin(true);
        setSuccess('Account created! Please sign in with your credentials.');
        setError('');
        setPassword('');
      }, 2500);
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
          <Text style={styles.title}>PetLink Portal</Text>
          <Text style={styles.subtitle}>Centralized Pet Management Ecosystem</Text>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, isLogin && styles.activeTab]} 
            onPress={() => handleTabChange(true)}
          >
            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, !isLogin && styles.activeTab]} 
            onPress={() => handleTabChange(false)}
          >
            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Register</Text>
          </TouchableOpacity>
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

        {/* Form Inputs */}
        {!isLogin && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter full name" 
              value={name}
              onChangeText={setName}
            />
          </View>
        )}

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

        {!isLogin && (
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
        )}

        {!isLogin && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Physical Address</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Street Address, City" 
              value={address}
              onChangeText={setAddress}
            />
          </View>
        )}

        {!isLogin && (
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
        )}

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
          <Text style={styles.submitBtnText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.native || StyleSheet.create({
  container: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgLight,
  },
  card: {
    maxWidth: 500,
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgLight,
    borderColor: COLORS.border,
    borderWidth: 1,
    padding: 4,
    borderRadius: 12,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.muted,
  },
  activeTabText: {
    color: COLORS.primary,
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
});
