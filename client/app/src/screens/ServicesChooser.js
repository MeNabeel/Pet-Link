import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ServicesChooser({ onNavigate }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PetLink Services</Text>
        <Text style={styles.subtitle}>Select a pet service category below</Text>
      </View>

      <View style={styles.cardContainer}>
        {/* Card 1: Vets */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => onNavigate('findClinics')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#FEF2F2' }]}>
            <Feather name="activity" size={32} color="#EF4444" />
          </View>
          <Text style={styles.cardTitle}>Veterinary Clinics</Text>
          <Text style={styles.cardDesc}>Locate nearby pet clinics, check operating hours, and request appointments.</Text>
        </TouchableOpacity>

        {/* Card 2: Boarding */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => onNavigate('findShelters')}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
            <Feather name="home" size={32} color="#16A34A" />
          </View>
          <Text style={styles.cardTitle}>Boarding Shelters</Text>
          <Text style={styles.cardDesc}>Board your pets with verified temporary shelter hosts while away.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
    justifyContent: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 40
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A'
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6
  },
  cardContainer: {
    gap: 20
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18
  }
});
