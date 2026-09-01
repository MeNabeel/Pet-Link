import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function AccountSettings({ user, onSave, onCancel }) {
  const [name, setName] = useState(user.name || '');
  const [username, setUsername] = useState(user.username || '');
  const [recoveryEmail, setRecoveryEmail] = useState(user.recoveryEmail || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [gender, setGender] = useState(user.gender || 'male');
  const [dob, setDob] = useState(user.dob || '');
  const [address, setAddress] = useState(user.address || '');
  const [city, setCity] = useState(user.city || '');
  const [province, setProvince] = useState(user.province || '');
  const [country, setCountry] = useState(user.country || '');
  const [bio, setBio] = useState(user.bio || '');

  const [saving, setSaving] = useState(false);

  const validateAndSubmit = () => {
    if (!name) {
      Alert.alert("Error", "Full Name is required.");
      return;
    }

    if (recoveryEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recoveryEmail)) {
        Alert.alert("Error", "Please enter a valid recovery email address.");
        return;
      }
    }

    const pkPhoneRegex = /^((\+92)|(0092))?\s?3\d{2}\s?\d{7}$|^03\d{9}$/;
    if (!pkPhoneRegex.test(phone.replace(/[\s-]/g, ''))) {
      Alert.alert("Error", "Please enter a valid Pakistani mobile number.");
      return;
    }

    if (phone !== user.phone) {
      Alert.alert(
        "Verify Phone Number",
        "A verification SMS OTP code will be sent to confirm this number change. Proceed?",
        [
          { text: "Send SMS Verification", onPress: () => processSave() },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } else {
      processSave();
    }
  };

  const processSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave({
        ...user,
        name,
        username,
        recoveryEmail,
        phone,
        gender,
        dob,
        address,
        city,
        province,
        country,
        bio
      });
      setSaving(false);
    }, 1000);
  };

  const handleDeleteAccount = () => {
    Alert.alert("Delete Account", "This action is permanent and cannot be undone. Are you sure you want to delete your profile?", [
      { text: "Delete Permanently", style: "destructive", onPress: () => alert("Account deletion request submitted.") },
      { text: "Cancel", style: "cancel" }
    ]);
  };

  const formatRole = (roleKey) => {
    switch(roleKey) {
      case 'admin': return 'System Administrator';
      case 'shelter_provider': return 'Shelter Provider';
      case 'user':
      case 'buyer':
      case 'seller':
      default: return 'User';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Feather name="settings" size={20} color={COLORS.primary} />
          <Text style={styles.title}>Account Settings</Text>
        </View>

        {/* Full Name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <Feather name="user" size={16} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={COLORS.muted}
              value={name}
              onChangeText={setName}
              editable={!saving}
            />
          </View>
        </View>

        {/* Username */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputWrapper}>
            <Feather name="at-sign" size={16} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={COLORS.muted}
              value={username}
              onChangeText={setUsername}
              editable={!saving}
            />
          </View>
        </View>

        {/* Email - READ-ONLY */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Registered Email (Not Editable)</Text>
          <View style={[styles.inputWrapper, styles.readOnlyInput]}>
            <Feather name="mail" size={16} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: COLORS.muted }]}
              value={user.email}
              editable={false}
            />
          </View>
        </View>

        {/* Recovery Email */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Recovery Email</Text>
          <View style={styles.inputWrapper}>
            <Feather name="mail" size={16} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="recovery@example.com"
              placeholderTextColor={COLORS.muted}
              value={recoveryEmail}
              onChangeText={setRecoveryEmail}
              editable={!saving}
              keyboardType="email-address"
              autoCapitalize="none"
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
              value={phone}
              onChangeText={setPhone}
              editable={!saving}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Gender Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
              onPress={() => setGender('male')}
              disabled={saving}
            >
              <Text style={[styles.genderBtnText, gender === 'male' && styles.genderBtnTextActive]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
              onPress={() => setGender('female')}
              disabled={saving}
            >
              <Text style={[styles.genderBtnText, gender === 'female' && styles.genderBtnTextActive]}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'other' && styles.genderBtnActive]}
              onPress={() => setGender('other')}
              disabled={saving}
            >
              <Text style={[styles.genderBtnText, gender === 'other' && styles.genderBtnTextActive]}>Other</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date of Birth */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <View style={styles.inputWrapper}>
            <Feather name="calendar" size={16} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.muted}
              value={dob}
              onChangeText={setDob}
              editable={!saving}
            />
          </View>
        </View>

        {/* Bio */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Biography / About</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top', paddingLeft: 14 }]}
              placeholder="Tell us about yourself..."
              placeholderTextColor={COLORS.muted}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              editable={!saving}
            />
          </View>
        </View>

        {/* Address Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Street Address</Text>
          <View style={styles.inputWrapper}>
            <Feather name="map-pin" size={16} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Street Address"
              placeholderTextColor={COLORS.muted}
              value={address}
              onChangeText={setAddress}
              editable={!saving}
            />
          </View>
        </View>

        {/* City & Province row */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>City</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { paddingLeft: 14 }]}
                placeholder="City"
                placeholderTextColor={COLORS.muted}
                value={city}
                onChangeText={setCity}
                editable={!saving}
              />
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Province</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { paddingLeft: 14 }]}
                placeholder="Province"
                placeholderTextColor={COLORS.muted}
                value={province}
                onChangeText={setProvince}
                editable={!saving}
              />
            </View>
          </View>
        </View>

        {/* Country */}
        <View style={[styles.formGroup, { marginTop: 12 }]}>
          <Text style={styles.label}>Country</Text>
          <View style={styles.inputWrapper}>
            <Feather name="globe" size={16} color={COLORS.muted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Country"
              placeholderTextColor={COLORS.muted}
              value={country}
              onChangeText={setCountry}
              editable={!saving}
            />
          </View>
        </View>

        {/* System Information Card (Read-Only) */}
        <View style={styles.systemInfoCard}>
          <View style={styles.systemHeader}>
            <Feather name="shield" size={16} color={COLORS.primary} />
            <Text style={styles.systemTitle}>System Account Details</Text>
          </View>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>User ID</Text>
            <Text style={styles.systemValueMono}>{user._id || 'N/A'}</Text>
          </View>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>Role</Text>
            <Text style={styles.systemValue}>{formatRole(user.role)}</Text>
          </View>
          <View style={styles.systemRow}>
            <Text style={styles.systemLabel}>Account Created</Text>
            <Text style={styles.systemValue}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Text>
          </View>
          <View style={[styles.systemRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.systemLabel}>Account Status</Text>
            <Text style={[styles.systemValue, { color: '#16A34A', fontWeight: '700' }]}>Active | Verified</Text>
          </View>
        </View>

        {/* Save and Cancel buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={saving}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={validateAndSubmit} disabled={saving}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Details'}</Text>
          </TouchableOpacity>
        </View>

        {/* Delete account button */}
        <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteAccount} disabled={saving}>
          <Feather name="trash-2" size={16} color="#EF4444" style={styles.dangerBtnIcon} />
          <Text style={styles.dangerBtnText}>Delete User Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.native || StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.bgLight,
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
  },
  formGroup: {
    marginBottom: 14,
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
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.dark,
  },
  readOnlyInput: {
    backgroundColor: COLORS.bgLight,
    borderColor: COLORS.border,
  },
  genderContainer: {
    flexDirection: 'row',
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 3,
    backgroundColor: COLORS.white,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  genderBtnActive: {
    backgroundColor: COLORS.primary,
  },
  genderBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
  },
  genderBtnTextActive: {
    color: COLORS.white,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  systemInfoCard: {
    backgroundColor: COLORS.bgLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginTop: 18,
    marginBottom: 10,
  },
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  systemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.dark,
  },
  systemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.02)',
  },
  systemLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
  },
  systemValue: {
    fontSize: 12,
    color: COLORS.dark,
    fontWeight: '700',
  },
  systemValueMono: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: COLORS.muted,
    fontWeight: '500',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: COLORS.border,
    borderWidth: 1.5,
  },
  cancelBtnText: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1.5,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  dangerBtn: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 14,
  },
  dangerBtnText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
  dangerBtnIcon: {
    marginRight: 8,
  },
});
