import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, 
  ActivityIndicator, FlatList, Alert, Platform, Switch
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ShelterProviderDashboard({ user, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'bookings' | 'settings'

  // Stepper state for profile creation
  const [stepperStep, setStepperStep] = useState(1);
  const [shelterName, setShelterName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [capacity, setCapacity] = useState('10');
  const [dailyRate, setDailyRate] = useState('1000');
  const [providesPickup, setProvidesPickup] = useState(false);

  // Shelter operational states
  const [bookings, setBookings] = useState([]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/shelter/profile`, {
        headers: { 'x-requester-id': user._id }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        if (data) {
          setShelterName(data.name);
          setDescription(data.description);
          setPhone(data.phone);
          setEmail(data.email);
          setAddress(data.address);
          setCity(data.city);
          setProvince(data.province);
          setCapacity(String(data.capacity || 10));
          setDailyRate(String(data.dailyRate || 1000));
          setProvidesPickup(data.providesPickup || false);
        }
      }
    } catch (err) {
      console.log('Error fetching shelter profile on mobile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/api/shelter/bookings`, {
        headers: { 'x-requester-id': user._id }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      fetchBookings();
    }
  }, [profile, activeTab]);

  const handleSaveShelter = async () => {
    if (!shelterName.trim()) {
      Alert.alert('Error', 'Shelter Name is required.');
      return;
    }
    try {
      const payload = {
        name: shelterName,
        logo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=150',
        description,
        phone,
        email,
        address,
        city,
        province,
        capacity: parseInt(capacity) || 10,
        dailyRate: parseFloat(dailyRate) || 1000,
        providesPickup,
        status: 'Published'
      };

      const res = await fetch(`${API_URL}/api/shelter/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        Alert.alert('Success', 'Shelter profile published successfully!');
      } else {
        const errData = await res.json();
        Alert.alert('Error', errData.message || 'Failed to save shelter profile');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to save shelter profile: ' + err.message);
    }
  };

  const handleUpdateBooking = async (id, status, reason = '') => {
    try {
      const res = await fetch(`${API_URL}/api/shelter/bookings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify({ status, rejectionReason: reason })
      });
      if (res.ok) {
        fetchBookings();
        fetchProfile();
        Alert.alert('Success', `Booking status updated to ${status}.`);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to transition booking status.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading shelter panel...</Text>
      </View>
    );
  }

  // Stepper render for Mobile Shelter Setup
  if (!profile) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.setupTitle}>Create Your Shelter Profile</Text>
          <Text style={styles.setupSubtitle}>Define boarding and lodgings for pet owners in Lahore/Karachi.</Text>

          <Text style={styles.label}>Shelter Name</Text>
          <TextInput 
            style={styles.input} 
            value={shelterName} 
            onChangeText={setShelterName} 
            placeholder="e.g. Paw Haven DHA"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={description} 
            onChangeText={setDescription} 
            placeholder="Describe your shelter amenities..."
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput 
            style={styles.input} 
            value={phone} 
            onChangeText={setPhone} 
            placeholder="e.g. 03001234567"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>City</Text>
          <TextInput 
            style={styles.input} 
            value={city} 
            onChangeText={setCity} 
            placeholder="e.g. Lahore"
          />

          <Text style={styles.label}>Address</Text>
          <TextInput 
            style={styles.input} 
            value={address} 
            onChangeText={setAddress} 
            placeholder="e.g. Sector H, DHA"
          />

          <Text style={styles.label}>Daily Boarding Price (PKR)</Text>
          <TextInput 
            style={styles.input} 
            value={dailyRate} 
            onChangeText={setDailyRate} 
            keyboardType="numeric"
          />

          <Text style={styles.label}>Max Shelter Capacity</Text>
          <TextInput 
            style={styles.input} 
            value={capacity} 
            onChangeText={setCapacity} 
            keyboardType="numeric"
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>We provide home pickup service</Text>
            <Switch value={providesPickup} onValueChange={setProvidesPickup} />
          </View>

          <TouchableOpacity style={styles.btnPublish} onPress={handleSaveShelter}>
            <Text style={styles.btnPublishText}>Publish Shelter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const pendingRequests = bookings.filter(b => b.status === 'Pending');
  const activeStays = bookings.filter(b => b.status === 'Active');

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.shelterTitle}>{profile.name}</Text>
        </View>
        <TouchableOpacity style={styles.btnSignout} onPress={onLogout}>
          <Feather name="log-out" size={16} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Capacity</Text>
          <Text style={styles.metricVal}>{profile.capacity}</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: '#EFF6FF' }]}>
          <Text style={[styles.metricLabel, { color: COLORS.primary }]}>Available</Text>
          <Text style={[styles.metricVal, { color: COLORS.primary }]}>
            {Math.max(0, profile.capacity - profile.occupiedSpaces)}
          </Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: '#ECFDF5' }]}>
          <Text style={[styles.metricLabel, { color: '#059669' }]}>Stays</Text>
          <Text style={[styles.metricVal, { color: '#059669' }]}>{profile.occupiedSpaces}</Text>
        </View>
      </View>

      {/* Tab select bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>Stays</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'bookings' && styles.tabButtonActive]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>
            Requests ({pendingRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'settings' && styles.tabButtonActive]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Stays view */}
      {activeTab === 'overview' && (
        <FlatList 
          data={activeStays}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="paw" size={40} color="#94A3B8" />
              <Text style={styles.emptyText}>No pets currently staying at your shelter.</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.stayCard}>
              <View style={styles.stayHeader}>
                <Text style={styles.petName}>{item.pet?.name} ({item.pet?.breed})</Text>
                <Text style={styles.dateRange}>
                  {new Date(item.checkInDate).toLocaleDateString()} - {new Date(item.checkOutDate).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.careNotes}>Care instructions: {item.specialInstructions || 'None'}</Text>
              <TouchableOpacity 
                style={styles.btnComplete}
                onPress={() => handleUpdateBooking(item.id, 'Completed')}
              >
                <Text style={styles.btnCompleteText}>Complete Stay</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Bookings Request list */}
      {activeTab === 'bookings' && (
        <FlatList 
          data={pendingRequests}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="calendar" size={40} color="#94A3B8" />
              <Text style={styles.emptyText}>No pending requests found.</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.stayCard}>
              <View style={styles.stayHeader}>
                <Text style={styles.petName}>{item.pet?.name} ({item.pet?.breed})</Text>
                <Text style={styles.totalAmount}>{item.totalAmount} PKR</Text>
              </View>
              <Text style={styles.stayDesc}>Service: {item.service?.name || 'Boarding'}</Text>
              <Text style={styles.stayDesc}>Duration: {item.duration} Days</Text>
              {item.pickupOption !== 'No Pickup' && (
                <Text style={styles.pickupText}>Pickup: {item.pickupOption} | {item.pickupAddress}</Text>
              )}
              
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
                  onPress={() => handleUpdateBooking(item.id, 'Accepted')}
                >
                  <Text style={styles.actionBtnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
                  onPress={() => handleUpdateBooking(item.id, 'Rejected', 'Availability issue')}
                >
                  <Text style={styles.actionBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Profile Settings view */}
      {activeTab === 'settings' && (
        <ScrollView contentContainerStyle={styles.settingsScroll}>
          <Text style={styles.label}>Shelter Name</Text>
          <TextInput style={styles.input} value={shelterName} onChangeText={setShelterName} />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} />

          <Text style={styles.label}>Address</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} />

          <Text style={styles.label}>Daily Price Rate (PKR)</Text>
          <TextInput style={styles.input} value={dailyRate} onChangeText={setDailyRate} keyboardType="numeric" />

          <TouchableOpacity style={styles.btnPublish} onPress={handleSaveShelter}>
            <Text style={styles.btnPublishText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B'
  },
  scrollContainer: {
    padding: 16,
    backgroundColor: '#F1F5F9'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center'
  },
  setupSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center'
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 12
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    fontSize: 14,
    backgroundColor: '#FFFFFF'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8
  },
  switchLabel: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500'
  },
  btnPublish: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  btnPublishText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1E293B'
  },
  welcomeText: {
    fontSize: 12,
    color: '#94A3B8'
  },
  shelterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF'
  },
  btnSignout: {
    backgroundColor: '#EF4444',
    padding: 10,
    borderRadius: 8
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    justifyContent: 'space-between'
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    fontWeight: '600'
  },
  metricVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 4
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF'
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabButtonActive: {
    borderBottomColor: COLORS.primary
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B'
  },
  tabTextActive: {
    color: COLORS.primary
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    color: '#94A3B8'
  },
  emptyText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center'
  },
  stayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  stayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  petName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A'
  },
  dateRange: {
    fontSize: 12,
    color: '#64748B'
  },
  careNotes: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 12
  },
  stayDesc: {
    fontSize: 13,
    color: '#475569',
    marginVertical: 2
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  pickupText: {
    fontSize: 12,
    color: '#059669',
    backgroundColor: '#ECFDF5',
    padding: 4,
    borderRadius: 4,
    width: 'fit-content',
    marginTop: 4
  },
  btnComplete: {
    backgroundColor: '#10B981',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  btnCompleteText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12
  },
  actionBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  actionBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13
  },
  settingsScroll: {
    padding: 16
  }
});
