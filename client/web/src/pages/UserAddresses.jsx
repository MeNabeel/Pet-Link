import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Pencil, Trash2, MapPin, Home, Briefcase, 
  Building2, Phone, Check, Star, User, Globe
} from 'lucide-react';
import './UserAddresses.css';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { 
  AlertDialog, AlertDialogContent, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogCancel, AlertDialogAction 
} from '@/components/ui/alert-dialog';

export default function UserAddresses({ user, onBack }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [addressToDeleteId, setAddressToDeleteId] = useState(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [postalCode, setPostalCode] = useState('');
  const [addressType, setAddressType] = useState('Home');
  const [isDefault, setIsDefault] = useState(false);

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const userId = user?._id || user?.id;
  const userToken = user?.token || localStorage.getItem('token') || '';

  const fetchAddresses = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/addresses`, {
        headers: {
          'x-requester-id': userId,
          'Authorization': `Bearer ${userToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        if (Array.isArray(data)) {
          setAddresses(data);
        } else if (data && Array.isArray(data.addresses)) {
          setAddresses(data.addresses);
        } else {
          setAddresses([]);
        }
      } else {
        setError(data.message || 'Unable to load your saved addresses. Please try again.');
      }
    } catch (err) {
      console.error('Fetch addresses error:', err);
      setError('Unable to load your saved addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  const handleOpenAddModal = (e) => {
    if (e && e.currentTarget) e.currentTarget.blur();
    if (document.activeElement) document.activeElement.blur();
    setEditingAddress(null);
    setFullName(user?.name || '');
    setPhone(user?.phone || '');
    setStreetAddress('');
    setApartment('');
    setCity(user?.city || 'Lahore');
    setProvince(user?.province || 'Punjab');
    setCountry(user?.country || 'Pakistan');
    setPostalCode('');
    setAddressType('Home');
    setIsDefault(addresses.length === 0);
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (addr, e) => {
    if (e && e.currentTarget) e.currentTarget.blur();
    if (document.activeElement) document.activeElement.blur();
    setEditingAddress(addr);
    setFullName(addr.fullName || '');
    setPhone(addr.phone || '');
    setStreetAddress(addr.streetAddress || '');
    setApartment(addr.apartment || '');
    setCity(addr.city || '');
    setProvince(addr.province || '');
    setCountry(addr.country || 'Pakistan');
    setPostalCode(addr.postalCode || '');
    setAddressType(addr.addressType || 'Home');
    setIsDefault(addr.isDefault || false);
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingAddress(null);
    setFormError('');
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Full Name is required');
      return;
    }
    if (!phone.trim()) {
      setFormError('Phone Number is required');
      return;
    }
    if (!streetAddress.trim()) {
      setFormError('Street Address is required');
      return;
    }
    if (!city.trim()) {
      setFormError('City is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        streetAddress: streetAddress.trim(),
        apartment: apartment.trim(),
        city: city.trim(),
        province: province.trim(),
        country: country.trim(),
        postalCode: postalCode.trim(),
        addressType,
        isDefault
      };

      const isEdit = !!editingAddress;
      const url = isEdit 
        ? `${API_URL}/api/addresses/${editingAddress.id}` 
        : `${API_URL}/api/addresses`;
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': userId,
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setIsFormModalOpen(false);
        setEditingAddress(null);
        await fetchAddresses();
      } else {
        setFormError(data.message || 'Failed to save address details.');
      }
    } catch (err) {
      console.error('Save address error:', err);
      setFormError('Network connection failure. Failed to update database.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (addrId) => {
    try {
      const response = await fetch(`${API_URL}/api/addresses/${addrId}/default`, {
        method: 'PUT',
        headers: {
          'x-requester-id': userId,
          'Authorization': `Bearer ${userToken}`
        }
      });
      if (response.ok) {
        await fetchAddresses();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update default address');
      }
    } catch (err) {
      console.error('Set default error:', err);
      alert('Network error while updating default address');
    }
  };

  const handlePromptDelete = (addrId) => {
    setAddressToDeleteId(addrId);
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!addressToDeleteId) return;
    setDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/addresses/${addressToDeleteId}`, {
        method: 'DELETE',
        headers: {
          'x-requester-id': userId,
          'Authorization': `Bearer ${userToken}`
        }
      });
      if (response.ok) {
        setIsDeleteAlertOpen(false);
        setAddressToDeleteId(null);
        await fetchAddresses();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete address');
      }
    } catch (err) {
      console.error('Delete address error:', err);
      alert('Network error while deleting address');
    } finally {
      setDeleting(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Work': return <Briefcase size={14} />;
      case 'Other': return <Building2 size={14} />;
      default: return <Home size={14} />;
    }
  };

  return (
    <div className="addresses-container fade-in">
      
      {/* PAGE HEADER */}
      <div className="addresses-header-bar">
        <div className="addresses-header-left">
          <button 
            type="button" 
            className="addresses-back-btn"
            onClick={onBack}
            aria-label="Back to Profile"
            title="Back to Profile"
          >
            <ArrowLeft size={20} color="#0066CC" />
          </button>
          <div className="addresses-header-title-group">
            <h1 className="addresses-page-title">Addresses</h1>
            <p className="addresses-page-sub">Manage your saved addresses and delivery locations.</p>
          </div>
        </div>

        <button 
          type="button" 
          className="addresses-add-btn"
          onClick={handleOpenAddModal}
        >
          <Plus size={16} />
          <span>Add New Address</span>
        </button>
      </div>

      {/* ERROR / LOADING NOTIFICATION */}
      {error && (
        <div className="addresses-error-alert">
          <span>{error}</span>
        </div>
      )}

      {/* CONTENT REGION */}
      {loading ? (
        <div className="addresses-grid">
          {[1, 2, 3].map((item) => (
            <div key={item} className="address-card address-skeleton-card">
              <div className="address-card-top">
                <Skeleton width="70px" height="22px" style={{ borderRadius: '6px' }} />
                <Skeleton width="90px" height="22px" style={{ borderRadius: '6px' }} />
              </div>
              <div className="address-card-body" style={{ gap: '10px', marginTop: '6px' }}>
                <Skeleton width="50%" height="20px" style={{ borderRadius: '4px' }} />
                <Skeleton width="40%" height="16px" style={{ borderRadius: '4px' }} />
                <Skeleton width="85%" height="16px" style={{ borderRadius: '4px' }} />
                <Skeleton width="65%" height="16px" style={{ borderRadius: '4px' }} />
              </div>
              <div className="address-card-actions" style={{ marginTop: '12px' }}>
                <Skeleton width="64px" height="30px" style={{ borderRadius: '6px' }} />
                <Skeleton width="64px" height="30px" style={{ borderRadius: '6px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        
        /* EMPTY STATE */
        <div className="addresses-empty-card">
          <div className="addresses-empty-icon-box">
            <MapPin size={32} />
          </div>
          <h3 className="addresses-empty-title">No saved addresses yet</h3>
          <p className="addresses-empty-desc">Add an address to make deliveries and pet care services easier.</p>
          <button 
            type="button" 
            className="addresses-add-btn"
            onClick={handleOpenAddModal}
          >
            <Plus size={16} />
            <span>Add New Address</span>
          </button>
        </div>
      ) : (
        
        /* ADDRESSES GRID (1-SCREEN COMPACT VIEWPORT DESIGN) */
        <div className="addresses-grid">
          {addresses.map((addr) => (
            <div 
              key={addr.id} 
              className={`address-card ${addr.isDefault ? 'is-default-card' : ''}`}
            >
              {/* Card Header Badges */}
              <div className="address-card-top">
                <div className="address-type-badge">
                  {getTypeIcon(addr.addressType)}
                  <span>{addr.addressType || 'Home'}</span>
                </div>

                {addr.isDefault ? (
                  <div className="address-default-badge">
                    <Check size={12} />
                    <span>Default</span>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className="address-set-default-btn"
                    onClick={() => handleSetDefault(addr.id)}
                  >
                    Set as Default
                  </button>
                )}
              </div>

              {/* Recipient Details */}
              <div className="address-card-body">
                <h4 className="address-recipient-name">{addr.fullName}</h4>
                <div className="address-detail-line">
                  <Phone size={13} className="address-icon-muted" />
                  <span>{addr.phone}</span>
                </div>
                <div className="address-detail-line">
                  <MapPin size={13} className="address-icon-muted" />
                  <span>
                    {addr.streetAddress}
                    {addr.apartment ? `, ${addr.apartment}` : ''}
                  </span>
                </div>
                <div className="address-location-line">
                  {addr.city}, {addr.province} {addr.postalCode}
                </div>
                <div className="address-country-line">
                  {addr.country || 'Pakistan'}
                </div>
              </div>

              {/* Card Actions */}
              <div className="address-card-actions">
                <button 
                  type="button" 
                  className="address-action-btn edit"
                  onClick={() => handleOpenEditModal(addr)}
                >
                  <Pencil size={14} />
                  <span>Edit</span>
                </button>
                <button 
                  type="button" 
                  className="address-action-btn delete"
                  onClick={() => handlePromptDelete(addr.id)}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SHADCN FORM DIALOG (ADD / EDIT ADDRESS) */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent 
          className="address-dialog-content"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            const firstInput = document.querySelector('.address-form-input');
            if (firstInput) firstInput.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle className="address-dialog-title">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
            <DialogDescription className="address-dialog-desc">
              {editingAddress 
                ? 'Update your existing delivery address information.' 
                : 'Save a new address to your profile for easy service bookings and deliveries.'}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="address-form-error-box">
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSaveAddress} className="address-form-body">
            
            {/* Row 1: Full Name & Phone Number */}
            <div className="address-form-row">
              <div className="address-form-group">
                <label className="address-form-label">Full Name *</label>
                <input 
                  type="text" 
                  className="address-form-input" 
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="address-form-group">
                <label className="address-form-label">Phone Number *</label>
                <input 
                  type="text" 
                  className="address-form-input" 
                  placeholder="e.g. 03001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Row 2: Street Address */}
            <div className="address-form-group">
              <label className="address-form-label">Street Address *</label>
              <input 
                type="text" 
                className="address-form-input" 
                placeholder="e.g. House 123, Block C, Street 5"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                required
              />
            </div>

            {/* Row 3: Apartment & Address Type */}
            <div className="address-form-row">
              <div className="address-form-group">
                <label className="address-form-label">Apartment / Suite (Optional)</label>
                <input 
                  type="text" 
                  className="address-form-input" 
                  placeholder="e.g. Apt 4B, 2nd Floor"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                />
              </div>

              <div className="address-form-group">
                <label className="address-form-label">Address Type *</label>
                <select 
                  className="address-form-select"
                  value={addressType}
                  onChange={(e) => setAddressType(e.target.value)}
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Row 4: City & State/Province */}
            <div className="address-form-row">
              <div className="address-form-group">
                <label className="address-form-label">City *</label>
                <input 
                  type="text" 
                  className="address-form-input" 
                  placeholder="e.g. Lahore"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div className="address-form-group">
                <label className="address-form-label">State / Province</label>
                <input 
                  type="text" 
                  className="address-form-input" 
                  placeholder="e.g. Punjab"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                />
              </div>
            </div>

            {/* Row 5: Country & Postal Code */}
            <div className="address-form-row">
              <div className="address-form-group">
                <label className="address-form-label">Country *</label>
                <input 
                  type="text" 
                  className="address-form-input" 
                  placeholder="e.g. Pakistan"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                />
              </div>

              <div className="address-form-group">
                <label className="address-form-label">Postal Code</label>
                <input 
                  type="text" 
                  className="address-form-input" 
                  placeholder="e.g. 54000"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>

            {/* Checkbox: Set as Default */}
            <div className="address-checkbox-row">
              <label className="address-checkbox-label">
                <input 
                  type="checkbox" 
                  className="address-checkbox-input"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                />
                <span>Set as default primary delivery address</span>
              </label>
            </div>

            <DialogFooter className="address-dialog-footer">
              <button 
                type="button" 
                className="address-modal-cancel-btn"
                onClick={handleCloseFormModal}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="address-modal-save-btn"
                disabled={submitting}
              >
                {submitting ? 'Saving Address...' : 'Save Address'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SHADCN ALERT DIALOG (DELETE CONFIRMATION) */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent 
          className="address-alert-content"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            const cancelBtn = document.querySelector('.address-alert-cancel-btn');
            if (cancelBtn) cancelBtn.focus();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="address-alert-title">Delete Address?</AlertDialogTitle>
            <AlertDialogDescription className="address-alert-desc">
              Are you sure you want to delete this saved address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="address-alert-footer">
            <AlertDialogCancel 
              className="address-alert-cancel-btn"
              onClick={() => setIsDeleteAlertOpen(false)}
              disabled={deleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="address-alert-delete-btn"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Address'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
