import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, 
  ActivityIndicator, Image, Alert, ScrollView
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function FindClinics({ user, onNavigate }) {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [emergencyFilter, setEmergencyFilter] = useState(false);

  // Mock location simulation for simulator/testing compatibility
  const [latitude, setLatitude] = useState(31.5204); // Default to Lahore coordinates
  const [longitude, setLongitude] = useState(74.3587);

  const fetchClinics = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/clinics/nearby?`;
      if (latitude && longitude) {
        url += `lat=${latitude}&lng=${longitude}&`;
      }
      if (cityFilter) {
        url += `city=${encodeURIComponent(cityFilter)}&`;
      }
      if (emergencyFilter) {
        url += `providesEmergency=true&`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        
        let filtered = data;
        if (searchTerm) {
          filtered = filtered.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            c.address.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setClinics(filtered);
      }
    } catch (err) {
      console.log('Error fetching clinics on mobile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, [searchTerm, cityFilter, emergencyFilter]);

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color="#64748B" />
          <TextInput 
            style={styles.searchInput} 
            value={searchTerm} 
            onChangeText={setSearchTerm} 
            placeholder="Search clinic name or area..." 
          />
        </View>

        {/* Quick Filters Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterBtn, cityFilter === '' && styles.filterBtnActive]}
            onPress={() => setCityFilter('')}
          >
            <Text style={[styles.filterText, cityFilter === '' && styles.filterTextActive]}>All Cities</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, cityFilter === 'Lahore' && styles.filterBtnActive]}
            onPress={() => setCityFilter('Lahore')}
          >
            <Text style={[styles.filterText, cityFilter === 'Lahore' && styles.filterTextActive]}>Lahore</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, cityFilter === 'Karachi' && styles.filterBtnActive]}
            onPress={() => setCityFilter('Karachi')}
          >
            <Text style={[styles.filterText, cityFilter === 'Karachi' && styles.filterTextActive]}>Karachi</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterBtn, emergencyFilter && styles.filterBtnActive]}
            onPress={() => setEmergencyFilter(!emergencyFilter)}
          >
            <Text style={[styles.filterText, emergencyFilter && styles.filterTextActive]}>Emergency Only</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Locating nearest veterinary clinics...</Text>
        </View>
      ) : clinics.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="activity" size={40} color="#94A3B8" />
          <Text style={styles.emptyText}>No veterinary clinics match your filters.</Text>
        </View>
      ) : (
        <FlatList 
          data={clinics}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPadding}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => onNavigate('clinicDetails', item.id)}
            >
              <Image source={{ uri: item.logo || 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=320' }} style={styles.cardImage} />
              
              <View style={styles.cardInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={styles.ratingBox}>
                    <Feather name="star" size={12} color="#F59E0B" />
                    <Text style={styles.ratingVal}>{item.rating}</Text>
                  </View>
                </View>

                <Text style={styles.cardLocation}>
                  <Feather name="map-pin" size={11} /> {item.address}, {item.city}
                </Text>

                {item.distance && (
                  <Text style={styles.distanceText}>
                    Estimated {parseFloat(item.distance).toFixed(1)} km away
                  </Text>
                )}

                <View style={styles.cardFooter}>
                  <Text style={styles.feeText}>Consultation: {item.startingFee} PKR</Text>
                  {item.providesEmergency && (
                    <Badge style={styles.emergencyBadge}>24/7 ER</Badge>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

// Simple Badge mock for mobile layout
function Badge({ children, style }) {
  return (
    <View style={[styles.badgeContainer, style]}>
      <Text style={styles.badgeText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  searchHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0F172A'
  },
  filterScroll: {
    marginTop: 12,
    flexDirection: 'row'
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: '#F1F5F9',
    marginRight: 8
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  filterTextActive: {
    color: COLORS.white
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B'
  },
  listPadding: {
    padding: 16
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    flex: 1
  },
  emptyText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden'
  },
  cardImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover'
  },
  cardInfo: {
    padding: 16
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  ratingVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B'
  },
  cardLocation: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 6
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12
  },
  feeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155'
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEF2F2'
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444'
  }
});
