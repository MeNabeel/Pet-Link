import API_URL from '@/config';
import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, CheckCircle, Ban, Trash2, UserCheck, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
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
      const response = await fetch(`${API_URL}/api/auth/users`, {
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
          const response = await fetch(`${API_URL}/api/auth/users/${targetUserId}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-requester-id': user._id
            },
            body: JSON.stringify({ status: newStatus })
          });
          if (response.ok) {
            fetchUsers();
          } else {
            console.error('Failed to update user status.');
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleChangeRole = (targetUserId, newRole) => {
    setConfirmConfig({
      title: 'Update Platform Role',
      description: `Are you sure you want to change this user's platform role to ${newRole.toUpperCase()}?`,
      isDanger: false,
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_URL}/api/auth/users/${targetUserId}/role`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-requester-id': user._id
            },
            body: JSON.stringify({ role: newRole })
          });
          if (response.ok) {
            fetchUsers();
          } else {
            console.error('Failed to update user role.');
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
          const response = await fetch(`${API_URL}/api/auth/users/${targetUserId}`, {
            method: 'DELETE',
            headers: {
              'x-requester-id': user._id
            }
          });
          if (response.ok) {
            fetchUsers();
          } else {
            console.error('Failed to delete user.');
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
            <Select value={roleFilter} onValueChange={(val) => setRoleFilter(val)}>
              <SelectTrigger className="admin-select">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent style={{ width: '180px' }}>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="shelter_provider">Shelter Provider</SelectItem>
                <SelectItem value="admin">Platform Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="filter-item">
            <label>Account Status</label>
            <Select 
              value={statusFilter} 
              onValueChange={(val) => setStatusFilter(val)}
            >
              <SelectTrigger className={`status-select-colored ${statusFilter === 'Pending Verification' ? 'pending' : statusFilter.toLowerCase()}`}>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent style={{ width: '180px' }}>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
                <SelectItem value="Deleted">Deleted</SelectItem>
                <SelectItem value="Pending Verification">Pending Verification</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th><Skeleton width="48px" height="14px" /></th>
                <th><Skeleton width="120px" height="14px" /></th>
                <th><Skeleton width="160px" height="14px" /></th>
                <th><Skeleton width="110px" height="14px" /></th>
                <th><Skeleton width="100px" height="14px" /></th>
                <th><Skeleton width="80px" height="14px" /></th>
                <th><Skeleton width="70px" height="14px" /></th>
                <th><Skeleton width="90px" height="14px" /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td><Skeleton width="36px" height="36px" style={{ borderRadius: '50%' }} /></td>
                  <td>
                    <Skeleton width="100px" height="14px" style={{ marginBottom: '6px' }} />
                    <Skeleton width="70px" height="11px" />
                  </td>
                  <td>
                    <Skeleton width="130px" height="12px" style={{ marginBottom: '4px' }} />
                    <Skeleton width="90px" height="12px" />
                  </td>
                  <td><Skeleton width="90px" height="24px" style={{ borderRadius: '8px' }} /></td>
                  <td><Skeleton width="90px" height="14px" /></td>
                  <td><Skeleton width="80px" height="14px" /></td>
                  <td><Skeleton width="60px" height="18px" style={{ borderRadius: '9999px' }} /></td>
                  <td><Skeleton width="80px" height="28px" style={{ borderRadius: '6px' }} /></td>
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
                    <Select
                      value={u.role}
                      onValueChange={(val) => handleChangeRole(u._id, val)}
                    >
                      <SelectTrigger 
                        style={{
                          height: 'auto',
                          padding: '6px 12px',
                          borderRadius: '12px',
                          border: '1.5px solid var(--color-border)',
                          fontSize: '11px',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          backgroundColor: 'var(--color-bg-light)',
                          color: 'var(--color-dark-light)',
                        }}
                      >
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent style={{ width: '120px' }}>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="shelter_provider">Shelter Provider</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
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
