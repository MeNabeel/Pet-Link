import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  FlatList, ActivityIndicator, Alert, TextInput, ScrollView, Switch 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function AdminProducts({ user, onBack }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // View state: 'list' | 'form'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form input states
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    images: [],
    brand: '',
    sku: '',
    barcode: '',
    description: '',
    shortDescription: '',
    regularPrice: '',
    salePrice: '',
    stockQuantity: '10',
    stockStatus: 'In Stock',
    weight: '',
    dimensions: '',
    petType: 'Dog',
    ageGroup: 'Adult',
    tags: '',
    visibility: 'Public',
    featured: false,
    recommended: false,
    status: 'Published'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const catRes = await fetch(`${API_URL}/api/categories`);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.filter(c => c.status === 'Active'));
      }

      const prodRes = await fetch(`${API_URL}/api/products`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
    } catch (err) {
      console.log('Error fetching product data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadImage = () => {
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, reader.result]
            }));
          };
          reader.readAsDataURL(file);
        });
      };
      input.click();
    } else {
      Alert.alert("Info", "Upload images picker works in browser client session.");
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index)
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category || !formData.sku || !formData.regularPrice) {
      Alert.alert("Error", "Name, Category, SKU, and Price are required.");
      return;
    }

    const payload = {
      ...formData,
      regularPrice: parseFloat(formData.regularPrice),
      salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    try {
      const url = editingProduct
        ? `${API_URL}/api/products/${editingProduct._id}`
        : `${API_URL}/api/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsFormOpen(false);
        fetchData();
      } else {
        const err = await response.json();
        Alert.alert("Error", err.message || "Failed to save product details");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}/duplicate`, {
        method: 'POST',
        headers: { 'x-requester-id': user._id }
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to permanently delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'x-requester-id': user._id }
              });
              if (res.ok) {
                fetchData();
              }
            } catch (err) {
              console.log(err);
            }
          }
        }
      ]
    );
  };

  const handleArchive = async (prod) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${prod._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify({ status: prod.status === 'Archived' ? 'Published' : 'Archived' })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || (p.category && p.category._id === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const openAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      images: [],
      brand: '',
      sku: `PL-${Math.floor(100000 + Math.random() * 900000)}`,
      barcode: '',
      description: '',
      shortDescription: '',
      regularPrice: '',
      salePrice: '',
      stockQuantity: '10',
      stockStatus: 'In Stock',
      weight: '',
      dimensions: '',
      petType: 'Dog',
      ageGroup: 'Adult',
      tags: '',
      visibility: 'Public',
      featured: false,
      recommended: false,
      status: 'Published'
    });
    setIsFormOpen(true);
  };

  const openEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category?._id || '',
      images: prod.images || [],
      brand: prod.brand || '',
      sku: prod.sku,
      barcode: prod.barcode || '',
      description: prod.description || '',
      shortDescription: prod.shortDescription || '',
      regularPrice: prod.regularPrice.toString(),
      salePrice: prod.salePrice ? prod.salePrice.toString() : '',
      stockQuantity: prod.stockQuantity.toString(),
      stockStatus: prod.stockStatus || 'In Stock',
      weight: prod.weight || '',
      dimensions: prod.dimensions || '',
      petType: prod.petType || '',
      ageGroup: prod.ageGroup || '',
      tags: prod.tags ? prod.tags.join(', ') : '',
      visibility: prod.visibility || 'Public',
      featured: !!prod.featured,
      recommended: !!prod.recommended,
      status: prod.status || 'Published'
    });
    setIsFormOpen(true);
  };

  return (
    <View style={styles.container}>
      {/* Sub Header */}
      <View style={styles.subHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={18} color={COLORS.dark} />
          <Text style={styles.backBtnText}>Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products ({products.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Feather name="plus" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {isFormOpen ? (
        <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.formTitle}>{editingProduct ? 'Modify Product' : 'Add Store Product'}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Gallery Images</Text>
            <TouchableOpacity style={styles.imgPicker} onPress={handleUploadImage}>
              <View style={styles.pickerInner}>
                <Feather name="image" size={24} color={COLORS.muted} />
                <Text style={styles.pickerText}>Select Gallery Files ({formData.images.length})</Text>
              </View>
            </TouchableOpacity>
            
            <ScrollView horizontal style={styles.galleryPreviewRow} showsHorizontalScrollIndicator={false}>
              {formData.images.map((img, idx) => (
                <View key={idx} style={styles.galleryPreviewItem}>
                  <Image source={{ uri: img }} style={styles.previewThumb} />
                  <TouchableOpacity style={styles.removeThumbX} onPress={() => removeImage(idx)}>
                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Title *</Text>
            <TextInput 
              style={styles.input} 
              value={formData.name}
              onChangeText={val => setFormData(prev => ({ ...prev, name: val }))}
              placeholder="e.g. Dry Salmon Kibbles"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category placement *</Text>
            <TextInput 
              style={styles.input} 
              value={formData.category}
              onChangeText={val => setFormData(prev => ({ ...prev, category: val }))}
              placeholder="Category Placement ID"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Regular Price (PKR) *</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric"
                value={formData.regularPrice}
                onChangeText={val => setFormData(prev => ({ ...prev, regularPrice: val }))}
                placeholder="0.00"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Sale Price (PKR)</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric"
                value={formData.salePrice}
                onChangeText={val => setFormData(prev => ({ ...prev, salePrice: val }))}
                placeholder="optional"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Stock Quantity</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric"
                value={formData.stockQuantity}
                onChangeText={val => setFormData(prev => ({ ...prev, stockQuantity: val }))}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Stock Status</Text>
              <TextInput 
                style={styles.input} 
                value={formData.stockStatus}
                onChangeText={val => setFormData(prev => ({ ...prev, stockStatus: val }))}
                placeholder="In Stock / Out of Stock"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Unique SKU *</Text>
              <TextInput 
                style={styles.input} 
                value={formData.sku}
                onChangeText={val => setFormData(prev => ({ ...prev, sku: val }))}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Barcode</Text>
              <TextInput 
                style={styles.input} 
                value={formData.barcode}
                onChangeText={val => setFormData(prev => ({ ...prev, barcode: val }))}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Short Highlight Details</Text>
            <TextInput 
              style={styles.input} 
              value={formData.shortDescription}
              onChangeText={val => setFormData(prev => ({ ...prev, shortDescription: val }))}
              placeholder="Highlight subtitle summary"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput 
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
              value={formData.description}
              onChangeText={val => setFormData(prev => ({ ...prev, description: val }))}
              multiline
              placeholder="Detailed description fields specs"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Weight</Text>
              <TextInput 
                style={styles.input} 
                value={formData.weight}
                onChangeText={val => setFormData(prev => ({ ...prev, weight: val }))}
                placeholder="e.g. 5kg"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Dimensions</Text>
              <TextInput 
                style={styles.input} 
                value={formData.dimensions}
                onChangeText={val => setFormData(prev => ({ ...prev, dimensions: val }))}
                placeholder="e.g. 10x12"
              />
            </View>
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.switchLabel}>Mark Featured Product</Text>
            <Switch 
              value={formData.featured}
              onValueChange={val => setFormData(prev => ({ ...prev, featured: val }))}
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.switchLabel}>Recommended Suggestions</Text>
            <Switch 
              value={formData.recommended}
              onValueChange={val => setFormData(prev => ({ ...prev, recommended: val }))}
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsFormOpen(false)}>
              <Text style={styles.cancelBtnText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Publish</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Search/Filter bar */}
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color={COLORS.muted} style={{ marginRight: 8 }} />
            <TextInput 
              placeholder="Search catalog SKU, titles..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList 
              data={filteredProducts}
              keyExtractor={item => item._id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    {item.images && item.images.length > 0 ? (
                      <Image source={{ uri: item.images[0] }} style={styles.cardImg} />
                    ) : (
                      <View style={styles.placeholderIcon}><Feather name="package" size={18} color={COLORS.primary} /></View>
                    )}
                    <View style={styles.cardMeta}>
                      <Text style={styles.cardName}>{item.name}</Text>
                      <Text style={styles.cardSku}>sku: {item.sku} • {item.brand || 'No brand'}</Text>
                    </View>
                    <Text style={[styles.statusTag, styles[item.status.toLowerCase()]]}>{item.status}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailText}>
                      Price: <Text style={{ fontWeight: '700', color: '#16A34A' }}>{item.salePrice ? `${item.salePrice} PKR` : `${item.regularPrice} PKR`}</Text>
                    </Text>
                    <Text style={styles.detailText}>
                      Stock: <Text style={{ fontWeight: '700' }}>{item.stockStatus} ({item.stockQuantity})</Text>
                    </Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <Text style={styles.parentText}>
                      Cat: <Text style={{ color: COLORS.dark, fontWeight: '700' }}>{item.category?.name || 'Unassigned'}</Text>
                    </Text>
                    
                    <View style={styles.cardActions}>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(item)}>
                        <Feather name="edit-2" size={13} color={COLORS.darkLight} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleDuplicate(item._id)}>
                        <Feather name="copy" size={13} color={COLORS.muted} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => handleArchive(item)}>
                        <Feather name="archive" size={13} color={COLORS.muted} />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.iconBtn, { borderColor: '#EF4444' }]} onPress={() => handleDelete(item._id)}>
                        <Feather name="trash-2" size={13} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
              ListEmptyComponent={() => (
                <View style={styles.empty}>
                  <Feather name="info" size={24} color={COLORS.muted} style={{ marginBottom: 6 }} />
                  <Text style={styles.emptyText}>No product listings matching keyword.</Text>
                </View>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  subHeader: {
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
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 14,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.dark,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    objectFit: 'cover',
  },
  placeholderIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 102, 204, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: {
    flex: 1,
    marginLeft: 10,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.dark,
  },
  cardSku: {
    fontSize: 10,
    color: COLORS.muted,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  statusTag: {
    fontSize: 9,
    fontWeight: '800',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  published: { backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#16a34a' },
  draft: { backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#d97706' },
  archived: { backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 11,
    color: COLORS.darkLight,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  parentText: {
    fontSize: 11,
    color: COLORS.muted,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  empty: {
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
  },
  formContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 10,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: COLORS.dark,
    backgroundColor: COLORS.white,
  },
  imgPicker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 70,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  pickerInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pickerText: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '600',
  },
  galleryPreviewRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  galleryPreviewItem: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    position: 'relative',
  },
  previewThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeThumbX: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(239,68,68,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  switchLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.darkLight,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    height: 42,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
  },
  saveBtn: {
    height: 42,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
});
