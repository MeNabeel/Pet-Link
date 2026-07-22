import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  FlatList, ActivityIndicator, Alert, TextInput, ScrollView 
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function Store({ user, onBack }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wishlist, setWishlist] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  // Quick view states
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);

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
        setProducts(prodData);
      }
    } catch (err) {
      console.log('Error loading mobile store catalog:', err);
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
    Alert.alert("Cart", `Added ${product.name} to shopping cart!`);
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
                          p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || (p.category && p.category._id === selectedCategory);
    return matchesSearch && matchesCat;
  });

  const renderProductCard = ({ item }) => {
    const price = item.salePrice || item.regularPrice;
    const isWishlisted = wishlist.includes(item._id);

    return (
      <View style={styles.card}>
        {/* Product Media Area */}
        <TouchableOpacity style={styles.cardMedia} activeOpacity={0.9} onPress={() => handleProductPress(item._id)}>
          {item.images && item.images.length > 0 ? (
            <Image source={{ uri: item.images[0] }} style={styles.cardImage} />
          ) : (
            <View style={styles.cardNoImg}><Feather name="package" size={24} color={COLORS.muted} /></View>
          )}

          {/* Floating Category Tag */}
          <Text style={styles.cardCatBadge}>{item.category?.name || 'Item'}</Text>
          
          {/* Wishlist Icon */}
          <TouchableOpacity style={styles.wishBtn} onPress={() => toggleWishlist(item._id)}>
            <FontAwesome 
              name={isWishlisted ? "heart" : "heart-o"} 
              size={14} 
              color={isWishlisted ? "#EF4444" : COLORS.dark} 
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Product Metadata */}
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

  return (
    <View style={styles.container}>
      {/* Store Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={18} color={COLORS.dark} />
          <Text style={styles.backBtnText}>Exit Shop</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PetLink Store</Text>
        <View style={styles.cartBtn}>
          <Feather name="shopping-bag" size={16} color={COLORS.primary} />
          <Text style={styles.cartCountText}>{cartCount}</Text>
        </View>
      </View>

      {/* Categories Horizontal Selector */}
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

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Feather name="search" size={16} color={COLORS.muted} style={{ marginRight: 8 }} />
        <TextInput 
          placeholder="Search foods, toys, wellness..."
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
          data={filteredProducts}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 30 }}
          renderItem={renderProductCard}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Feather name="shopping-bag" size={32} color={COLORS.muted} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyText}>No store items found matching search filters.</Text>
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
    borderRadius: 8,
    gap: 4,
  },
  cartCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primary,
  },
  catSelectorWrapper: {
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  catChipActive: {
    backgroundColor: 'rgba(0,102,204,0.08)',
    borderColor: 'rgba(0,102,204,0.2)',
  },
  catChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.muted,
  },
  catChipTextActive: {
    color: COLORS.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginVertical: 14,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.dark,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
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
    objectFit: 'cover',
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
    color: COLORS.primary,
    backgroundColor: COLORS.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
  },
  cardBody: {
    padding: 10,
    flex: 1,
  },
  cardBrand: {
    fontSize: 8,
    fontWeight: '700',
    color: COLORS.muted,
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.dark,
    marginTop: 2,
  },
  ratingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 1,
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.muted,
  },
  cardShortDesc: {
    fontSize: 10,
    color: COLORS.muted,
    lineHeight: 12,
    marginTop: 4,
    height: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  salePrice: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  regPriceCrossed: {
    fontSize: 8,
    color: COLORS.muted,
    textDecorationLine: 'line-through',
  },
  stockTag: {
    fontSize: 7,
    fontWeight: '800',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    color: '#16A34A',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  quickViewBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartBtn: {
    flex: 1,
    height: 28,
    backgroundColor: COLORS.primary,
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
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
  },
  // Modal Detail Styles
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
    objectFit: 'cover',
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
