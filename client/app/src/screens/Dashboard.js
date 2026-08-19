import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, 
  ActivityIndicator, Dimensions, Platform
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function Dashboard({ user, onLogout, onNavigate }) {
  const [pets, setPets] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real pets and products in parallel from MongoDB backend
  useEffect(() => {
    if (!user || !user._id) return;
    
    const fetchPets = fetch(`http://localhost:5000/api/pets/owner/${user._id}`)
      .then(res => res.json())
      .catch(err => {
        console.log('Error loading dashboard pets:', err);
        return [];
      });

    const fetchProducts = fetch(`http://localhost:5000/api/products?status=Published&visibility=Public`)
      .then(res => res.json())
      .catch(err => {
        console.log('Error loading dashboard products:', err);
        return [];
      });

    Promise.all([fetchPets, fetchProducts])
      .then(([petsData, productsData]) => {
        if (Array.isArray(petsData)) {
          setPets(petsData);
        }
        if (Array.isArray(productsData)) {
          setProducts(productsData);
        }
        setLoading(false);
      })
      .catch(err => {
        console.log('Error in promise.all fetching dashboard data:', err);
        setLoading(false);
      });
  }, [user._id]);

  if (!user) return null;

  // Fallback items if user has no pets added yet
  const defaultPets = [
    { _id: '1', name: 'Buddy', breed: 'Golden Retriever', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=150', species: 'Dog' },
    { _id: '2', name: 'Milo', breed: 'Persian Cat', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=150', species: 'Cat' },
    { _id: '3', name: 'Luna', breed: 'Labrador', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=150', species: 'Dog' }
  ];

  const displayPets = pets.length > 0 ? pets : defaultPets;

  // Filter products dynamically based on user pet species
  const getRecommendedProducts = () => {
    if (products.length === 0) {
      // Premium static fallback products
      return [
        { _id: 'rec1', name: 'Healthy Dog Kibbles', price: 1250, image: 'https://images.unsplash.com/photo-1585499103188-5972f78a7270?auto=format&fit=crop&q=80&w=240' },
        { _id: 'rec2', name: 'Grooming Brush Combo', price: 850, image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=240' },
        { _id: 'rec3', name: 'Interactive Cat Toy Wand', price: 450, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=240' }
      ];
    }

    if (pets.length > 0) {
      const firstPetSpecies = pets[0].species ? pets[0].species.toLowerCase() : 'dog';
      const filtered = products.filter(p => 
        (p.name && p.name.toLowerCase().includes(firstPetSpecies)) || 
        (p.description && p.description.toLowerCase().includes(firstPetSpecies))
      );
      if (filtered.length > 0) {
        return filtered.slice(0, 4);
      }
    }
    return products.slice(0, 4);
  };

  const recProducts = getRecommendedProducts();

  // Dynamic user activities
  const getUserActivities = () => {
    if (pets.length === 0) {
      return [
        { id: 'act1', type: 'vet', message: 'You searched for nearby veterinarians in Lahore.', time: '2h ago' },
        { id: 'act2', type: 'shelter', message: 'You viewed active boarding shelters.', time: '5h ago' }
      ];
    }

    return pets.map((pet, idx) => {
      let message = `You created a health profile for pet ${pet.name}.`;
      let type = 'profile';

      if (pet.activeStatus === 'FOR_SALE') {
        message = `You listed pet ${pet.name} for Sale on Marketplace.`;
        type = 'sale';
      } else if (pet.activeStatus === 'FOR_ADOPTION') {
        message = `You listed pet ${pet.name} for Adoption on Marketplace.`;
        type = 'adoption';
      } else if (pet.activeStatus === 'ARCHIVED') {
        message = `You archived the listing of pet ${pet.name}.`;
        type = 'archive';
      } else if (pet.isVaccinated) {
        message = `You updated vaccination records of pet ${pet.name}.`;
        type = 'vaccine';
      }

      const times = ['1h ago', '3h ago', '1d ago', '2d ago'];
      return {
        id: pet._id,
        type,
        message,
        time: times[idx % times.length]
      };
    });
  };

  const activities = getUserActivities();

  // Get upcoming vaccination notifications
  const getVaccinationNotification = () => {
    const petsWithVaccines = pets.filter(p => p.nextVaccinationDate);
    if (petsWithVaccines.length > 0) {
      const targetPet = petsWithVaccines[0];
      return `Next vaccine for ${targetPet.name} is due on ${targetPet.nextVaccinationDate}.`;
    }
    if (pets.length > 0) {
      return `Next vaccination for ${pets[0].name} is due soon. Click to schedule.`;
    }
    return `No upcoming vaccine alerts. Go to My Pets to track records.`;
  };

  const notificationAlert = getVaccinationNotification();

  const handleAction = (title) => {
    alert(`${title} view mapped in dashboard.`);
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      
      {/* 1. Greeting Row */}
      <View style={styles.greetingRow}>
        <View style={styles.greetingLeft}>
          <View style={styles.avatarWrapper}>
            {user.profilePic ? (
              <Image source={{ uri: user.profilePic }} style={styles.userAvatar} />
            ) : (
              <View style={styles.defaultAvatarIcon}>
                <Feather name="user" size={20} color="#5C6B73" />
              </View>
            )}
            <View style={styles.activeIndicator} />
          </View>

          <View style={styles.greetingTextContainer}>
            <Text style={styles.welcomeBackText}>Welcome back,</Text>
            <Text style={styles.userNameText}>{user.name}!</Text>
          </View>
        </View>

      </View>

      {/* 2. My Pets Container (Blue Primary Card) */}
      <View style={[styles.myPetsCard, { backgroundColor: COLORS.primary, shadowColor: COLORS.primary }]}>
        <View style={styles.petsHeader}>
          <View style={styles.petsHeaderLeft}>
            <FontAwesome5 name="paw" size={16} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.petsCardTitle}>My Pets</Text>
          </View>
          <TouchableOpacity 
            style={styles.viewPetsLink} 
            onPress={() => onNavigate ? onNavigate('mypets', 'list') : handleAction('Pet Manager')}
          >
            <Text style={styles.viewPetsText}>{pets.length > 0 ? pets.length : 3} Pets</Text>
            <Feather name="chevron-right" size={14} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.petsListContainer}>
          {displayPets.map((pet) => (
            <View key={pet._id} style={styles.petItem}>
              <View style={styles.petImageFrame}>
                {pet.image ? (
                  <Image source={{ uri: pet.image }} style={styles.petAvatarImg} />
                ) : (
                  <View style={styles.defaultPetAvatar}>
                    <FontAwesome5 name="dog" size={16} color="#94A3B8" />
                  </View>
                )}
              </View>
              <Text style={styles.petNameLabel}>{pet.name}</Text>
              <Text style={styles.petBreedLabel} numberOfLines={1}>{pet.breed}</Text>
            </View>
          ))}

          {/* Add Pet dashed circular launcher */}
          <TouchableOpacity 
            style={styles.addPetLauncher} 
            onPress={() => onNavigate ? onNavigate('mypets', 'form') : handleAction('Add Pet Form')}
          >
            <View style={styles.dashedCircle}>
              <Feather name="plus" size={20} color="#FFF" />
            </View>
            <Text style={styles.addPetLabel}>Add Pet</Text>
            <Text style={styles.petBreedLabel}>New Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 3. Action Grid shortcuts (2x2 Matrix) */}
      <View style={styles.gridSection}>
        <View style={styles.gridRow}>
          <TouchableOpacity 
            style={styles.gridCard} 
            onPress={() => onNavigate ? onNavigate('store', 'pets') : handleAction('Marketplace')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Feather name="shopping-bag" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.gridCardText}>
              <Text style={styles.gridCardTitleText}>Marketplace</Text>
              <Text style={styles.gridCardSubText}>Adopt or buy pets</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={() => handleAction('Nearby Vet')}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF5F5' }]}>
              <Feather name="activity" size={18} color="#EF4444" />
            </View>
            <View style={styles.gridCardText}>
              <Text style={styles.gridCardTitleText}>Nearby Vet</Text>
              <Text style={styles.gridCardSubText}>Find veterinarians</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.gridCard} onPress={() => handleAction('Shelter')}>
            <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
              <Feather name="home" size={18} color="#16A34A" />
            </View>
            <View style={styles.gridCardText}>
              <Text style={styles.gridCardTitleText}>Shelter</Text>
              <Text style={styles.gridCardSubText}>Board your pets</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridCard} onPress={() => handleAction('Find Trainer')}>
            <View style={[styles.iconCircle, { backgroundColor: '#FAF5FF' }]}>
              <Feather name="award" size={18} color="#8B5CF6" />
            </View>
            <View style={styles.gridCardText}>
              <Text style={styles.gridCardTitleText}>Find Trainer</Text>
              <Text style={styles.gridCardSubText}>Expert pet trainee</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Recommended Services / Products Column */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
        <TouchableOpacity onPress={() => onNavigate ? onNavigate('store') : handleAction('Store')}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalCardsScroll}>
        {recProducts.map((product) => (
          <TouchableOpacity 
            key={product._id} 
            style={styles.recCard} 
            onPress={() => onNavigate ? onNavigate('store') : handleAction('Store')}
          >
            <Image 
              source={{ uri: (product.images && product.images.length > 0) ? product.images[0] : (product.image || 'https://images.unsplash.com/photo-1585499103188-5972f78a7270?auto=format&fit=crop&q=80&w=240') }} 
              style={styles.recCardImage} 
            />
            <View style={styles.recCardContent}>
              <Text style={styles.recCardTitle} numberOfLines={1}>{product.name}</Text>
              <Text style={styles.recCardBookLink}>PKR {product.price}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 5. Recent Activity Log */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      
      <View style={styles.activityFeedBox}>
        {activities.map((act, index) => (
          <View key={act.id}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIconWrapper, { 
                backgroundColor: act.type === 'sale' || act.type === 'adoption' ? '#EFF6FF' :
                                 act.type === 'archive' ? '#FFF5F5' :
                                 act.type === 'vaccine' ? '#F0FDF4' : '#F8FAFC' 
              }]}>
                <Feather 
                  name={
                    act.type === 'sale' || act.type === 'adoption' ? 'shopping-bag' :
                    act.type === 'archive' ? 'archive' :
                    act.type === 'vaccine' ? 'shield' : 'info'
                  } 
                  size={16} 
                  color={
                    act.type === 'sale' || act.type === 'adoption' ? COLORS.primary :
                    act.type === 'archive' ? '#EF4444' :
                    act.type === 'vaccine' ? '#16A34A' : '#64748B'
                  } 
                />
              </View>
              <View style={styles.activityTextWrapper}>
                <Text style={styles.activityMessageText}>{act.message}</Text>
                <Text style={styles.activityTimeText}>{act.time}</Text>
              </View>
            </View>
            {index < activities.length - 1 && <View style={styles.activitySeparator} />}
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  
  /* Greeting */
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  defaultAvatarIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  greetingTextContainer: {
    flexDirection: 'column',
  },
  welcomeBackText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },

  /* Pets Card */
  myPetsCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  petsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  petsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petsCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
  viewPetsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewPetsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  petsListContainer: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  petItem: {
    alignItems: 'center',
    width: 70,
  },
  petImageFrame: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#FFF',
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  petAvatarImg: {
    width: '100%',
    height: '100%',
  },
  defaultPetAvatar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petNameLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 6,
    textAlign: 'center',
  },
  petBreedLabel: {
    fontSize: 8,
    color: '#E0F2FE',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 1,
  },
  addPetLauncher: {
    alignItems: 'center',
    width: 70,
  },
  dashedCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#FFF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPetLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 6,
  },

  /* Grid access cards */
  gridSection: {
    marginBottom: 20,
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCardText: {
    flex: 1,
  },
  gridCardTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  gridCardSubText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },

  /* Recommended Services Row */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '850',
    color: '#0F172A',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '800',
  },
  horizontalCardsScroll: {
    flexDirection: 'row',
    gap: 14,
    paddingBottom: 16,
    marginBottom: 10,
  },
  recCard: {
    width: 140,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  recCardImage: {
    width: '100%',
    height: 100,
  },
  recCardContent: {
    padding: 10,
  },
  recCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  recCardBookLink: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '800',
    marginTop: 4,
  },

  /* Activity Feed Box */
  activityFeedBox: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTextWrapper: {
    flex: 1,
  },
  activityMessageText: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 15,
    fontWeight: '500',
  },
  activityTimeText: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
  },
  activitySeparator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
});
