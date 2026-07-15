import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  TextInput, Switch, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/theme';

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
  const [activeStatus, setActiveStatus] = useState('Active');

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
            setActiveStatus(data.activeStatus || 'Active');

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

  const handleSave = async () => {
    if (!name || !breed || !age || !weight) {
      Alert.alert("Validation Error", "Please complete all required pet fields.");
      return;
    }

    setLoading(true);
    const payload = {
      owner: user._id,
      name, species, breed, gender, age, weight, color, size,
      isVaccinated, vaccinationDate, nextVaccinationDate, medicalHistory, allergies, diseases, bloodGroup,
      friendlyWithKids, friendlyWithPets, trainingLevel, neuteredSpayed, microchipNumber, foodPreference,
      behaviour, personality, aboutPet, adoptionStatus, activeStatus,
      country, province, city, address, image, documents
    };

    try {
      let response;
      if (petId) {
        response = await fetch(`http://localhost:5000/api/pets/${petId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
        onSaveSuccess(saved);
      } else {
        const errData = await response.json();
        Alert.alert("Error", errData.message || "Failed to save companion details.");
      }
    } catch (err) {
      Alert.alert("Error", "Network connection to PetLink backend failed.");
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

        <TouchableOpacity style={styles.picBox} onPress={handlePickMainImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.picPreview} resizeMode="cover" />
          ) : (
            <View style={styles.picPlaceholder}>
              <Feather name="camera" size={28} color={COLORS.muted} />
              <Text style={styles.picPlaceholderText}>Upload Main Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Nick Name *</Text>
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

        <Text style={styles.label}>Adoption Status</Text>
        <View style={styles.genderRow} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {['Available', 'Pending', 'Adopted'].map(ad => (
            <TouchableOpacity key={ad} style={[styles.choiceBtn, adoptionStatus === ad && styles.choiceBtnActive]} onPress={() => setAdoptionStatus(ad)}>
              <Text style={[styles.choiceText, adoptionStatus === ad && styles.choiceTextActive]}>{ad}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label} style={{ marginTop: 14 }}>Pet Status</Text>
        <View style={styles.genderRow} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {['Active', 'Lost', 'Sold', 'Deceased'].map(ac => (
            <TouchableOpacity key={ac} style={[styles.choiceBtn, activeStatus === ac && styles.choiceBtnActive]} onPress={() => setActiveStatus(ac)}>
              <Text style={[styles.choiceText, activeStatus === ac && styles.choiceTextActive]}>{ac}</Text>
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
    width: 100,
    height: 100,
    borderRadius: 50,
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
  picPreview: {
    width: '100%',
    height: '100%',
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
