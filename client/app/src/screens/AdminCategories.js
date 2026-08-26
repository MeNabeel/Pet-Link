import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  FlatList, ActivityIndicator, Alert, TextInput, ScrollView, Switch 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function AdminCategories({ user, onBack }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentCategory: '',
    displayOrder: '0',
    featured: false,
    showOnHomepage: false,
    status: 'Active'
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const query = statusFilter === 'Archived' ? '?status=Archived' : '';
      const response = await fetch(`${API_URL}/api/categories${query}`);
      const data = await response.json();
      if (response.ok) {
        setCategories(data);
      }
    } catch (err) {
      console.log('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [statusFilter]);

  const handleNameChange = (val) => {
    const slug = val.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: slug
    }));
  };

  // Base64 file picker helper for mobile web/native
  const handleUploadImage = () => {
    // Standard web input file helper
    if (typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormData(prev => ({ ...prev, image: reader.result }));
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      Alert.alert("Info", "File upload picker is safe to launch via web client browser session.");
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      Alert.alert("Error", "Name and slug are required fields.");
      return;
    }

    const payload = {
      ...formData,
      displayOrder: parseInt(formData.displayOrder) || 0,
      parentCategory: formData.parentCategory || null
    };

    try {
      const url = editingCategory 
        ? `${API_URL}/api/categories/${editingCategory._id}`
        : `${API_URL}/api/categories`;
      const method = editingCategory ? 'PUT' : 'POST';

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
        fetchCategories();
      } else {
        const err = await response.json();
        Alert.alert("Error", err.message || "Failed to save category");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this category?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/api/categories/${id}`, {
                method: 'DELETE',
                headers: { 'x-requester-id': user._id }
              });
              if (res.ok) {
                fetchCategories();
              }
            } catch (err) {
              console.log(err);
            }
          }
        }
      ]
    );
  };

  const handleToggleStatus = async (cat, nextStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/categories/${cat._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      parentCategory: cat.parentCategory?._id || '',
      displayOrder: (cat.displayOrder || 0).toString(),
      featured: !!cat.featured,
      showOnHomepage: !!cat.showOnHomepage,
      status: cat.status || 'Active'
    });
    setIsFormOpen(true);
  };

  const openAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      parentCategory: '',
      displayOrder: '0',
      featured: false,
      showOnHomepage: false,
      status: 'Active'
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
        <Text style={styles.headerTitle}>Categories ({categories.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Feather name="plus" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {isFormOpen ? (
        <ScrollView style={styles.formContainer} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Text style={styles.formTitle}>{editingCategory ? 'Update Category' : 'Create Category'}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Image Banner</Text>
            <TouchableOpacity style={styles.imgPicker} onPress={handleUploadImage}>
              {formData.image ? (
                <Image source={{ uri: formData.image }} style={styles.previewImage} />
              ) : (
                <View style={styles.pickerInner}>
                  <Feather name="image" size={24} color={COLORS.muted} />
                  <Text style={styles.pickerText}>Upload Base64 Banner</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category Name *</Text>
            <TextInput 
              style={styles.input} 
              value={formData.name}
              onChangeText={handleNameChange}
              placeholder="e.g. Dog Accessories"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL Slug *</Text>
            <TextInput 
              style={styles.input} 
              value={formData.slug}
              onChangeText={val => setFormData(prev => ({ ...prev, slug: val.toLowerCase() }))}
              placeholder="e.g. dog-accessories"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput 
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]} 
              value={formData.description}
              onChangeText={val => setFormData(prev => ({ ...prev, description: val }))}
              placeholder="Brief details about category content"
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Parent Category</Text>
            <View style={styles.selectWrapper}>
              {/* Fallback picker input */}
              <TextInput
                style={styles.input}
                value={formData.parentCategory}
                onChangeText={val => setFormData(prev => ({ ...prev, parentCategory: val }))}
                placeholder="Parent Category ID (optional)"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Display Order</Text>
              <TextInput 
                style={styles.input} 
                keyboardType="numeric"
                value={formData.displayOrder}
                onChangeText={val => setFormData(prev => ({ ...prev, displayOrder: val }))}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Status</Text>
              <TextInput 
                style={styles.input} 
                value={formData.status}
                onChangeText={val => setFormData(prev => ({ ...prev, status: val }))}
                placeholder="Active / Inactive"
              />
            </View>
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.switchLabel}>Mark as Featured</Text>
            <Switch 
              value={formData.featured}
              onValueChange={val => setFormData(prev => ({ ...prev, featured: val }))}
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          <View style={styles.switchGroup}>
            <Text style={styles.switchLabel}>Show on Homepage</Text>
            <Switch 
              value={formData.showOnHomepage}
              onValueChange={val => setFormData(prev => ({ ...prev, showOnHomepage: val }))}
              trackColor={{ true: COLORS.primary }}
            />
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsFormOpen(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {/* Search bar */}
          <View style={styles.searchBar}>
            <Feather name="search" size={16} color={COLORS.muted} style={{ marginRight: 8 }} />
            <TextInput 
              placeholder="Search category registry..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList 
              data={filteredCategories}
              keyExtractor={item => item._id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.cardImg} />
                    ) : (
                      <View style={styles.placeholderIcon}><Feather name="folder" size={18} color={COLORS.primary} /></View>
                    )}
                    <View style={styles.cardMeta}>
                      <Text style={styles.cardName}>{item.name}</Text>
                      <Text style={styles.cardSlug}>slug: /{item.slug}</Text>
                    </View>
                    <Text style={[styles.statusTag, styles[item.status.toLowerCase()]]}>{item.status}</Text>
                  </View>
                  <Text style={styles.cardDesc} numberOfLines={1}>{item.description || 'No description provided'}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.parentText}>
                      Parent: <Text style={{ color: COLORS.dark, fontWeight: '700' }}>{item.parentCategory?.name || 'Root'}</Text>
                    </Text>
                    
                    <View style={styles.cardActions}>
                      <TouchableOpacity style={styles.iconBtn} onPress={() => openEdit(item)}>
                        <Feather name="edit-2" size={13} color={COLORS.darkLight} />
                      </TouchableOpacity>
                      {item.status !== 'Archived' ? (
                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleToggleStatus(item, 'Archived')}>
                          <Feather name="archive" size={13} color={COLORS.muted} />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity style={styles.iconBtn} onPress={() => handleToggleStatus(item, 'Active')}>
                          <Feather name="check" size={13} color="#16A34A" />
                        </TouchableOpacity>
                      )}
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
                  <Text style={styles.emptyText}>No categories found matching filters.</Text>
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
  cardSlug: {
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
  active: { backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#16a34a' },
  inactive: { backgroundColor: 'rgba(107, 114, 128, 0.08)', color: '#6b7280' },
  archived: { backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' },
  cardDesc: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 10,
    lineHeight: 14,
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
    height: 100,
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
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  row: {
    flexDirection: 'row',
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
