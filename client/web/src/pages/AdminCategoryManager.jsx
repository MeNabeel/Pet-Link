import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash2, Folder, Archive, CheckCircle, XCircle, 
  ChevronUp, ChevronDown, RefreshCw, Layers, ChevronLeft,
  Bone, PawPrint, Bird, Fish, Rabbit, Cookie, ToyBrick, Bed, 
  Scissors, Pill, HeartPulse, Syringe, Sparkles, UtensilsCrossed, 
  Briefcase, House, Package, Waves
} from 'lucide-react';
import { 
  AlertDialog, AlertDialogContent, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogCancel, AlertDialogAction 
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from '@/components/ui/Skeleton';
import './AdminCategoryManager.css';

// Live Lucide components registry mapped to schema value references
const ICON_COMPONENTS = {
  Bone: Bone,
  PawPrint: PawPrint,
  Bird: Bird,
  Fish: Fish,
  Rabbit: Rabbit,
  Cookie: Cookie,
  ToyBrick: ToyBrick,
  Bed: Bed,
  Scissors: Scissors,
  Pill: Pill,
  HeartPulse: HeartPulse,
  Syringe: Syringe,
  Sparkles: Sparkles,
  UtensilsCrossed: UtensilsCrossed,
  Briefcase: Briefcase,
  House: House,
  Package: Package,
  Waves: Waves
};

const ICON_LIST = [
  { label: "Dog Food (Bone)", value: "Bone" },
  { label: "Cat Food (Paw Print)", value: "PawPrint" },
  { label: "Bird Food (Bird)", value: "Bird" },
  { label: "Fish Food (Fish)", value: "Fish" },
  { label: "Rabbit Food (Rabbit)", value: "Rabbit" },
  { label: "Pet Treats (Cookie)", value: "Cookie" },
  { label: "Pet Toys (Toy Brick)", value: "ToyBrick" },
  { label: "Pet Beds (Bed)", value: "Bed" },
  { label: "Grooming (Scissors)", value: "Scissors" },
  { label: "Medicine (Pill)", value: "Pill" },
  { label: "Health Care (Heart)", value: "HeartPulse" },
  { label: "Vaccination (Syringe)", value: "Syringe" },
  { label: "Hygiene (Sparkles)", value: "Sparkles" },
  { label: "Feeders & Bowls (Utensils)", value: "UtensilsCrossed" },
  { label: "Travel (Briefcase)", value: "Briefcase" },
  { label: "Pet Houses (House)", value: "House" },
  { label: "Bird Cages (Package)", value: "Package" },
  { label: "Aquariums (Waves)", value: "Waves" }
];

export default function AdminCategoryManager({ user }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Sort states
  const [sortField, setSortField] = useState('displayOrder');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selection states
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Dialog / Confirmation states
  const [confirmConfig, setConfirmConfig] = useState(null);

  // Form Page View states
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Choice Representation Mode: 'icon' | 'image'
  const [representationMode, setRepresentationMode] = useState('icon');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    icon: '',
    parentCategory: '',
    displayOrder: 0,
    featured: false,
    showOnHomepage: false,
    status: 'Active'
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: {
          'x-requester-id': user._id
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [statusFilter]);

  // Handle auto slug generation
  const handleNameChange = (e) => {
    const value = e.target.value;
    const slug = value.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: slug
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result, icon: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddView = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      icon: 'PawPrint',
      parentCategory: '',
      displayOrder: 0,
      featured: false,
      showOnHomepage: false,
      status: 'Active'
    });
    setRepresentationMode('icon');
    setView('add');
  };

  const openEditView = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      icon: cat.icon || '',
      parentCategory: cat.parentCategory?._id || '',
      displayOrder: cat.displayOrder || 0,
      featured: !!cat.featured,
      showOnHomepage: !!cat.showOnHomepage,
      status: cat.status || 'Active'
    });
    setRepresentationMode(cat.image ? 'image' : 'icon');
    setView('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingCategory 
        ? `${API_URL}/api/categories/${editingCategory._id}`
        : `${API_URL}/api/categories`;
      const method = editingCategory ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        // Enforce exclusion of the other representation mode values on save
        image: representationMode === 'image' ? formData.image : '',
        icon: representationMode === 'icon' ? formData.icon : ''
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setView('list');
        fetchCategories();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error occurred while saving category');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id) => {
    setConfirmConfig({
      title: 'Delete Category',
      description: 'Are you sure you want to permanently delete this category? All products inside this category will remain, but their category association might be broken.',
      isDanger: true,
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_URL}/api/categories/${id}`, {
            method: 'DELETE',
            headers: {
              'x-requester-id': user._id
            }
          });
          if (response.ok) {
            fetchCategories();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleToggleStatus = async (cat, targetStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/categories/${cat._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': user._id
        },
        body: JSON.stringify({ ...cat, status: targetStatus })
      });
      if (response.ok) {
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const executeBulkAction = (action, val = null) => {
    const actionLabel = action === 'delete' ? 'delete' : val === 'Archived' ? 'archive' : 'update';
    setConfirmConfig({
      title: `Bulk ${actionLabel.charAt(0).toUpperCase() + actionLabel.slice(1)} Confirmation`,
      description: `Are you sure you want to ${actionLabel} the ${selectedIds.length} selected categories?`,
      isDanger: action === 'delete',
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_URL}/api/categories/bulk`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-requester-id': user._id
            },
            body: JSON.stringify({
              ids: selectedIds,
              action: action,
              status: val
            })
          });

          if (response.ok) {
            setSelectedIds([]);
            fetchCategories();
          } else {
            const err = await response.json();
            alert(err.message || 'Bulk operation failed');
          }
        } catch (error) {
          console.error(error);
        }
      }
    });
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleSelectAll = () => {
    const pageIds = paginatedCategories.map(c => c._id);
    const allSelectedOnPage = pageIds.every(id => selectedIds.includes(id));

    if (allSelectedOnPage) {
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const processedCategories = categories
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                            c.slug.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      } else {
        return sortDirection === 'asc' 
          ? aVal - bVal 
          : bVal - aVal;
      }
    });

  const totalPages = Math.ceil(processedCategories.length / itemsPerPage);
  const paginatedCategories = processedCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Return Form Page View
  if (view === 'add' || view === 'edit') {
    return (
      <div className="cat-form-workspace fade-in">
        <div className="form-back-header">
          <button className="back-btn" onClick={() => setView('list')}>
            <ChevronLeft size={16} /> Back to Directory
          </button>
          <h2>{editingCategory ? 'Edit Category' : 'Create New Category'}</h2>
        </div>

        <form onSubmit={handleSave} className="category-form-layout">
          <div className="form-section-box">
            <h4 className="section-box-title">General Info</h4>
            
            {/* Representation Segment Toggle */}
            <div className="form-group-field" style={{ marginBottom: '20px' }}>
              <label>Icon Representation Type</label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <button
                  type="button"
                  className={`pet-btn-outline ${representationMode === 'icon' ? 'active' : ''}`}
                  onClick={() => setRepresentationMode('icon')}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '11px' }}
                >
                  Use Lucide Icon
                </button>
                <button
                  type="button"
                  className={`pet-btn-outline ${representationMode === 'image' ? 'active' : ''}`}
                  onClick={() => setRepresentationMode('image')}
                  style={{ flex: 1, padding: '8px 12px', fontSize: '11px' }}
                >
                  Upload Custom Image
                </button>
              </div>
            </div>

            {representationMode === 'image' ? (
              <div className="form-group-field" style={{ marginBottom: '20px' }}>
                <label>Category Icon Image *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px' }}>
                  <div className="category-image-uploader-square">
                    {formData.image ? (
                      <img src={formData.image} alt="Preview" className="uploaded-preview-square" />
                    ) : (
                      <label className="category-image-upload-label-square">
                        <Plus size={20} color="var(--color-muted)" />
                        <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>
                  <div className="uploader-info-actions">
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-dark)', display: 'block' }}>Custom Image</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-muted)', display: 'block', marginBottom: '8px' }}>Recommended: Square PNG/JPG</span>
                    {formData.image && (
                      <button 
                        type="button" 
                        className="category-image-remove-btn" 
                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="form-group-field" style={{ marginBottom: '20px' }}>
                <label>Choose Category Icon *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                  <div className="category-image-uploader-square" style={{ borderStyle: 'solid', borderColor: 'var(--color-primary)', backgroundColor: 'rgba(0,102,204,0.02)' }}>
                    {formData.icon && ICON_COMPONENTS[formData.icon] ? (
                      React.createElement(ICON_COMPONENTS[formData.icon], { size: 24, color: 'var(--color-primary)' })
                    ) : (
                      <Folder size={24} color="var(--color-muted)" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Select 
                      value={formData.icon || "PawPrint"} 
                      onValueChange={(val) => setFormData(prev => ({ ...prev, icon: val, image: '' }))}
                    >
                      <SelectTrigger style={{ width: '100%', minWidth: '100%' }}>
                        <SelectValue placeholder="Choose an icon..." />
                      </SelectTrigger>
                      <SelectContent style={{ width: '280px' }}>
                        {ICON_LIST.map(item => (
                          <SelectItem key={item.value} value={item.value}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {ICON_COMPONENTS[item.value] && React.createElement(ICON_COMPONENTS[item.value], { size: 14 })}
                              <span>{item.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div className="form-group-field" style={{ marginBottom: '20px' }}>
              <label>Category Name *</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={handleNameChange}
                required 
                placeholder="e.g. Dog Accessories"
              />
            </div>

            <div className="form-group-field" style={{ marginBottom: '20px' }}>
              <label>URL Slug *</label>
              <input 
                type="text" 
                value={formData.slug} 
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                required 
                placeholder="e.g. dog-accessories"
              />
            </div>

            <div className="form-group-field">
              <label>Description</label>
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief summary of items in this category"
                rows={4}
              />
            </div>
          </div>

          <div className="form-section-box publish-controls">
            <h4 className="section-box-title">Attributes & Status</h4>
            
            <div className="form-group-field" style={{ marginBottom: '20px' }}>
              <label>Parent Category (Hierarchy)</label>
              <Select 
                value={formData.parentCategory || "none"} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, parentCategory: val === "none" ? "" : val }))}
              >
                <SelectTrigger style={{ width: '100%', minWidth: '100%' }}>
                  <SelectValue placeholder="Select parent category..." />
                </SelectTrigger>
                <SelectContent style={{ width: '100%' }}>
                  <SelectItem value="none">None (Top-Level Category)</SelectItem>
                  {categories
                    .filter(c => c.status === 'Active' && (!editingCategory || c._id !== editingCategory._id))
                    .map(c => (
                      <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="form-group-field" style={{ marginBottom: '20px' }}>
              <label>Display Order</label>
              <input 
                type="number" 
                value={formData.displayOrder} 
                onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                min={0}
              />
            </div>

            <div className="form-group-field" style={{ marginBottom: '20px' }}>
              <label>Status</label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
              >
                <SelectTrigger className={`status-select-colored ${formData.status.toLowerCase()}`} style={{ width: '100%', minWidth: '100%' }}>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent style={{ width: '100%' }}>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="checkbox-fields-row" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="checkbox-label-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.featured} 
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                />
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-dark-light)' }}>Mark as Featured Category</span>
              </label>

              <label className="checkbox-label-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={formData.showOnHomepage} 
                  onChange={(e) => setFormData(prev => ({ ...prev, showOnHomepage: e.target.checked }))}
                />
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-dark-light)' }}>Show on Home Showcase</span>
              </label>
            </div>

            <div className="action-buttons-stack" style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button type="submit" className="pet-btn-primary">
                Save Category
              </button>
              <button type="button" className="cancel-form-btn" onClick={() => setView('list')}>
                Discard & Return
              </button>
            </div>
          </div>
        </form>

        <AlertDialog open={confirmConfig !== null} onOpenChange={(open) => { if (!open) setConfirmConfig(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmConfig?.title}</AlertDialogTitle>
              <AlertDialogDescription>{confirmConfig?.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                variant={confirmConfig?.isDanger ? 'danger' : 'primary'} 
                onClick={async () => {
                  if (confirmConfig?.onConfirm) {
                    await confirmConfig.onConfirm();
                  }
                }}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Return Standard Categories List View
  return (
    <div className="cat-manager-container fade-in">
      <div className="cat-header-section">
        <div>
          <h2 className="cat-title">Category Directory</h2>
          <span className="cat-subtitle">Establish parent hierarchies, configure display orders, and organize products.</span>
        </div>
        <button className="pet-btn-primary animate-shine" onClick={openAddView}>
          <Plus size={16} style={{ marginRight: '6px' }} />
          Create Category
        </button>
      </div>

      {/* Bulk Operations Alert Panel */}
      {selectedIds.length > 0 && (
        <div className="bulk-alert-panel">
          <span className="bulk-selected-count">{selectedIds.length} categories selected</span>
          <div className="bulk-actions-group">
            <button className="bulk-btn activate" onClick={() => executeBulkAction('status', 'Active')}>
              <CheckCircle size={14} /> Activate
            </button>
            <button className="bulk-btn deactivate" onClick={() => executeBulkAction('status', 'Inactive')}>
              <XCircle size={14} /> Deactivate
            </button>
            <button className="bulk-btn archive" onClick={() => executeBulkAction('status', 'Archived')}>
              <Archive size={14} /> Archive
            </button>
            <button className="bulk-btn delete" onClick={() => executeBulkAction('delete')}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="cat-filter-row">
        <div className="search-box-wrapper" style={{ flex: 1, maxWidth: '320px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '6px 16px', backgroundColor: 'var(--color-bg-light)' }}>
          <Search size={16} color="var(--color-muted)" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '13px' }} 
          />
        </div>

        <div className="filters-right">
          <Select 
            value={statusFilter} 
            onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
          >
            <SelectTrigger className={`status-select-colored ${statusFilter.toLowerCase()}`}>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <button className="refresh-icon-btn" onClick={fetchCategories} title="Refresh dataset">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid table */}
      {loading ? (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}><Skeleton width="18px" height="18px" /></th>
                <th><Skeleton width="48px" height="14px" /></th>
                <th><Skeleton width="120px" height="14px" /></th>
                <th><Skeleton width="80px" height="14px" /></th>
                <th><Skeleton width="180px" height="14px" /></th>
                <th><Skeleton width="100px" height="14px" /></th>
                <th><Skeleton width="60px" height="14px" /></th>
                <th><Skeleton width="60px" height="14px" /></th>
                <th><Skeleton width="70px" height="14px" /></th>
                <th><Skeleton width="90px" height="14px" /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td><Skeleton width="18px" height="18px" /></td>
                  <td><Skeleton width="32px" height="32px" style={{ borderRadius: '6px' }} /></td>
                  <td><Skeleton width="100px" height="14px" /></td>
                  <td><Skeleton width="80px" height="14px" /></td>
                  <td><Skeleton width="200px" height="14px" /></td>
                  <td><Skeleton width="90px" height="14px" /></td>
                  <td><Skeleton width="40px" height="14px" /></td>
                  <td><Skeleton width="18px" height="18px" /></td>
                  <td><Skeleton width="60px" height="18px" style={{ borderRadius: '9999px' }} /></td>
                  <td><Skeleton width="80px" height="14px" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={paginatedCategories.length > 0 && paginatedCategories.every(c => selectedIds.includes(c._id))}
                  />
                </th>
                <th>Image</th>
                <th className="sortable-header" onClick={() => handleSort('name')}>
                  Name {sortField === 'name' ? (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                </th>
                <th>Slug</th>
                <th>Description</th>
                <th>Parent Hierarchy</th>
                <th className="sortable-header" onClick={() => handleSort('displayOrder')}>
                  Order {sortField === 'displayOrder' ? (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                </th>
                <th>Featured</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.map(cat => (
                <tr key={cat._id} className={selectedIds.includes(cat._id) ? 'selected-row' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(cat._id)} 
                      onChange={() => handleSelectRow(cat._id)}
                    />
                  </td>
                  <td>
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="cat-row-thumb" />
                    ) : cat.icon && ICON_COMPONENTS[cat.icon] ? (
                      <div className="cat-row-thumb-placeholder">
                        {React.createElement(ICON_COMPONENTS[cat.icon], { size: 16 })}
                      </div>
                    ) : (
                      <div className="cat-row-thumb-placeholder">
                        <Folder size={16} />
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="cat-row-name">{cat.name}</span>
                  </td>
                  <td>
                    <span className="cat-row-slug">/{cat.slug}</span>
                  </td>
                  <td>
                    <span className="cat-row-desc" title={cat.description}>{cat.description || '-'}</span>
                  </td>
                  <td>
                    <span className={cat.parentCategory ? 'parent-cat-badge' : 'root-cat-label'}>
                      {cat.parentCategory ? cat.parentCategory.name : 'Root level'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{cat.displayOrder}</span>
                  </td>
                  <td>
                    <span className={`featured-dot ${cat.featured ? 'yes' : 'no'}`}></span>
                  </td>
                  <td>
                    <span className={`status-badge-pill ${cat.status.toLowerCase()}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell-buttons">
                      <button className="action-btn edit-btn" onClick={() => openEditView(cat)} title="Edit Category">
                        <Edit size={14} />
                      </button>
                      {cat.status !== 'Archived' ? (
                        <button className="action-btn archive-btn" onClick={() => handleToggleStatus(cat, 'Archived')} title="Archive Category">
                          <Archive size={14} />
                        </button>
                      ) : (
                        <button className="action-btn activate-btn" onClick={() => handleToggleStatus(cat, 'Active')} title="Activate Category">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button className="action-btn delete-btn" onClick={() => handleDelete(cat._id)} title="Delete Category">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {processedCategories.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    No categories found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="admin-pagination-bar">
              <span className="pagination-info">Showing page {currentPage} of {totalPages} ({processedCategories.length} categories total)</span>
              <div className="pagination-buttons">
                <button 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="page-nav-btn"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button 
                    key={i} 
                    className={`page-num-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="page-nav-btn"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={confirmConfig !== null} onOpenChange={(open) => { if (!open) setConfirmConfig(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmConfig?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmConfig?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              variant={confirmConfig?.isDanger ? 'danger' : 'primary'} 
              onClick={async () => {
                if (confirmConfig?.onConfirm) {
                  await confirmConfig.onConfirm();
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
