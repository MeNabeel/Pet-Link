import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  ScrollView, Modal, TextInput, Switch, Alert, ActivityIndicator 
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/theme';
import PetImage from '../components/PetImage';

export default function PetDetails({ user, petId, onBack, onEdit, onDeleteSuccess }) {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwner = user && pet && (pet.owner === user._id || pet.owner._id === user._id);

  // Sub-drawers modals
  const [activeModal, setActiveModal] = useState(null); // 'health' | 'vaccine' | 'medical' | 'delete'
  const [behaviourExpanded, setBehaviourExpanded] = useState(false);
  const [locationExpanded, setLocationExpanded] = useState(false);

  // Vaccine Form
  const [vName, setVName] = useState('');
  const [vDose, setVDose] = useState('');
  const [vDate, setVDate] = useState('');
  const [vNextDate, setVNextDate] = useState('');
  const [vVet, setVVet] = useState('');
  const [vNotes, setVNotes] = useState('');

  // Medical Form
  const [mDisease, setMDisease] = useState('');
  const [mSymptoms, setMSymptoms] = useState('');
  const [mDiagnosis, setMDiagnosis] = useState('');
  const [mTreatment, setMTreatment] = useState('');
  const [mMedicine, setMMedicine] = useState('');
  const [mDoctor, setMDoctor] = useState('');
  const [mClinic, setMClinic] = useState('');
  const [mVisitDate, setMVisitDate] = useState('');
  const [mNextVisit, setMNextVisit] = useState('');
  const [mAttachment, setMAttachment] = useState('');

  const fetchPetDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pets/${petId}`);
      const data = await response.json();
      if (response.ok) {
        setPet(data);
      }
    } catch (err) {
      console.log('Error fetching pet details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (petId) {
      fetchPetDetails();
    }
  }, [petId]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pets/${petId}`, {
        method: 'DELETE',
        headers: {
          'x-requester-id': user._id
        }
      });
      if (response.ok) {
        setActiveModal(null);
        onDeleteSuccess();
      } else {
        Alert.alert("Error", "Failed to delete companion profile.");
      }
    } catch (err) {
      console.log('Error deleting pet:', err);
    }
  };

  const handleAddVaccine = async () => {
    if (!vName || !vDate) {
      Alert.alert("Error", "Vaccine Name and Date are required.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/pets/${petId}/vaccine`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify({
          vaccineName: vName,
          dose: vDose,
          date: vDate,
          nextDueDate: vNextDate,
          veterinarian: vVet,
          notes: vNotes
        }),
      });

      if (response.ok) {
        setVName(''); setVDose(''); setVDate(''); setVNextDate(''); setVVet(''); setVNotes('');
        setActiveModal('health');
        fetchPetDetails();
      } else {
        Alert.alert("Error", "Failed to save vaccine record.");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddMedical = async () => {
    if (!mDisease || !mVisitDate) {
      Alert.alert("Error", "Disease and Visit Date are required.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/pets/${petId}/medical-record`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify({
          disease: mDisease,
          symptoms: mSymptoms,
          diagnosis: mDiagnosis,
          treatment: mTreatment,
          medicine: mMedicine,
          doctor: mDoctor,
          clinic: mClinic,
          visitDate: mVisitDate,
          nextVisitDate: mNextVisit,
          attachments: mAttachment ? [mAttachment] : [],
        }),
      });

      if (response.ok) {
        setMDisease(''); setMSymptoms(''); setMDiagnosis(''); setMTreatment(''); setMMedicine(''); setMDoctor(''); setMClinic(''); setMVisitDate(''); setMNextVisit(''); setMAttachment('');
        setActiveModal('health');
        fetchPetDetails();
      } else {
        Alert.alert("Error", "Failed to save medical history.");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handlePickAttachment = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setMAttachment(reader.result);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.log(err);
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Companion profile not found.</Text>
        <TouchableOpacity style={styles.btnOutline} onPress={onBack}>
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      
      {/* Back Button */}
      <View style={styles.backHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color={COLORS.dark} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Hero card */}
      <View style={styles.heroCard}>
        <View style={styles.heroImgWrapper}>
          <PetImage src={pet.image} imageSettings={pet.imageSettings} type="hero" />

          {isOwner && (
            <TouchableOpacity 
              style={styles.floatingEditBtn} 
              onPress={() => onEdit(pet._id)}
            >
              <Feather name="edit-2" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          )}

          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: COLORS.dark }]}><Text style={styles.badgeText}>{pet.activeStatus.replace('_', ' ')}</Text></View>
          </View>
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.heroName}>{pet.name}</Text>
          <Text style={styles.heroBreed}>{pet.breed} • {pet.species}</Text>

          {/* Action Toolbar buttons group (Side-by-side) */}
          <View style={styles.actionsGroup}>
            <TouchableOpacity style={[styles.btnOutline, { flex: 1 }]} onPress={() => setActiveModal('health')}>
              <Feather name="heart" size={13} color={COLORS.darkLight} style={styles.btnIcon} />
              <Text style={styles.btnOutlineText}>View Health Record</Text>
            </TouchableOpacity>

            {isOwner && (
              <TouchableOpacity style={[styles.btnOutline, { flex: 1 }]} onPress={() => setActiveModal('vaccine')}>
                <Feather name="activity" size={13} color={COLORS.darkLight} style={styles.btnIcon} />
                <Text style={styles.btnOutlineText}>Add Vaccine</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Info details list */}
      <View style={styles.section}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.bgLight, paddingBottom: 6 }}>
          <Text style={[styles.sectionTitle, { marginBottom: 0, borderBottomWidth: 0, paddingBottom: 0 }]}>Basic Information</Text>
          {isOwner && (
            <TouchableOpacity onPress={() => onEdit(pet._id)}>
              <Feather name="edit-2" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Age</Text><Text style={styles.infoValue}>{pet.age}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Gender</Text><Text style={styles.infoValue}>{pet.gender}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Weight</Text><Text style={styles.infoValue}>{pet.weight}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Color</Text><Text style={styles.infoValue}>{pet.color || 'N/A'}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Size</Text><Text style={styles.infoValue}>{pet.size || 'N/A'}</Text></View>
        <View style={styles.infoRow} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0, paddingBottom: 0 }}><Text style={styles.infoLabel}>Microchip ID</Text><Text style={styles.infoValue}>{pet.microchipNumber || 'N/A'}</Text></View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: behaviourExpanded ? 12 : 0, borderBottomWidth: behaviourExpanded ? 1 : 0, borderBottomColor: COLORS.bgLight, paddingBottom: behaviourExpanded ? 6 : 0 }} 
          onPress={() => setBehaviourExpanded(!behaviourExpanded)}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="heart" size={15} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.sectionTitle, { marginBottom: 0, borderBottomWidth: 0, paddingBottom: 0 }]}>Behaviour & Personality</Text>
          </View>
          <Feather name={behaviourExpanded ? "chevron-up" : "chevron-down"} size={16} color={COLORS.muted} />
        </TouchableOpacity>
        
        {behaviourExpanded && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.label}>Biography</Text>
            <Text style={styles.aboutText}>{pet.aboutPet || 'No bio registered.'}</Text>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Friendly with Kids</Text><Text style={styles.infoValue}>{pet.friendlyWithKids ? 'Yes' : 'No'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Friendly with Pets</Text><Text style={styles.infoValue}>{pet.friendlyWithPets ? 'Yes' : 'No'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Training Level</Text><Text style={styles.infoValue}>{pet.trainingLevel}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Food Preference</Text><Text style={styles.infoValue}>{pet.foodPreference || 'N/A'}</Text></View>
            <View style={styles.infoRow} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0, paddingBottom: 0 }}><Text style={styles.infoLabel}>Neutered</Text><Text style={styles.infoValue}>{pet.neuteredSpayed ? 'Yes' : 'No'}</Text></View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: locationExpanded ? 12 : 0, borderBottomWidth: locationExpanded ? 1 : 0, borderBottomColor: COLORS.bgLight, paddingBottom: locationExpanded ? 6 : 0 }} 
          onPress={() => setLocationExpanded(!locationExpanded)}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="map-pin" size={15} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.sectionTitle, { marginBottom: 0, borderBottomWidth: 0, paddingBottom: 0 }]}>Location Details</Text>
          </View>
          <Feather name={locationExpanded ? "chevron-up" : "chevron-down"} size={16} color={COLORS.muted} />
        </TouchableOpacity>
        
        {locationExpanded && (
          <View style={{ marginTop: 8 }}>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>City</Text><Text style={styles.infoValue}>{pet.city}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Province</Text><Text style={styles.infoValue}>{pet.province}</Text></View>
            <View style={styles.infoRow} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0, paddingBottom: 0 }}><Text style={styles.infoLabel}>Address</Text><Text style={styles.infoValue}>{pet.address || 'N/A'}</Text></View>
          </View>
        )}
      </View>

      {/* Drawer: Health Timeline */}
      <Modal visible={activeModal === 'health'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.drawerHeader}>
              <Text style={styles.modalTitle}>Medical Log History</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {isOwner && (
                  <>
                    <TouchableOpacity style={[styles.btnOutline, { paddingVertical: 5, paddingHorizontal: 10 }]} onPress={() => { setActiveModal('medical'); }}>
                      <Feather name="plus" size={12} color={COLORS.primary} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.primary }}>Medical</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btnOutline, { paddingVertical: 5, paddingHorizontal: 10, borderColor: '#EF4444' }]} onPress={() => { setActiveModal('delete'); }}>
                      <Feather name="trash-2" size={12} color="#EF4444" />
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity onPress={() => setActiveModal(null)} style={{ marginLeft: 6 }}>
                  <Feather name="x" size={20} color={COLORS.dark} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Blood Group</Text><Text style={styles.infoValue}>{pet.bloodGroup || 'DEA 1.1'}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Chronic Diseases</Text><Text style={styles.infoValue}>{pet.diseases || 'None'}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Allergies</Text><Text style={styles.infoValue}>{pet.allergies || 'None'}</Text></View>
              <View style={styles.infoRow} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0, paddingBottom: 16 }}><Text style={styles.infoLabel}>Medical History</Text><Text style={styles.infoValue}>{pet.medicalHistory || 'None'}</Text></View>

              {/* Vaccines timeline */}
              <Text style={styles.sectionTitle} style={{ fontSize: 13, fontWeight: '800', marginTop: 10 }}>Vaccinations & Treatments</Text>
              <View style={styles.timeline}>
                {pet.vaccines && pet.vaccines.map((vac, idx) => (
                  <View key={`v-${idx}`} style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: '#16A34A' }]} />
                    <Text style={styles.timelineDate}>{vac.date}</Text>
                    <Text style={styles.timelineTitle}>{vac.vaccineName} ({vac.dose})</Text>
                    <Text style={styles.timelineBody}>Vet: {vac.veterinarian || 'Not specified'}. {vac.notes}</Text>
                  </View>
                ))}

                {pet.medicalRecords && pet.medicalRecords.map((med, idx) => (
                  <View key={`m-${idx}`} style={styles.timelineItem}>
                    <View style={[styles.timelineDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.timelineDate}>{med.visitDate}</Text>
                    <Text style={styles.timelineTitle}>Visit: {med.disease}</Text>
                    <Text style={styles.timelineBody}>Diagnosis: {med.diagnosis}. Prescribed: {med.medicine}</Text>
                  </View>
                ))}

                {(!pet.vaccines || pet.vaccines.length === 0) && (!pet.medicalRecords || pet.medicalRecords.length === 0) && (
                  <Text style={styles.aboutText}>No timeline events logged.</Text>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: Add Vaccine */}
      <Modal visible={activeModal === 'vaccine'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.drawerHeader}>
              <Text style={styles.modalTitle}>Log Vaccine</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Feather name="x" size={20} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
              <Text style={styles.label}>Vaccine Name *</Text>
              <TextInput style={styles.input} value={vName} onChangeText={setVName} placeholder="e.g. DHPP" />

              <Text style={styles.label}>Dose</Text>
              <TextInput style={styles.input} value={vDose} onChangeText={setVDose} placeholder="e.g. Booster" />

              <Text style={styles.label}>Vaccination Date *</Text>
              <TextInput style={styles.input} value={vDate} onChangeText={setVDate} placeholder="YYYY-MM-DD" />

              <Text style={styles.label}>Next Due Date</Text>
              <TextInput style={styles.input} value={vNextDate} onChangeText={setVNextDate} placeholder="YYYY-MM-DD" />

              <Text style={styles.label}>Veterinarian</Text>
              <TextInput style={styles.input} value={vVet} onChangeText={setVVet} placeholder="Dr. Haris" />

              <Text style={styles.label}>Notes</Text>
              <TextInput style={styles.input} value={vNotes} onChangeText={setVNotes} />

              <View style={styles.modalActions} style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setActiveModal(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddVaccine}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: Add Medical */}
      <Modal visible={activeModal === 'medical'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.drawerHeader}>
              <Text style={styles.modalTitle}>Log Clinic Record</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Feather name="x" size={20} color={COLORS.dark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
              <Text style={styles.label}>Disease / Checkup *</Text>
              <TextInput style={styles.input} value={mDisease} onChangeText={setMDisease} placeholder="e.g. Ear Infection" />

              <Text style={styles.label}>Symptoms</Text>
              <TextInput style={styles.input} value={mSymptoms} onChangeText={setMSymptoms} placeholder="Scratching ear..." />

              <Text style={styles.label}>Diagnosis</Text>
              <TextInput style={styles.input} value={mDiagnosis} onChangeText={setMDiagnosis} />

              <Text style={styles.label}>Treatment</Text>
              <TextInput style={styles.input} value={mTreatment} onChangeText={setMTreatment} />

              <Text style={styles.label}>Medicine</Text>
              <TextInput style={styles.input} value={mMedicine} onChangeText={setMMedicine} />

              <Text style={styles.label}>Doctor</Text>
              <TextInput style={styles.input} value={mDoctor} onChangeText={setMDoctor} />

              <Text style={styles.label}>Clinic</Text>
              <TextInput style={styles.input} value={mClinic} onChangeText={setMClinic} />

              <Text style={styles.label}>Visit Date *</Text>
              <TextInput style={styles.input} value={mVisitDate} onChangeText={setMVisitDate} placeholder="YYYY-MM-DD" />

              <Text style={styles.label}>Next Visit Due</Text>
              <TextInput style={styles.input} value={mNextVisit} onChangeText={setMNextVisit} placeholder="YYYY-MM-DD" />

              <TouchableOpacity style={styles.uploadBox} onPress={handlePickAttachment} style={{ marginTop: 12, padding: 12, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', alignItems: 'center', borderRadius: 10 }}>
                <Feather name="image" size={18} color={COLORS.muted} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.muted, marginTop: 4 }}>Attach Report Photo</Text>
              </TouchableOpacity>

              <View style={styles.modalActions} style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setActiveModal(null)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleAddMedical}>
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: Delete confirm */}
      <Modal visible={activeModal === 'delete'} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxWidth: 300, textAlign: 'center' }]}>
            <Text style={[styles.modalTitle, { color: '#EF4444', borderBottomWidth: 0 }]}>Delete Pet</Text>
            <Text style={styles.aboutText} style={{ textAlign: 'center', fontSize: 12, color: COLORS.muted, marginBottom: 20, fontWeight: '500' }}>
              Are you sure you want to permanently delete this pet?
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setActiveModal(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#EF4444' }]} onPress={handleDelete}>
                <Text style={styles.saveBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  backHeader: {
    padding: 12,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkLight,
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    overflow: 'hidden',
  },
  heroImgWrapper: {
    width: '100%',
    height: 240,
    backgroundColor: COLORS.bgLight,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesRow: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  heroContent: {
    padding: 16,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
  },
  heroBreed: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 16,
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  floatingEditBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 2,
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
  },
  btnOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkLight,
  },
  btnIcon: {
    marginRight: 6,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgLight,
    paddingBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgLight,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 12,
    color: COLORS.darkLight,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
    marginTop: 8,
    marginBottom: 4,
  },
  aboutText: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.darkLight,
    fontWeight: '500',
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.dark,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.dark,
    marginBottom: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  timeline: {
    marginTop: 10,
    borderLeftWidth: 1.5,
    borderLeftColor: COLORS.border,
    paddingLeft: 16,
  },
  timelineItem: {
    marginBottom: 16,
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: -22,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  timelineDate: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '700',
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.dark,
    marginTop: 2,
  },
  timelineBody: {
    fontSize: 11,
    color: COLORS.muted,
    lineHeight: 14,
    marginTop: 2,
  },
});
