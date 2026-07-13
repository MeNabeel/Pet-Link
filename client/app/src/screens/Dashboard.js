import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function Dashboard({ user, onLogout }) {
  if (!user) return null;

  const handleAction = (title) => {
    alert(`Navigating to the ${title} module... Mapped in your SDS specifications.`);
  };

  const formatRole = (roleKey) => {
    switch(roleKey) {
      case 'admin': return 'System Administrator';
      case 'buyer': return 'Pet Buyer / Adopter';
      case 'seller': return 'Pet Owner / Seller';
      case 'shelter_provider': return 'Shelter Provider';
      default: return 'User';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Upper header profile */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <Image source={require('../../assets/logo/logo.jpeg')} style={styles.logo} />
          <View style={styles.profileText}>
            <Text style={styles.profileGreeting}>Welcome,</Text>
            <Text style={styles.profileName}>{user.name}</Text>
          </View>
        </View>
        <Text style={styles.profileRole}>{formatRole(user.role)}</Text>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>2</Text>
          <Text style={styles.metricLabel}>My Pets</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#16A34A' }]}>3</Text>
          <Text style={styles.metricLabel}>Listings</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: '#EAB308' }]}>1</Text>
          <Text style={styles.metricLabel}>Vaccines</Text>
        </View>
      </View>

      {/* Grid of actions */}
      <Text style={styles.sectionTitle}>Active Modules</Text>
      
      <View style={styles.grid}>
        <TouchableOpacity style={styles.gridCard} onPress={() => handleAction('Pet Manager')}>
          <Feather name="heart" size={24} color={COLORS.primary} style={styles.gridCardIcon} />
          <Text style={styles.gridCardTitle}>Manage Pets</Text>
          <Text style={styles.gridCardDesc}>Track vaccines & health records</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridCard} onPress={() => handleAction('Marketplace')}>
          <Feather name="shopping-bag" size={24} color="#16A34A" style={styles.gridCardIcon} />
          <Text style={styles.gridCardTitle}>Marketplace</Text>
          <Text style={styles.gridCardDesc}>Adopt or sell pets locally</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridCard} onPress={() => handleAction('Shelter Bookings')}>
          <Feather name="home" size={24} color="#EAB308" style={styles.gridCardIcon} />
          <Text style={styles.gridCardTitle}>Book Shelter</Text>
          <Text style={styles.gridCardDesc}>Arrange boarding for pets</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridCard} onPress={() => handleAction('AI Assistant')}>
          <Feather name="message-square" size={24} color="#8B5CF6" style={styles.gridCardIcon} />
          <Text style={styles.gridCardTitle}>AI Chatbot</Text>
          <Text style={styles.gridCardDesc}>Get instant veterinary tips</Text>
        </TouchableOpacity>
      </View>

      {/* Logout button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutBtnText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.native || StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLORS.bgLight,
    flexGrow: 1,
  },
  header: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  profileText: {
    flexDirection: 'column',
  },
  profileGreeting: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
  },
  profileRole: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: COLORS.primary,
    backgroundColor: 'rgba(0, 102, 204, 0.08)',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  gridCardIcon: {
    marginBottom: 8,
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 4,
  },
  gridCardDesc: {
    fontSize: 11,
    color: COLORS.muted,
    lineHeight: 14,
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    borderColor: COLORS.error,
    borderWidth: 1.5,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  logoutBtnText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: '700',
  },
});
