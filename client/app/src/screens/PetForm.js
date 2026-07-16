import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  TextInput, Switch, ScrollView, Alert, ActivityIndicator, Platform 
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/theme';
import PetImage from '../components/PetImage';

export default function PetForm({ user, petId, onCancel, onSaveSuccess }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [image, setImage] = useState('');
  const [imageSettings, setImageSettings] = useState({ positionX: 50, positionY: 50, scale: 1, objectPosition: '50% 50%' });

  const [isVaccinated, setIsVaccinated] = useState(false);
  const [vaccinationDate, setVaccinationDate] = useState('');
  const [nextVaccinationDate, setNextVaccinationDate] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [diseases, setDiseases] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  const [friendlyWithKids, setFriendlyWithKids] = useState(false);
  const [friendlyWithPets, setFriendlyWithPets] = useState(false);
  const [trainingLevel, setTrainingLevel] = useState('None');
  const [neuteredSpayed, setNeuteredSpayed] = useState(false);
  const [microchipNumber, setMicrochipNumber] = useState('');
  const [foodPreference, setFoodPreference] = useState('');
  const [behaviour, setBehaviour] = useState('');
  const [personality, setPersonality] = useState('');
  const [aboutPet, setAboutPet] = useState('');

  const [adoptionStatus, setAdoptionStatus] = useState('Available');
  const [activeStatus, setActiveStatus] = useState('ACTIVE');

  const [country, setCountry] = useState('Pakistan');
  const [province, setProvince] = useState('Punjab');
  const [city, setCity] = useState('Lahore');
  const [address, setAddress] = useState('');

  const [documents, setDocuments] = useState([]); // Array of { name, fileType, data }

  // Load pet details if editing
  useEffect(() => {
    if (petId) {
      setFetching(true);
      fetch(`http://localhost:5000/api/pets/${petId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data._id) {
            setName(data.name || '');
            setSpecies(data.species || 'Dog');
            setBreed(data.breed || '');
            setGender(data.gender || 'Male');
            setAge(data.age || '');
            setWeight(data.weight || '');
            setColor(data.color || '');
            setSize(data.size || '');
            setImage(data.image || '');
            setImageSettings(data.imageSettings || { positionX: 50, positionY: 50, scale: 1, objectPosition: '50% 50%' });

            setIsVaccinated(data.isVaccinated || false);
            setVaccinationDate(data.vaccinationDate || '');
            setNextVaccinationDate(data.nextVaccinationDate || '');
            setMedicalHistory(data.medicalHistory || '');
            setAllergies(data.allergies || '');
            setDiseases(data.diseases || '');
            setBloodGroup(data.bloodGroup || '');

            setFriendlyWithKids(data.friendlyWithKids || false);
            setFriendlyWithPets(data.friendlyWithPets || false);
            setTrainingLevel(data.trainingLevel || 'None');
            setNeuteredSpayed(data.neuteredSpayed || false);
            setMicrochipNumber(data.microchipNumber || '');
            setFoodPreference(data.foodPreference || '');
            setBehaviour(data.behaviour || '');
            setPersonality(data.personality || '');
            setAboutPet(data.aboutPet || '');

            setAdoptionStatus(data.adoptionStatus || 'Available');
            setActiveStatus(data.activeStatus ? data.activeStatus.toUpperCase() : 'ACTIVE');

            setCountry(data.country || 'Pakistan');
            setProvince(data.province || 'Punjab');
            setCity(data.city || 'Lahore');
            setAddress(data.address || '');

            setDocuments(data.documents || []);
          }
        })
        .catch(err => console.log('Error prepopulating pet form:', err))
        .finally(() => setFetching(false));
    }
  }, [petId]);

  const handlePickMainImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Camera roll permissions are required.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result);
          setImageSettings({ positionX: 50, positionY: 50, scale: 1, objectPosition: '50% 50%' });
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.log('Error converting main pet pic:', err);
        setImage(uri);
      }
    }
  };

  const handleAddDocument = async () => {
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
          setDocuments(prev => [
            ...prev,
            {
              name: `doc_${Date.now()}.png`,
              fileType: 'image/png',
              data: reader.result,
            }
          ]);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.log('Doc upload conversion failed:', err);
      }
    }
  };

  const handleRemoveDoc = (idx) => {
    setDocuments(prev => prev.filter((_, i) => i !== idx));
  };

  // Direct touch reposition handlers
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startPos = useRef({ x: 50, y: 50 });

  const handleTouchStart = (e) => {
    isDragging.current = true;
    startX.current = e.nativeEvent.pageX;
    startY.current = e.nativeEvent.pageY;
    startPos.current = { x: imageSettings.positionX, y: imageSettings.positionY };
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const currentX = e.nativeEvent.pageX;
    const currentY = e.nativeEvent.pageY;
    const dx = currentX - startX.current;
    const dy = currentY - startY.current;

    let newX = startPos.current.x - (dx / 2.0);
    let newY = startPos.current.y - (dy / 1.0);

    newX = Math.max(0, Math.min(100, Math.round(newX)));
    newY = Math.max(0, Math.min(100, Math.round(newY)));

    setImageSettings({
      positionX: newX,
      positionY: newY,
      scale: 1,
      objectPosition: `${newX}% ${newY}%`
    });
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  const handleSave = () => {
    if (!name || !breed || !age || !weight) {
      if (Platform.OS === 'web') {
        alert("Please complete Nick Name, Breed, Age, and Weight.");
      } else {
        Alert.alert("Validation Error", "Please complete Nick Name, Breed, Age, and Weight.");
      }
      return;
    }

    if (Platform.OS === 'web') {
      const check = window.confirm(petId ? "Do you want to save these changes to the pet profile?" : "Do you want to register this new pet companion?");
      if (check) proceedSave();
    } else {
      Alert.alert(
        petId ? "Confirm Update" : "Confirm Registration",
        petId ? "Do you want to save these changes to the pet profile?" : "Do you want to register this new pet companion?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Save", onPress: () => proceedSave() }
        ]
      );
    }
  };

  const proceedSave = async () => {
    setLoading(true);
    const payload = {
      owner: user._id,
      name, species, breed, gender, age, weight, color, size,
      isVaccinated, vaccinationDate, nextVaccinationDate, medicalHistory, allergies, diseases, bloodGroup,
      friendlyWithKids, friendlyWithPets, trainingLevel, neuteredSpayed, microchipNumber, foodPreference,
      behaviour, personality, aboutPet, adoptionStatus, activeStatus,
      country, province, city, address, image, imageSettings, documents
    };

    try {
      let response;
      if (petId) {
        response = await fetch(`http://localhost:5000/api/pets/${petId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'x-requester-id': user._id
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`http://localhost:5000/api/pets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const saved = await response.json();
        if (Platform.OS === 'web') {
          alert(petId ? "Companion profile updated successfully!" : "New companion registered successfully!");
        } else {
          Alert.alert("Success", petId ? "Companion profile updated successfully!" : "New companion registered successfully!");
        }
        onSaveSuccess(saved);
      } else {
        const errData = await response.json();
        if (Platform.OS === 'web') {
          alert(errData.message || "Failed to save companion details.");
        } else {
          Alert.alert("Error", errData.message || "Failed to save companion details.");
        }
      }
    } catch (err) {
      if (Platform.OS === 'web') {
        alert("Network connection to PetLink backend failed.");
      } else {
        Alert.alert("Error", "Network connection to PetLink backend failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onCancel}>
          <Feather name="arrow-left" size={20} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{petId ? 'Edit Companion' : 'Register Companion'}</Text>
      </View>

      {/* Section 1: Basic info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Basic Information</Text>

        {image ? (
          <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
            Drag the image to adjust its position inside the card frame
          </Text>
        ) : null}

        <View 
          style={[styles.picBox, { overflow: 'hidden', position: 'relative' }]}
          onTouchStart={image ? handleTouchStart : undefined}
          onTouchMove={image ? handleTouchMove : undefined}
          onTouchEnd={handleTouchEnd}
        >
          {image ? (
            <>
              <View style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                <PetImage src={image} imageSettings={imageSettings} type="card" />
              </View>
              <TouchableOpacity 
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                  zIndex: 2
                }}
                onPress={handlePickMainImage}
              >
                <Feather name="edit-2" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.picPlaceholder} onPress={handlePickMainImage}>
              <Feather name="camera" size={28} color={COLORS.muted} />
              <Text style={styles.picPlaceholderText}>Upload Main Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {image ? (
          <TouchableOpacity 
            style={[styles.choiceBtn, { width: 120, alignSelf: 'center', marginTop: 8, paddingVertical: 6 }]} 
            onPress={handlePickMainImage}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.darkLight }}>Change Photo</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.label} style={{ marginTop: 14 }}>Nick Name *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Luna" />

        <Text style={styles.label}>Species *</Text>
        <View style={styles.genderRow}>
          {['Dog', 'Cat', 'Bird', 'Other'].map(sp => (
            <TouchableOpacity key={sp} style={[styles.choiceBtn, species === sp && styles.choiceBtnActive]} onPress={() => setSpecies(sp)}>
              <Text style={[styles.choiceText, species === sp && styles.choiceTextActive]}>{sp}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Breed *</Text>
        <TextInput style={styles.input} value={breed} onChangeText={setBreed} placeholder="e.g. Golden Retriever" />

        <Text style={styles.label}>Gender *</Text>
        <View style={styles.genderRow}>
          {['Male', 'Female'].map(gen => (
            <TouchableOpacity key={gen} style={[styles.choiceBtn, gender === gen && styles.choiceBtnActive]} onPress={() => setGender(gen)}>
              <Text style={[styles.choiceText, gender === gen && styles.choiceTextActive]}>{gen}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Age *</Text>
            <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="e.g. 3 yrs" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Weight *</Text>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder="e.g. 28 kg" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Color</Text>
            <TextInput style={styles.input} value={color} onChangeText={setColor} placeholder="e.g. Golden" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Size</Text>
            <TextInput style={styles.input} value={size} onChangeText={setSize} placeholder="e.g. Medium" />
          </View>
        </View>
      </View>

      {/* Section 2: Health Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Health Information</Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Is Vaccinated</Text>
          <Switch value={isVaccinated} onValueChange={setIsVaccinated} trackColor={{ true: COLORS.primary }} />
        </View>

        {isVaccinated && (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Last Vaccine Date</Text>
              <TextInput style={styles.input} value={vaccinationDate} onChangeText={setVaccinationDate} placeholder="YYYY-MM-DD" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Next Due Date</Text>
              <TextInput style={styles.input} value={nextVaccinationDate} onChangeText={setNextVaccinationDate} placeholder="YYYY-MM-DD" />
            </View>
          </View>
        )}

        <Text style={styles.label}>Medical History</Text>
        <TextInput style={[styles.input, { height: 60 }]} multiline value={medicalHistory} onChangeText={setMedicalHistory} placeholder="Past operations, etc." />

        <Text style={styles.label}>Allergies</Text>
        <TextInput style={[styles.input, { height: 50 }]} multiline value={allergies} onChangeText={setAllergies} placeholder="Allergies log..." />

        <Text style={styles.label}>Chronic Diseases</Text>
        <TextInput style={[styles.input, { height: 50 }]} multiline value={diseases} onChangeText={setDiseases} placeholder="Diseases..." />

        <Text style={styles.label}>Blood Group</Text>
        <TextInput style={styles.input} value={bloodGroup} onChangeText={setBloodGroup} placeholder="e.g. DEA 1.1" />
      </View>

      {/* Section 3: Behaviour */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Behaviour & Personality</Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Friendly with Kids</Text>
          <Switch value={friendlyWithKids} onValueChange={setFriendlyWithKids} trackColor={{ true: COLORS.primary }} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Friendly with Pets</Text>
          <Switch value={friendlyWithPets} onValueChange={setFriendlyWithPets} trackColor={{ true: COLORS.primary }} />
        </View>

        <Text style={styles.label}>Training Level</Text>
        <View style={styles.genderRow}>
          {['None', 'Beginner', 'Intermediate', 'Advanced'].map(tr => (
            <TouchableOpacity key={tr} style={[styles.choiceBtn, trainingLevel === tr && styles.choiceBtnActive]} onPress={() => setTrainingLevel(tr)}>
              <Text style={[styles.choiceText, trainingLevel === tr && styles.choiceTextActive]}>{tr}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.switchRow} style={{ marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.switchLabel}>Neutered / Spayed</Text>
          <Switch value={neuteredSpayed} onValueChange={setNeuteredSpayed} trackColor={{ true: COLORS.primary }} />
        </View>

        <Text style={styles.label} style={{ marginTop: 14 }}>Microchip Number</Text>
        <TextInput style={styles.input} value={microchipNumber} onChangeText={setMicrochipNumber} placeholder="Microchip ID..." />

        <Text style={styles.label}>Food Preference</Text>
        <TextInput style={styles.input} value={foodPreference} onChangeText={setFoodPreference} />

        <Text style={styles.label}>Behaviour Details</Text>
        <TextInput style={styles.input} value={behaviour} onChangeText={setBehaviour} />

        <Text style={styles.label}>Personality</Text>
        <TextInput style={styles.input} value={personality} onChangeText={setPersonality} />

        <Text style={styles.label}>About Pet</Text>
        <TextInput style={[styles.input, { height: 80 }]} multiline value={aboutPet} onChangeText={setAboutPet} placeholder="General bio..." />
      </View>

      {/* Section 4 & 5: Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Status & Adoption Info</Text>

        <Text style={styles.label} style={{ marginTop: 14 }}>Pet Status</Text>
        <View style={styles.genderRow} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {['ACTIVE', 'FOR_SALE', 'FOR_ADOPTION', 'IN_SHELTER', 'LOST', 'DECEASED', 'ARCHIVED'].map(ac => (
            <TouchableOpacity key={ac} style={[styles.choiceBtn, activeStatus === ac && styles.choiceBtnActive, { minWidth: 95, marginBottom: 6 }]} onPress={() => setActiveStatus(ac)}>
              <Text style={[styles.choiceText, activeStatus === ac && styles.choiceTextActive]}>{ac.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section 6: Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Location</Text>

        <Text style={styles.label}>Country</Text>
        <TextInput style={styles.input} value={country} onChangeText={setCountry} />

        <Text style={styles.label}>Province</Text>
        <TextInput style={styles.input} value={province} onChangeText={setProvince} />

        <Text style={styles.label}>City</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} />

        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Street address..." />
      </View>

      {/* Section 7: Documents */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Documents</Text>

        <TouchableOpacity style={styles.uploadBox} onPress={handleAddDocument}>
          <Feather name="upload-cloud" size={24} color={COLORS.muted} />
          <Text style={styles.uploadBoxText}>Attach Documents / Photos</Text>
        </TouchableOpacity>

        {documents.length > 0 && (
          <View style={styles.docsList}>
            {documents.map((doc, i) => (
              <View key={i} style={styles.docCard}>
                <Feather name="file-text" size={20} color={COLORS.muted} />
                <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                <TouchableOpacity onPress={() => handleRemoveDoc(i)}>
                  <Feather name="trash-2" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Form Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Pet'}</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
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
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgLight,
    paddingBottom: 8,
  },
  picBox: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgLight,
    overflow: 'hidden',
    marginBottom: 16,
  },
  picPlaceholder: {
    alignItems: 'center',
  },
  picPlaceholderText: {
    fontSize: 9,
    color: COLORS.muted,
    fontWeight: '700',
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkLight,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  choiceBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgLight,
  },
  choiceBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  choiceText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
  },
  choiceTextActive: {
    color: COLORS.white,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgLight,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.darkLight,
  },
  uploadBox: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
  },
  uploadBoxText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
    marginTop: 6,
  },
  docsList: {
    marginTop: 12,
    gap: 8,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  docName: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 10,
    color: COLORS.darkLight,
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.muted,
  },
  saveBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});
