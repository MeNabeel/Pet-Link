import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  ActivityIndicator, Image, Modal, TextInput, Alert, Platform,
  Linking
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ClinicDetails({ user, clinicId, onBack }) {
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPets, setUserPets] = useState([]);

  // Booking states
  const [isBookModalVisible, setIsBookModalVisible] = useState(false);
  const [bookStep, setBookStep] = useState(1);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/clinics/${clinicId}`);
      if (res.ok) {
        const data = await res.json();
        setClinic(data);
        if (data.services?.length > 0) {
          setSelectedServiceId(data.services[0].id);
        }
        if (data.doctors?.length > 0) {
          setSelectedDoctorId(data.doctors[0].id);
        }
      }
    } catch (err) {
      console.log('Error fetching clinic details on mobile:', err);
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
  }, [clinicId]);

  const handleBookingRequest = async () => {
    if (!selectedPetId || !selectedServiceId || !appointmentDate || !appointmentTime) {
      Alert.alert('Validation Error', 'Please select a pet, service, date and time slot.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        clinicId: clinic.clinicId,
        serviceId: selectedServiceId,
        doctorId: selectedDoctorId || null,
        petId: selectedPetId,
        appointmentDate,
        appointmentTime,
        notes
      };

      const res = await fetch(`${API_URL}/api/clinics/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        Alert.alert('Success', 'Appointment request submitted successfully!');
        setIsBookModalVisible(false);
        setBookStep(1);
        setAppointmentDate('');
        setAppointmentTime('');
        setNotes('');
      } else {
        const err = await res.json();
        Alert.alert('Booking Error', err.message || 'Failed to request appointment.');
      }
    } catch (err) {
      Alert.alert('Error', 'An error occurred during booking request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDirections = () => {
    if (!clinic) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clinic.formattedAddress)}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open maps.'));
  };

  const handlePhone = () => {
    if (!clinic?.phone) return;
    Linking.openURL(`tel:${clinic.phone}`).catch(() => Alert.alert('Error', 'Could not initiate phone call.'));
  };

  const handleWebsite = () => {
    if (!clinic?.website) return;
    Linking.openURL(clinic.website).catch(() => Alert.alert('Error', 'Could not open website URL.'));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!clinic) return null;

  return (
    <View style={styles.container}>
      <ScrollView>
        <Image 
          source={{ uri: clinic.photo || 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=320' }} 
          style={styles.bannerImage} 
        />
        <TouchableOpacity style={styles.btnBack} onPress={onBack}>
          <Feather name="arrow-left" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Profile Card */}
        <View style={styles.infoWrapper}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{clinic.name}</Text>
            {clinic.connected ? (
              <View style={[styles.badgeContainer, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.badgeText, { color: '#16A34A' }]}>Connected</Text>
              </View>
            ) : (
              <View style={[styles.badgeContainer, { backgroundColor: '#F1F5F9' }]}>
                <Text style={[styles.badgeText, { color: '#475569' }]}>Google Place</Text>
              </View>
            )}
          </View>

          <Text style={styles.location}>
            <Feather name="map-pin" size={12} /> {clinic.formattedAddress}
          </Text>

          {clinic.rating && (
            <View style={styles.ratingRow}>
              <Feather name="star" size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingVal}>{clinic.rating} ({clinic.reviewCount} reviews)</Text>
            </View>
          )}

          {/* External partner warning */}
          {!clinic.connected && (
            <View style={styles.warningBox}>
              <Feather name="alert-triangle" size={16} color="#3B82F6" />
              <Text style={styles.warningText}>
                Direct booking is only supported for PetLink-connected clinics. You can still reach out via contact actions below.
              </Text>
            </View>
          )}

          {/* Quick contact actions */}
          <Text style={styles.sectionTitle}>Contact & Navigation</Text>
          <View style={styles.actionRow}>
            {clinic.phone && (
              <TouchableOpacity style={styles.actionBtn} onPress={handlePhone}>
                <Feather name="phone" size={16} color="#475569" />
                <Text style={styles.actionBtnText}>Call Clinic</Text>
              </TouchableOpacity>
            )}
            {clinic.website && (
              <TouchableOpacity style={styles.actionBtn} onPress={handleWebsite}>
                <Feather name="globe" size={16} color="#475569" />
                <Text style={styles.actionBtnText}>Website</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EFF6FF' }]} onPress={handleDirections}>
              <Feather name="map" size={16} color="var(--color-primary)" />
              <Text style={[styles.actionBtnText, { color: 'var(--color-primary)' }]}>Directions</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {clinic.description || `Real-world veterinary clinic listed via Google Places API in ${clinic.formattedAddress}.`}
          </Text>

          {/* Doctors list (Connected Only) */}
          {clinic.connected && clinic.doctors?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Our Veterinary Doctors</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorsScroll}>
                {clinic.doctors.map(d => (
                  <View key={d.id} style={styles.doctorItem}>
                    <Image source={{ uri: d.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150' }} style={styles.doctorImg} />
                    <Text style={styles.doctorName}>{d.name}</Text>
                    <Text style={styles.doctorSpec}>{d.specialization}</Text>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          {/* Services Offered (Connected Only) */}
          {clinic.connected && clinic.services?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Services Offered</Text>
              {clinic.services.map(s => (
                <View key={s.id} style={styles.serviceRow}>
                  <View>
                    <Text style={styles.serviceName}>{s.name}</Text>
                    <Text style={styles.serviceDuration}>Duration: {s.duration} mins</Text>
                  </View>
                  <Text style={styles.servicePrice}>{s.price} PKR</Text>
                </View>
              ))}
            </>
          )}

          {/* Weekday opening hours */}
          <Text style={styles.sectionTitle}>Opening Hours</Text>
          {clinic.weekdayDescriptions && clinic.weekdayDescriptions.length > 0 ? (
            clinic.weekdayDescriptions.map(desc => (
              <View key={desc} style={styles.hoursRow}>
                <Text style={styles.hoursText}>{desc}</Text>
              </View>
            ))
          ) : (
            <View style={styles.hoursRow}>
              <Text style={styles.hoursText}>Monday - Saturday: 09:00 AM - 09:00 PM</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      {clinic.connected && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.btnBook} onPress={() => setIsBookModalVisible(true)}>
            <Text style={styles.btnBookText}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Booking Stepper Modal */}
      <Modal visible={isBookModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Appointment</Text>
              <TouchableOpacity onPress={() => setIsBookModalVisible(false)}>
                <Feather name="x" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.progressBarWrapper}>
              <View style={[styles.progressBar, { width: `${(bookStep / 5) * 100}%` }]} />
            </View>

            <ScrollView style={styles.modalBody}>
              {bookStep === 1 && (
                <View>
                  <Text style={styles.stepTitle}>Select Your Pet</Text>
                  {userPets.length === 0 ? (
                    <Text style={styles.warnText}>Please register a pet profile in My Pets first.</Text>
                  ) : (
                    userPets.map(p => (
                      <TouchableOpacity 
                        key={p._id} 
                        style={[styles.petBtn, selectedPetId === p._id && styles.petBtnActive]}
                        onPress={() => setSelectedPetId(p._id)}
                      >
                        <Text style={[styles.petBtnText, selectedPetId === p._id && styles.petBtnTextActive]}>
                          {p.name} ({p.breed})
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}

              {bookStep === 2 && (
                <View>
                  <Text style={styles.stepTitle}>Select Treatment Service</Text>
                  {clinic.services?.map(s => (
                    <TouchableOpacity 
                      key={s.id} 
                      style={[styles.petBtn, selectedServiceId === s.id && styles.petBtnActive]}
                      onPress={() => setSelectedServiceId(s.id)}
                    >
                      <Text style={[styles.petBtnText, selectedServiceId === s.id && styles.petBtnTextActive]}>
                        {s.name} ({s.price} PKR)
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {bookStep === 3 && (
                <View>
                  <Text style={styles.stepTitle}>Select Doctor</Text>
                  {clinic.doctors?.map(d => (
                    <TouchableOpacity 
                      key={d.id} 
                      style={[styles.petBtn, selectedDoctorId === d.id && styles.petBtnActive]}
                      onPress={() => setSelectedDoctorId(d.id)}
                    >
                      <Text style={[styles.petBtnText, selectedDoctorId === d.id && styles.petBtnTextActive]}>
                        {d.name} ({d.specialization})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {bookStep === 4 && (
                <View>
                  <Text style={styles.stepTitle}>Date & Time</Text>
                  
                  <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                  <TextInput style={styles.modalInput} value={appointmentDate} onChangeText={setAppointmentDate} placeholder="e.g. 2026-09-02" />

                  <Text style={styles.label}>Time Slot</Text>
                  <TextInput style={styles.modalInput} value={appointmentTime} onChangeText={setAppointmentTime} placeholder="e.g. 10:30 AM" />

                  <Text style={styles.label}>Symptom Notes</Text>
                  <TextInput style={[styles.modalInput, { height: 60 }]} value={notes} onChangeText={setNotes} placeholder="Reason for checkup..." multiline />
                </View>
              )}

              {bookStep === 5 && (
                <View>
                  <Text style={styles.stepTitle}>Stay Summary & Confirm</Text>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}>Clinic: {clinic.name}</Text>
                    <Text style={styles.summaryText}>Schedule: {appointmentDate} at {appointmentTime}</Text>
                    <Text style={styles.summaryText}>Consultation Fee: {clinic.startingFee} PKR</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              {bookStep > 1 && (
                <TouchableOpacity style={styles.btnBackStep} onPress={() => setBookStep(bookStep - 1)}>
                  <Text style={styles.btnBackStepText}>Back</Text>
                </TouchableOpacity>
              )}
              {bookStep < 5 ? (
                <TouchableOpacity style={styles.btnNextStep} onPress={() => setBookStep(bookStep + 1)} disabled={bookStep === 1 && userPets.length === 0}>
                  <Text style={styles.btnNextStepText}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.btnConfirm} onPress={handleBookingRequest} disabled={submitting}>
                  <Text style={styles.btnConfirmText}>{submitting ? 'Scheduling...' : 'Confirm Request'}</Text>
                </TouchableOpacity>
              )}
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
    height: 180,
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1
  },
  location: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    borderRadius: 8,
    marginTop: 14
  },
  warningText: {
    fontSize: 11,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 16
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap'
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 8
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 20,
    marginBottom: 8
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: '#475569'
  },
  doctorsScroll: {
    flexDirection: 'row',
    marginTop: 8
  },
  doctorItem: {
    width: 140,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginRight: 12
  },
  doctorImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    objectFit: 'cover',
    marginBottom: 8
  },
  doctorName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center'
  },
  doctorSpec: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center'
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155'
  },
  serviceDuration: {
    fontSize: 11,
    color: '#64748B'
  },
  servicePrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A'
  },
  hoursRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  hoursText: {
    fontSize: 12,
    color: '#475569'
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
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A'
  },
  progressBarWrapper: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary
  },
  modalBody: {
    flex: 1
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12
  },
  warnText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16
  },
  petBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
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
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
    marginBottom: 4
  },
  modalInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    fontSize: 13,
    backgroundColor: '#FFFFFF',
    marginBottom: 8
  },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  summaryText: {
    fontSize: 13,
    color: '#334155',
    marginVertical: 4
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12
  },
  btnBackStep: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    alignItems: 'center'
  },
  btnBackStepText: {
    color: '#475569',
    fontWeight: '600'
  },
  btnNextStep: {
    flex: 2,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnNextStepText: {
    color: COLORS.white,
    fontWeight: 'bold'
  },
  btnConfirm: {
    flex: 2,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnConfirmText: {
    color: COLORS.white,
    fontWeight: 'bold'
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700'
  }
});
