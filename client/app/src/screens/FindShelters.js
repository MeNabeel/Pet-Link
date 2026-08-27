import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, 
  ActivityIndicator, Image, Dimensions
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function FindShelters({ user, onNavigate }) {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const fetchShelters = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/shelter/public/list?`;
      if (cityFilter) url += `city=${encodeURIComponent(cityFilter)}&`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        
        let filtered = data;
        if (searchTerm) {
          filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.city.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setShelters(filtered);
      }
    } catch (err) {
      console.log('Error searching shelters on mobile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, [searchTerm, cityFilter]);

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
            placeholder="Search shelter name or city..." 
          />
        </View>

        {/* Quick city selectors */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['', 'Lahore', 'Karachi', 'Islamabad'].map(c => (
            <TouchableOpacity 
              key={c}
              style={[styles.cityFilterBtn, cityFilter === c && styles.cityFilterBtnActive]}
              onPress={() => setCityFilter(c)}
            >
              <Text style={[styles.cityFilterText, cityFilter === c && styles.cityFilterTextActive]}>
                {c === '' ? 'All Cities' : c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Shelters FlatList */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Locating boarding shelters...</Text>
        </View>
      ) : (
        <FlatList 
          data={shelters}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPadding}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="home" size={40} color="#94A3B8" />
              <Text style={styles.emptyText}>No boarding shelters found in your city.</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const spacesAvailable = Math.max(0, item.capacity - item.occupiedSpaces);
            return (
              <TouchableOpacity 
                style={styles.shelterCard}
                onPress={() => onNavigate('shelterDetails', item.id)}
              >
                <Image 
                  source={{ uri: item.logo || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=320' }} 
                  style={styles.cardImage} 
                />
                <View style={styles.cardInfo}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <View style={styles.ratingBox}>
                      <Feather name="star" size={12} color="#F59E0B" />
                      <Text style={styles.ratingVal}>4.8</Text>
                    </View>
                  </View>

                  <Text style={styles.cardLocation}>
                    <Feather name="map-pin" size={11} /> {item.address}, {item.city}
                  </Text>

                  <View style={styles.cardMeta}>
                    <Text style={styles.availableText}>
                      Spaces: {spacesAvailable} / {item.capacity}
                    </Text>
                    <Text style={styles.rateText}>{item.dailyRate} PKR/day</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
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
  cityFilterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: '#F1F5F9',
    marginRight: 8
  },
  cityFilterBtnActive: {
    backgroundColor: COLORS.primary
  },
  cityFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  cityFilterTextActive: {
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
    padding: 48
  },
  emptyText: {
    marginTop: 12,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center'
  },
  shelterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    overflow: 'hidden'
  },
  cardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover'
  },
  cardInfo: {
    padding: 16
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardName: {
    fontSize: 16,
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
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12
  },
  availableText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981'
  },
  rateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A'
  }
});
