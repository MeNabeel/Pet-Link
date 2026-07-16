import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  FlatList, ActivityIndicator, Alert 
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import PetImage from '../components/PetImage';

export default function MyPets({ user, onViewDetails, onAddPet, onEditPet }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const fetchPets = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pets/owner/${user._id}`);
      const data = await response.json();
      if (response.ok) {
        setPets(data);
      }
    } catch (err) {
      console.log('Error fetching user pets:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchPets();
    }
  }, [user]);

  const handleDeletePet = (petId) => {
    Alert.alert(
      "Remove Companion",
      "Are you sure you want to delete this pet profile?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive", 
          onPress: async () => {
            try {
              const response = await fetch(`http://localhost:5000/api/pets/${petId}`, {
                method: 'DELETE',
              });
              if (response.ok) {
                setActiveMenuId(null);
                fetchPets();
              }
            } catch (err) {
              console.log('Error deleting pet:', err);
            }
          } 
        }
      ]
    );
  };

  const renderPetCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.petCard} 
      onPress={() => onViewDetails(item._id)}
      activeOpacity={0.9}
    >
      {/* Pet Photo Container */}
      <View style={styles.petImgContainer}>
        <PetImage src={item.image} imageSettings={item.imageSettings} type="card" />

        {/* Badges Overlays */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: COLORS.dark }]}>
            <Text style={styles.badgeText}>{item.activeStatus.replace('_', ' ')}</Text>
          </View>
        </View>

        {/* Dropdown Menu Trigger */}
        <TouchableOpacity 
          style={styles.moreBtn} 
          onPress={(e) => {
            setActiveMenuId(activeMenuId === item._id ? null : item._id);
          }}
        >
          <Feather name="more-vertical" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* Custom Inline Popover Dropdown (Expo Web safe) */}
        {activeMenuId === item._id && (
          <View style={styles.menuDropdown}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setActiveMenuId(null); onEditPet(item._id); }}>
              <Feather name="edit-2" size={13} color={COLORS.darkLight} style={styles.menuItemIcon} />
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => handleDeletePet(item._id)}>
              <Feather name="trash-2" size={13} color="#EF4444" style={styles.menuItemIcon} />
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Pet Details */}
      <View style={styles.petCardBody}>
        <View style={styles.petRowHeader}>
          <View>
            <Text style={styles.petNameText}>{item.name}</Text>
            <Text style={styles.petBreedText}>{item.breed} • {item.species}</Text>
          </View>
          <Text style={styles.genderTag}>{item.gender}</Text>
        </View>

        {/* Summary Capsules */}
        <View style={styles.capsuleRow}>
          <View style={styles.grayCapsule}>
            <Feather name="user" size={12} color={COLORS.muted} style={styles.capsuleIcon} />
            <Text style={styles.capsuleText}>{item.age}</Text>
          </View>
          <View style={styles.grayCapsule}>
            <Feather name="activity" size={12} color={COLORS.muted} style={styles.capsuleIcon} />
            <Text style={styles.capsuleText}>{item.weight}</Text>
          </View>
          {item.isVaccinated ? (
            <View style={styles.blueCapsule}>
              <Feather name="check-circle" size={11} color={COLORS.white} style={styles.capsuleIcon} />
              <Text style={styles.blueCapsuleText}>Vaccinated</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Intro Header Section */}
      <View style={styles.introHeader}>
        <Text style={styles.introTitle}>Your Furry Family</Text>
        <Text style={styles.introSubtitle}>
          Manage profiles, health records, and daily needs for your companions.
        </Text>
      </View>

      {/* Pets FlatList */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item._id}
          renderItem={renderPetCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchPets}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome name="paw" size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>No pet profiles registered yet.</Text>
              <Text style={styles.emptySubText}>Tap the + button to add your first furry companion!</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity style={styles.fabBtn} onPress={onAddPet}>
        <Feather name="plus" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
  },
  introHeader: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
  },
  introSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 16,
    marginTop: 4,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  loader: {
    marginTop: 40,
  },
  petCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  petImgContainer: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.bgLight,
    position: 'relative',
  },
  petImg: {
    width: '100%',
    height: '100%',
  },
  petPlaceholderImg: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.border,
    opacity: 0.3,
  },
  badgeRow: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  moreBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuDropdown: {
    position: 'absolute',
    top: 48,
    right: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgLight,
  },
  menuItemIcon: {
    marginRight: 8,
  },
  menuItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.darkLight,
  },
  petCardBody: {
    padding: 16,
  },
  petRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  petNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.dark,
  },
  petBreedText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
    marginTop: 2,
  },
  genderTag: {
    fontSize: 10,
    fontWeight: '800',
    backgroundColor: 'rgba(0,102,204,0.06)',
    color: COLORS.primary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  capsuleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  grayCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  capsuleIcon: {
    marginRight: 4,
  },
  capsuleText: {
    fontSize: 11,
    color: COLORS.darkLight,
    fontWeight: '700',
  },
  blueCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  blueCapsuleText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: '700',
  },
  fabBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.darkLight,
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
});
