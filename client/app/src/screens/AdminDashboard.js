import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, 
  ActivityIndicator, TextInput, Alert, FlatList 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import AdminCategories from './AdminCategories';
import AdminProducts from './AdminProducts';

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users'
  const [stats, setStats] = useState({
    users: 0,
    pets: 0,
    listings: 0,
    products: 0,
    revenue: '0 PKR',
    pendingOrders: 0,
    logs: []
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // User management states
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoadingStats(true);
      const res = await fetch(`${API_URL}/api/auth/analytics`, {
        headers: { 'x-requester-id': user._id }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.log('Error fetching stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch(`${API_URL}/api/auth/users`, {
        headers: { 'x-requester-id': user._id }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.log('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchAnalytics();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleUpdateStatus = async (targetUserId, newStatus) => {
    Alert.alert(
      "Confirm Action",
      `Are you sure you want to change this user status to ${newStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/api/auth/users/${targetUserId}/status`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'x-requester-id': user._id
                },
                body: JSON.stringify({ status: newStatus })
              });
              if (res.ok) {
                Alert.alert("Success", `User status updated to ${newStatus}`);
                fetchUsers();
                fetchAnalytics();
              } else {
                Alert.alert("Error", "Failed to update status");
              }
            } catch (err) {
              console.log(err);
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = async (targetUserId) => {
    Alert.alert(
      "Delete Account",
      "WARNING: Are you sure you want to permanently delete this user account? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/api/auth/users/${targetUserId}`, {
                method: 'DELETE',
                headers: { 'x-requester-id': user._id }
              });
              if (res.ok) {
                Alert.alert("Success", "User account deleted successfully");
                fetchUsers();
                fetchAnalytics();
              } else {
                Alert.alert("Error", "Failed to delete user account");
              }
            } catch (err) {
              console.log(err);
            }
          }
        }
      ]
    );
  };

  const filteredUsers = usersList.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <Image source={require('../../assets/logo/logo.jpeg')} style={styles.avatar} />
          <View>
            <Text style={styles.greeting}>Admin Workspace</Text>
            <Text style={styles.name}>{user.name}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Feather name="log-out" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'overview' && styles.activeTabBtn]} 
          onPress={() => setActiveTab('overview')}
        >
          <Feather name="grid" size={16} color={activeTab === 'overview' ? COLORS.primary : COLORS.muted} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'users' && styles.activeTabBtn]} 
          onPress={() => setActiveTab('users')}
        >
          <Feather name="users" size={16} color={activeTab === 'users' ? COLORS.primary : COLORS.muted} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'categories' && styles.activeTabBtn]} 
          onPress={() => setActiveTab('categories')}
        >
          <Feather name="folder" size={16} color={activeTab === 'categories' ? COLORS.primary : COLORS.muted} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>Categories</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'products' && styles.activeTabBtn]} 
          onPress={() => setActiveTab('products')}
        >
          <Feather name="package" size={16} color={activeTab === 'products' ? COLORS.primary : COLORS.muted} style={{ marginRight: 6 }} />
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>Products</Text>
        </TouchableOpacity>
      </View>

      {/* Views */}
      {activeTab === 'overview' ? (
        <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {loadingStats ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <View>
              {/* Metric grid */}
              <View style={styles.grid}>
                <View style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <Feather name="users" size={18} color={COLORS.primary} />
                    <Text style={styles.metricLabel}>Total Users</Text>
                  </View>
                  <Text style={styles.metricValue}>{stats.users}</Text>
                  <Text style={styles.metricSubtitle}>Live database count</Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <Feather name="heart" size={18} color="#EAB308" />
                    <Text style={styles.metricLabel}>Total Pets</Text>
                  </View>
                  <Text style={styles.metricValue}>{stats.pets}</Text>
                  <Text style={styles.metricSubtitle}>Live database count</Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <Feather name="shopping-bag" size={18} color="#16A34A" />
                    <Text style={styles.metricLabel}>Products</Text>
                  </View>
                  <Text style={styles.metricValue}>{stats.products}</Text>
                  <Text style={styles.metricSubtitle}>Catalog size</Text>
                </View>

                <View style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <Feather name="activity" size={18} color="#EF4444" />
                    <Text style={styles.metricLabel}>Pending Orders</Text>
                  </View>
                  <Text style={styles.metricValue}>{stats.pendingOrders}</Text>
                  <Text style={styles.metricSubtitle}>Needs packaging</Text>
                </View>
              </View>

              {/* Event Logs list */}
              <Text style={styles.sectionTitle}>Recent Event Activity</Text>
              {stats.logs && stats.logs.length > 0 ? (
                <View style={styles.logsCard}>
                  {stats.logs.map((log, idx) => (
                    <View key={idx} style={[styles.logRow, idx === stats.logs.length - 1 && { borderBottomWidth: 0 }]}>
                      <Feather 
                        name={log.type === 'user' ? "user-plus" : "heart"} 
                        size={14} 
                        color={log.type === 'user' ? "#16A34A" : "#EAB308"} 
                        style={{ marginRight: 10, marginTop: 2 }} 
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.logText}>{log.message}</Text>
                        <Text style={styles.logTime}>{new Date(log.time).toLocaleTimeString()}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No recent event logged.</Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      ) : activeTab === 'users' ? (
        <View style={{ flex: 1 }}>
          {/* Search box */}
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color={COLORS.muted} style={{ marginRight: 8 }} />
            <TextInput 
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>

          {loadingUsers ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList 
              data={filteredUsers}
              keyExtractor={item => item._id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <View style={styles.userCard}>
                  <View style={styles.userHeader}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={[styles.roleBadge, styles[item.role]]}>{item.role.replace('_', ' ')}</Text>
                  </View>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <Text style={styles.userPhone}>{item.phone || 'No phone registered'}</Text>
                  <View style={styles.userFooter}>
                    <Text style={styles.statusLabel}>
                      Status: <Text style={styles[`status_${item.status}`]}>{item.status || 'Active'}</Text>
                    </Text>
                    
                    <View style={styles.actions}>
                      {(item.status || 'Active') === 'Active' ? (
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpdateStatus(item._id, 'Suspended')}>
                          <Feather name="slash" size={12} color="#D97706" />
                          <Text style={[styles.actionBtnText, { color: '#D97706' }]}>Suspend</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpdateStatus(item._id, 'Active')}>
                          <Feather name="check" size={12} color="#16A34A" />
                          <Text style={[styles.actionBtnText, { color: '#16A34A' }]}>Activate</Text>
                        </TouchableOpacity>
                      )}
                      
                      <TouchableOpacity style={[styles.actionBtn, { borderColor: '#EF4444' }]} onPress={() => handleDeleteUser(item._id)}>
                        <Feather name="trash-2" size={12} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No registered platform users found.</Text>
                </View>
              )}
            />
          )}
        </View>
      ) : activeTab === 'categories' ? (
        <AdminCategories user={user} onBack={() => setActiveTab('overview')} />
      ) : activeTab === 'products' ? (
        <AdminProducts user={user} onBack={() => setActiveTab('overview')} />
      ) : null}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  greeting: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.dark,
  },
  logoutBtn: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 12,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabBtn: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  scrollBody: {
    flex: 1,
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.muted,
    marginLeft: 6,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 9,
    color: COLORS.muted,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 12,
  },
  logsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 30,
  },
  logRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logText: {
    fontSize: 12,
    color: COLORS.darkLight,
    fontWeight: '600',
  },
  logTime: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    height: '100%',
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  userName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.dark,
  },
  roleBadge: {
    fontSize: 9,
    fontWeight: '700',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  buyer: { backgroundColor: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6' },
  seller: { backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10B981' },
  shelter_provider: { backgroundColor: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6' },
  admin: { backgroundColor: 'rgba(234, 179, 8, 0.08)', color: '#EAB308' },
  userEmail: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '600',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 11,
    color: COLORS.muted,
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  statusLabel: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: '600',
  },
  status_Active: { color: '#16A34A', fontWeight: '800' },
  status_Suspended: { color: '#D97706', fontWeight: '800' },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '700',
  }
});
