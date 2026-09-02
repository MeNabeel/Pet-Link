import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  ActivityIndicator, Image, Alert, Platform 
} from 'react-native';
import { COLORS } from '../constants/theme';

export default function ShelterDetails({ user, shelterId, onBack }) {
  const [shelter, setShelter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPets, setUserPets] = useState([]);

  // Booking form states
  const [isBookModalVisible, setIsBookModalVisible] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/shelter/public/${shelterId}`);
      if (res.ok) {
        const data = await res.json();
        setShelter(data);
      }
    } catch (err) {
      console.log('Error fetching shelter details on mobile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPets = async () => {
    if (!user || !user._id) return;
    try {
      const res = await fetch(`${API_URL}/api/pets/owner/${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setUserPets(data);
        if (data.length > 0) {
          setSelectedPetId(data[0]._id);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchUserPets();
  }, [shelterId]);

  const handleBookingRequest = async () => {
    if (!selectedPetId || !checkInDate || !checkOutDate) {
      Alert.alert('Validation Error', 'Please select a pet and check-in/out dates.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        shelterId: shelter.id,
        petId: selectedPetId,
        checkInDate: new Date(checkInDate).toISOString(),
        checkOutDate: new Date(checkOutDate).toISOString(),
        duration: 1, // simplified on mobile
        pickupOption: 'No Pickup',
        specialInstructions,
        totalAmount: shelter.dailyRate || 1000
      };

      const res = await fetch(`${API_URL}/api/shelter/public/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Alert.alert('Success', 'Lodging request submitted! The shelter manager will review.');
        setIsBookModalVisible(false);
        setCheckInDate('');
        setCheckOutDate('');
        setSpecialInstructions('');
        fetchDetails();
      } else {
        const err = await res.json();
        Alert.alert('Error', err.message || 'Failed to submit request.');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred during booking request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!shelter) return null;

  const spacesAvailable = Math.max(0, shelter.capacity - shelter.occupiedSpaces);

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Banner */}
        <Image 
          source={{ uri: shelter.logo || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=320' }} 
          style={styles.bannerImage} 
        />
        <TouchableOpacity style={styles.btnBack} onPress={onBack}>
          <Feather name="arrow-left" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.infoWrapper}>
          <Text style={styles.name}>{shelter.name}</Text>
          <Text style={styles.location}>
            <Feather name="map-pin" size={12} /> {shelter.address}, {shelter.city}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.spacesText}>Spaces Available: {spacesAvailable}</Text>
            <Text style={styles.priceText}>{shelter.dailyRate} PKR/day</Text>
          </View>

          <Text style={styles.sectionTitle}>About The Shelter</Text>
          <Text style={styles.description}>{shelter.description || 'No description available.'}</Text>

          <Text style={styles.sectionTitle}>Facilities</Text>
          <View style={styles.facilitiesRow}>
            {shelter.facilities?.map(f => (
              <View key={f} style={styles.facilityBadge}>
                <Text style={styles.facilityText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer booking trigger */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.btnBook, spacesAvailable === 0 && { backgroundColor: '#94A3B8' }]}
          disabled={spacesAvailable === 0}
          onPress={() => setIsBookModalVisible(true)}
        >
          <Text style={styles.btnBookText}>
            {spacesAvailable > 0 ? 'Request Lodging' : 'Fully Booked'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Simple Booking modal */}
      <Modal visible={isBookModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Stay Lodging Details</Text>
              <TouchableOpacity onPress={() => setIsBookModalVisible(false)}>
                <Feather name="x" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Select Your Pet</Text>
              {userPets.map(p => (
                <TouchableOpacity 
                  key={p._id} 
                  style={[styles.petBtn, selectedPetId === p._id && styles.petBtnActive]}
                  onPress={() => setSelectedPetId(p._id)}
                >
                  <Text style={[styles.petBtnText, selectedPetId === p._id && styles.petBtnTextActive]}>
                    {p.name} ({p.breed})
                  </Text>
                </TouchableOpacity>
              ))}

              <Text style={styles.label}>Check-in Date (YYYY-MM-DD)</Text>
              <TextInput style={styles.modalInput} value={checkInDate} onChangeText={setCheckInDate} placeholder="e.g. 2026-09-01" />

              <Text style={styles.label}>Check-out Date (YYYY-MM-DD)</Text>
              <TextInput style={styles.modalInput} value={checkOutDate} onChangeText={setCheckOutDate} placeholder="e.g. 2026-09-07" />

              <Text style={styles.label}>Special Requirements</Text>
              <TextInput 
                style={[styles.modalInput, { height: 60 }]} 
                value={specialInstructions} 
                onChangeText={setSpecialInstructions} 
                placeholder="Allergies, diet instructions..."
                multiline
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnConfirm} onPress={handleBookingRequest} disabled={submitting}>
                <Text style={styles.btnConfirmText}>{submitting ? 'Submitting...' : 'Confirm Stay Request'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bannerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover'
  },
  btnBack: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    padding: 8,
    borderRadius: 99
  },
  infoWrapper: {
    padding: 20
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A'
  },
  location: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8
  },
  spacesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981'
  },
  priceText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 8
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569'
  },
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  facilityBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  facilityText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500'
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF'
  },
  btnBook: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnBookText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end'
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '75%',
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A'
  },
  modalBody: {
    flex: 1
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 12,
    marginBottom: 6
  },
  petBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    marginBottom: 8
  },
  petBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: COLORS.primary
  },
  petBtnText: {
    fontSize: 13,
    color: '#1E293B'
  },
  petBtnTextActive: {
    fontWeight: 'bold',
    color: COLORS.primary
  },
  modalInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    marginBottom: 8
  },
  modalFooter: {
    paddingTop: 12
  },
  btnConfirm: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnConfirmText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14
  }
});
