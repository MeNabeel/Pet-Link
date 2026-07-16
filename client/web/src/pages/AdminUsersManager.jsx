import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle, Ban, Trash2, UserCheck, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { 
  AlertDialog, AlertDialogContent, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogCancel, AlertDialogAction 
} from '../components/ui/AlertDialog';

export default function AdminUsersManager({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmConfig, setConfirmConfig] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/users', {
        headers: {
          'x-requester-id': user._id
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching admin users list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchUsers();
    }
  }, [user]);

  const handleUpdateStatus = (targetUserId, newStatus) => {
    setConfirmConfig({
      title: 'Update User Status',
      description: `Are you sure you want to change this user's status to ${newStatus}?`,
      isDanger: false,
      onConfirm: async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/auth/users/${targetUserId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-requester-id': user._id
            },
            body: JSON.stringify({ status: newStatus })
          });
          if (response.ok) {
            alert(`User status updated to ${newStatus} successfully!`);
            fetchUsers();
          } else {
            alert('Failed to update user status.');
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleDeleteUser = (targetUserId) => {
    setConfirmConfig({
      title: 'Permanently Delete User',
      description: 'WARNING: Are you sure you want to permanently delete this user account? This cannot be undone.',
      isDanger: true,
      onConfirm: async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/auth/users/${targetUserId}`, {
            method: 'DELETE',
            headers: {
              'x-requester-id': user._id
            }
          });
          if (response.ok) {
            alert('User account deleted successfully!');
            fetchUsers();
          } else {
            alert('Failed to delete user.');
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase()) || 
                          (u.phone && u.phone.includes(search));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (u.status || 'Active') === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusClass = (statusVal) => {
    const s = statusVal || 'Active';
    if (s === 'Active') return 'badge-success';
    if (s === 'Suspended') return 'badge-warning';
    if (s === 'Blocked') return 'badge-danger';
    if (s === 'Pending Verification') return 'badge-info';
    return 'badge-secondary';
  };

  return (
    <div className="admin-users-container">
      <div className="admin-header-row">
        <div>
          <h2 className="admin-title">User Accounts Directory</h2>
          <p className="admin-subtitle">Monitor, verify, suspend, or manage platform authorization access credentials across PetLink.</p>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="admin-filters-card">
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by full name, email address, or phone..." 
            className="admin-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filters-group-row">
          <div className="filter-item">
            <label>Platform Role</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="admin-select">
              <option value="all">All Roles</option>
              <option value="buyer">Pet Buyer / Adopter</option>
              <option value="seller">Pet Owner / Seller</option>
              <option value="shelter_provider">Shelter Provider</option>
              <option value="admin">Platform Administrator</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Account Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-select">
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Blocked">Blocked</option>
              <option value="Deleted">Deleted</option>
              <option value="Pending Verification">Pending Verification</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="admin-loading">Loading users directory...</div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Profile</th>
                <th>Full Name</th>
                <th>Contact Info</th>
                <th>Platform Role</th>
                <th>Location</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u._id}>
                  <td>
                    <img 
                      src={u.profilePic || "/logo/logo.jpeg"} 
                      alt="Avatar" 
                      className="admin-avatar-img"
                    />
                  </td>
                  <td>
                    <span className="user-table-name">{u.name}</span>
                    <span className="user-table-id">ID: {u._id.substring(u._id.length - 8)}</span>
                  </td>
                  <td>
                    <div className="user-contact-item"><Mail size={12} /> <span>{u.email}</span></div>
                    <div className="user-contact-item"><Phone size={12} /> <span>{u.phone || 'N/A'}</span></div>
                  </td>
                  <td>
                    <span className={`user-role-badge ${u.role}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="user-contact-item"><MapPin size={12} /> <span>{u.city ? `${u.city}, ${u.country || 'PK'}` : 'N/A'}</span></div>
                  </td>
                  <td>
                    <span className="user-joined-date">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge-pill ${getStatusClass(u.status)}`}>
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions-cell">
                      {(u.status || 'Active') === 'Active' ? (
                        <button 
                          className="action-btn suspend-btn" 
                          onClick={() => handleUpdateStatus(u._id, 'Suspended')}
                          title="Suspend Account"
                        >
                          <Ban size={14} />
                          Suspend
                        </button>
                      ) : (
                        <button 
                          className="action-btn activate-btn" 
                          onClick={() => handleUpdateStatus(u._id, 'Active')}
                          title="Activate Account"
                        >
                          <UserCheck size={14} />
                          Activate
                        </button>
                      )}
                      
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDeleteUser(u._id)}
                        title="Delete User Permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF' }}>
                    No users matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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
