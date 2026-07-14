import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/theme';

export default function Profile({ user, onNavigateToSettings, onLogout, onUpdateUser }) {
  if (!user) return null;

  const handleEditPic = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Sorry, we need camera roll permissions to change your profile picture!");
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && onUpdateUser) {
      onUpdateUser({ ...user, profilePic: result.assets[0].uri });
    }
  };

  const handleEditCover = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Sorry, we need camera roll permissions to change your cover photo!");
      return;
    }
    
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && onUpdateUser) {
      onUpdateUser({ ...user, coverPhoto: result.assets[0].uri });
    }
  };

  const handleMenuClick = (title) => {
    Alert.alert(title, `Navigating to the ${title} screen... This is part of the Sprint deliverables.`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cover and Profile Pic Section */}
      <View style={styles.headerContainer}>
        {/* Cover Photo */}
        <TouchableOpacity style={styles.coverPhotoContainer} onPress={handleEditCover}>
          {user.coverPhoto ? (
            <Image source={{ uri: user.coverPhoto }} style={styles.coverPhoto} />
          ) : (
            <View style={styles.coverPlaceholder} />
          )}
          <View style={styles.coverEditOverlay}>
            <Feather name="camera" size={12} color={COLORS.white} />
            <Text style={styles.coverEditText}>Edit Cover</Text>
          </View>
        </TouchableOpacity>
        
        {/* Profile Picture with Edit Icon */}
        <View style={styles.profilePicContainer}>
          <Image 
            source={user.profilePic ? { uri: user.profilePic } : require('../../assets/logo/logo.jpeg')} 
            style={styles.profilePic} 
          />
          <TouchableOpacity style={styles.editPicBtn} onPress={handleEditPic}>
            <Feather name="camera" size={16} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.nameText}>{user.name}</Text>
        <Text style={styles.usernameText}>@{user.username || user.email.split('@')[0]}</Text>
        
        {user.bio ? (
          <Text style={styles.bioText}>{user.bio}</Text>
        ) : null}
      </View>

      {/* Basic Contact Info Header */}
      <View style={styles.contactCard}>
        <View style={styles.contactItem}>
          <Feather name="mail" size={14} color={COLORS.muted} />
          <Text style={styles.contactText}>{user.email}</Text>
        </View>
        <View style={[styles.contactItem, { borderLeftWidth: 1, borderLeftColor: COLORS.border }]}>
          <Feather name="phone" size={14} color={COLORS.muted} />
          <Text style={styles.contactText}>{user.phone}</Text>
        </View>
      </View>

      {/* Streamlined Menu Navigation List */}
      <Text style={styles.sectionTitle}>Profile Menu</Text>
      
      <View style={styles.menuCard}>
        {/* Row 1: Account Settings */}
        <TouchableOpacity style={styles.menuRow} onPress={onNavigateToSettings}>
          <View style={styles.menuLabelGroup}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(0, 102, 204, 0.08)' }]}>
              <Feather name="settings" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.menuTitle}>Account Settings</Text>
          </View>
          <Feather name="chevron-right" size={16} color={COLORS.muted} />
        </TouchableOpacity>

        {/* Row 2: My Orders */}
        <TouchableOpacity style={styles.menuRow} onPress={() => handleMenuClick('My Orders')}>
          <View style={styles.menuLabelGroup}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(22, 163, 74, 0.08)' }]}>
              <Feather name="shopping-bag" size={18} color="#16A34A" />
            </View>
            <Text style={styles.menuTitle}>My Orders</Text>
          </View>
          <Feather name="chevron-right" size={16} color={COLORS.muted} />
        </TouchableOpacity>

        {/* Row 3: Transaction History */}
        <TouchableOpacity style={styles.menuRow} onPress={() => handleMenuClick('Transaction History')}>
          <View style={styles.menuLabelGroup}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(234, 179, 8, 0.08)' }]}>
              <Feather name="credit-card" size={18} color="#EAB308" />
            </View>
            <Text style={styles.menuTitle}>Transaction History</Text>
          </View>
          <Feather name="chevron-right" size={16} color={COLORS.muted} />
        </TouchableOpacity>

        {/* Row 4: Support Helpdesk */}
        <TouchableOpacity style={styles.menuRow} onPress={() => handleMenuClick('Support Helpdesk')}>
          <View style={styles.menuLabelGroup}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.08)' }]}>
              <Feather name="help-circle" size={18} color="#8B5CF6" />
            </View>
            <Text style={styles.menuTitle}>Support & Helpdesk</Text>
          </View>
          <Feather name="chevron-right" size={16} color={COLORS.muted} />
        </TouchableOpacity>

        {/* Row 5: Log Out */}
        <TouchableOpacity style={[styles.menuRow, { borderBottomWidth: 0 }]} onPress={onLogout}>
          <View style={styles.menuLabelGroup}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.08)' }]}>
              <Feather name="log-out" size={18} color="#EF4444" />
            </View>
            <Text style={[styles.menuTitle, { color: '#EF4444' }]}>Log Out Session</Text>
          </View>
          <Feather name="chevron-right" size={16} color="#EF4444" />
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
  headerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    paddingBottom: 20,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  coverPhotoContainer: {
    width: '100%',
    height: 100,
    position: 'relative',
  },
  coverPhoto: {
    width: '100%',
    height: 100,
  },
  coverPlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.primary,
    opacity: 0.15,
  },
  coverEditOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coverEditText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
  },
  profilePicContainer: {
    position: 'relative',
    marginTop: -45,
    marginBottom: 10,
  },
  profilePic: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: COLORS.white,
    backgroundColor: COLORS.white,
  },
  editPicBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  nameText: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.dark,
  },
  usernameText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
    marginTop: 2,
  },
  bioText: {
    fontSize: 13,
    color: COLORS.darkLight,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
    lineHeight: 18,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    flexDirection: 'row',
    paddingVertical: 12,
    marginBottom: 20,
  },
  contactItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 12,
    color: COLORS.darkLight,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 12,
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgLight,
  },
  menuLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
  },
});
