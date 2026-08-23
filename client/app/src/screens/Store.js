import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  FlatList, ActivityIndicator, Alert, TextInput, ScrollView 
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function Store({ user, onBack, initialMode }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wishlist, setWishlist] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // Tab state: 'pets' or 'products'
  const [viewMode, setViewMode] = useState(initialMode || 'products');

  // Quick view states
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);

  // Sync mode if changed externally
  useEffect(() => {
    if (initialMode) {
      setViewMode(initialMode);
    }
  }, [initialMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const catRes = await fetch('http://localhost:5000/api/categories');
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.filter(c => c.status === 'Active'));
      }

      const prodRes = await fetch('http://localhost:5000/api/products?status=Published&visibility=Public');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData || []);
      }

      const petsRes = await fetch('http://localhost:5000/api/pets');
      if (petsRes.ok) {
        const petsData = await petsRes.json();
        setPets(petsData || []);
      }
    } catch (err) {
      console.log('Error loading mobile marketplace database catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(prev => prev.filter(item => item !== id));
    } else {
      setWishlist(prev => [...prev, id]);
    }
  };

  const handleAddToCart = (product) => {
    setCartCount(prev => prev + 1);
    Alert.alert("Basket", `Added ${product.name} to shopping basket!`);
  };

  const handleProductPress = (id) => {
    Alert.alert(
      "Routing Placeholder",
      `Navigating to route endpoint: /product/${id}\n\nINFO: Detail specifications page mapped for next sprint.`,
      [{ text: "OK" }]
    );
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || (p.category && p.category._id === selectedCategory);
    return matchesSearch && matchesCat;
  });

  const filteredPets = pets.filter(p => {
    const isAvailable = p.activeStatus === 'FOR_SALE' || p.activeStatus === 'FOR_ADOPTION';
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.breed.toLowerCase().includes(search.toLowerCase());
    return isAvailable && matchesSearch;
  });

  const renderProductCard = ({ item }) => {
    const price = item.salePrice || item.regularPrice;
    const isWishlisted = wishlist.includes(item._id);

    return (
      <View style={styles.card}>
        <TouchableOpacity style={styles.cardMedia} activeOpacity={0.9} onPress={() => handleProductPress(item._id)}>
          {item.images && item.images.length > 0 ? (
            <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
          ) : (
            <View style={styles.cardNoImg}><Feather name="package" size={24} color={COLORS.muted} /></View>
          )}

          <Text style={styles.cardCatBadge}>{item.category?.name || 'Item'}</Text>
          
          <TouchableOpacity style={styles.wishBtn} onPress={() => toggleWishlist(item._id)}>
            <FontAwesome 
              name={isWishlisted ? "heart" : "heart-o"} 
              size={14} 
              color={isWishlisted ? "#EF4444" : COLORS.dark} 
            />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.cardBody}>
          {item.brand ? <Text style={styles.cardBrand}>{item.brand}</Text> : null}
          <Text style={styles.cardTitle} numberOfLines={1} onPress={() => handleProductPress(item._id)}>
            {item.name}
          </Text>

          <View style={styles.ratingsRow}>
            <View style={styles.stars}>
              <FontAwesome name="star" size={10} color="#FBBF24" />
              <FontAwesome name="star" size={10} color="#FBBF24" />
              <FontAwesome name="star" size={10} color="#FBBF24" />
              <FontAwesome name="star" size={10} color="#FBBF24" />
              <FontAwesome name="star-o" size={10} color="#D1D5DB" />
            </View>
            <Text style={styles.ratingText}>4.8</Text>
          </View>

          <Text style={styles.cardShortDesc} numberOfLines={2}>{item.shortDescription || 'Verified platform catalog product.'}</Text>

          <View style={styles.priceRow}>
            <View>
              {item.salePrice ? (
                <>
                  <Text style={styles.salePrice}>{item.salePrice.toLocaleString()} PKR</Text>
                  <Text style={styles.regPriceCrossed}>{item.regularPrice.toLocaleString()} PKR</Text>
                </>
              ) : (
                <Text style={styles.salePrice}>{item.regularPrice.toLocaleString()} PKR</Text>
              )}
            </View>
            <Text style={styles.stockTag}>{item.stockStatus}</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.quickViewBtn} onPress={() => setSelectedProductForModal(item)}>
              <Feather name="eye" size={12} color={COLORS.muted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addToCartBtn} onPress={() => handleAddToCart(item)}>
              <Feather name="shopping-bag" size={12} color={COLORS.white} style={{ marginRight: 4 }} />
              <Text style={styles.addToCartText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderPetCard = ({ item }) => {
    const isSale = item.activeStatus === 'FOR_SALE';
    return (
      <View style={styles.card}>
        <View style={styles.cardMedia}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.cardImage} />
          ) : (
            <View style={styles.cardNoImg}>
              <FontAwesome name="paw" size={24} color={COLORS.muted} />
            </View>
          )}

          <Text style={[styles.cardCatBadge, { backgroundColor: isSale ? '#EA580C' : '#10B981' }]}>
            {isSale ? 'For Sale' : 'Adoption'}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardBrand}>{item.breed} • {item.age}</Text>

          <View style={styles.ratingsRow}>
            <Feather name="map-pin" size={10} color={COLORS.muted} style={{ marginRight: 4 }} />
            <Text style={styles.ratingText} numberOfLines={1}>{item.city || 'Lahore'}, {item.province || 'Punjab'}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.salePrice}>
              {isSale ? `${item.price || 'Negotiable'} PKR` : 'Free Adoption'}
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.addToCartBtn, { flex: 1, backgroundColor: COLORS.primary }]}
              onPress={() => Alert.alert('Contact Owner', `Owner: ${item.owner?.name || 'Pet Owner'}\nPhone: ${item.phone || '+92 300 1234567'}`)}
            >
              <Feather name="phone" size={12} color={COLORS.white} style={{ marginRight: 6 }} />
              <Text style={styles.addToCartText}>Call Owner</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Store Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={18} color={COLORS.dark} />
          <Text style={styles.backBtnText}>Exit</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{viewMode === 'pets' ? 'Pet Marketplace' : 'PetLink Store'}</Text>
        
        {viewMode === 'products' ? (
          <View style={styles.cartBtn}>
            <Feather name="shopping-bag" size={16} color={COLORS.primary} />
            <Text style={styles.cartCountText}>{cartCount}</Text>
          </View>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* Segmented View Mode Toggle */}
      <View style={styles.toggleBar}>
        <TouchableOpacity 
          style={[styles.toggleBtn, viewMode === 'pets' && styles.toggleBtnActive]}
          onPress={() => setViewMode('pets')}
        >
          <FontAwesome name="paw" size={14} color={viewMode === 'pets' ? COLORS.white : COLORS.muted} style={{ marginRight: 6 }} />
          <Text style={[styles.toggleBtnText, viewMode === 'pets' && styles.toggleBtnTextActive]}>Adopt/Buy Pets</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleBtn, viewMode === 'products' && styles.toggleBtnActive]}
          onPress={() => setViewMode('products')}
        >
          <Feather name="shopping-bag" size={14} color={viewMode === 'products' ? COLORS.white : COLORS.muted} style={{ marginRight: 6 }} />
          <Text style={[styles.toggleBtnText, viewMode === 'products' && styles.toggleBtnTextActive]}>Pet Products</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Horizontal Selector (Only for products) */}
      {viewMode === 'products' && (
        <View style={styles.catSelectorWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            <TouchableOpacity 
              style={[styles.catChip, selectedCategory === 'all' && styles.catChipActive]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[styles.catChipText, selectedCategory === 'all' && styles.catChipTextActive]}>All Items</Text>
            </TouchableOpacity>
            {categories.map(c => (
              <TouchableOpacity 
                key={c._id} 
                style={[styles.catChip, selectedCategory === c._id && styles.catChipActive]}
                onPress={() => setSelectedCategory(c._id)}
              >
                <Text style={[styles.catChipText, selectedCategory === c._id && styles.catChipTextActive]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={COLORS.muted} style={{ marginRight: 8 }} />
        <TextInput 
          placeholder={viewMode === 'products' ? "Search foods, toys, wellness..." : "Search pets name, breed..."}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Quick View Modal Overlay */}
      {selectedProductForModal && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseX} onPress={() => setSelectedProductForModal(null)}>
              <Feather name="x" size={20} color={COLORS.dark} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedProductForModal.images && selectedProductForModal.images.length > 0 ? (
                <Image source={{ uri: selectedProductForModal.images[0] }} style={styles.modalImg} />
              ) : (
                <View style={styles.modalNoImg}><Feather name="package" size={48} color={COLORS.muted} /></View>
              )}

              <Text style={styles.modalCat}>{selectedProductForModal.category?.name || 'Pet Item'}</Text>
              <Text style={styles.modalTitle}>{selectedProductForModal.name}</Text>
              {selectedProductForModal.brand ? <Text style={styles.modalBrand}>Manufactured by {selectedProductForModal.brand}</Text> : null}

              <View style={styles.modalPriceRow}>
                <Text style={styles.modalPriceVal}>
                  {selectedProductForModal.salePrice ? `${selectedProductForModal.salePrice.toLocaleString()} PKR` : `${selectedProductForModal.regularPrice.toLocaleString()} PKR`}
                </Text>
                {selectedProductForModal.salePrice && (
                  <Text style={styles.modalRegPriceCrossed}>{selectedProductForModal.regularPrice.toLocaleString()} PKR</Text>
                )}
              </View>

              <Text style={styles.modalSubTitle}>Description Details</Text>
              <Text style={styles.modalDesc}>{selectedProductForModal.description || selectedProductForModal.shortDescription || 'No description specs configured for this product catalog entry.'}</Text>

              <View style={styles.modalSpecsGrid}>
                {selectedProductForModal.sku ? <Text style={styles.specText}>SKU: {selectedProductForModal.sku}</Text> : null}
                {selectedProductForModal.stockStatus ? <Text style={styles.specText}>Stock: {selectedProductForModal.stockStatus}</Text> : null}
                {selectedProductForModal.weight ? <Text style={styles.specText}>Weight: {selectedProductForModal.weight}</Text> : null}
                {selectedProductForModal.dimensions ? <Text style={styles.specText}>Size: {selectedProductForModal.dimensions}</Text> : null}
              </View>

              <TouchableOpacity style={styles.modalAddBtn} onPress={() => { handleAddToCart(selectedProductForModal); setSelectedProductForModal(null); }}>
                <Feather name="shopping-bag" size={16} color={COLORS.white} style={{ marginRight: 8 }} />
                <Text style={styles.modalAddBtnText}>Add to Shopping Basket</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList 
          data={viewMode === 'products' ? filteredProducts : filteredPets}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 30 }}
          renderItem={viewMode === 'products' ? renderProductCard : renderPetCard}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Feather name={viewMode === 'products' ? "shopping-bag" : "heart"} size={32} color={COLORS.muted} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyText}>
                {viewMode === 'products' ? "No store items found matching search filters." : "No pets matching adoption/sales search filters."}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 60,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.dark,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.dark,
  },
  cartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,102,204,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  cartCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  toggleBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 3,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: COLORS.white,
  },
  catSelectorWrapper: {
    marginVertical: 12,
    height: 34,
  },
  catChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catChipText: {
    fontSize: 11,
    color: COLORS.darkLight,
    fontWeight: '600',
  },
  catChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 12,
    height: 40,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.dark,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  card: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardMedia: {
    height: 120,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardNoImg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCatBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.white,
    backgroundColor: 'rgba(17,24,39,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  wishBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardBody: {
    padding: 12,
  },
  cardBrand: {
    fontSize: 9,
    color: COLORS.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.dark,
    lineHeight: 15,
  },
  ratingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.muted,
    marginLeft: 4,
  },
  cardShortDesc: {
    fontSize: 10,
    color: COLORS.muted,
    lineHeight: 13,
    marginVertical: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  salePrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  regPriceCrossed: {
    fontSize: 9,
    color: COLORS.muted,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  stockTag: {
    fontSize: 8,
    fontWeight: '800',
    color: '#2563EB',
    backgroundColor: 'rgba(37,99,235,0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  quickViewBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartBtn: {
    flex: 1,
    height: 32,
    backgroundColor: COLORS.dark,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.white,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%',
    position: 'relative',
  },
  modalCloseX: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 5,
  },
  modalImg: {
    width: '100%',
    height: 180,
    borderRadius: 14,
  },
  modalNoImg: {
    width: '100%',
    height: 180,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCat: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginTop: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.dark,
    marginTop: 4,
  },
  modalBrand: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '700',
    marginTop: 2,
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
  },
  modalPriceVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
  },
  modalRegPriceCrossed: {
    fontSize: 11,
    color: COLORS.muted,
    textDecorationLine: 'line-through',
  },
  modalSubTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.dark,
    marginTop: 16,
  },
  modalDesc: {
    fontSize: 11,
    color: COLORS.darkLight,
    lineHeight: 14,
    marginTop: 4,
  },
  modalSpecsGrid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
  },
  specText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.muted,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modalAddBtn: {
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalAddBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
});
