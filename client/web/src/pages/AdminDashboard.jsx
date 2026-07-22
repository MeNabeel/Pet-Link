import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Users, PawPrint, HeartHandshake, ShieldAlert, Award, FileText, 
  MapPin, ShoppingBag, FolderOpen, CreditCard, Bell, LogOut, 
  Search, TrendingUp, DollarSign, Calendar, ChevronRight, Activity, 
  Sliders, Plus, CheckCircle, PackageOpen, LayoutDashboard, PlusCircle,
  AlertCircle, ShieldCheck
} from 'lucide-react';
import AdminUsersManager from './AdminUsersManager';
import AdminCategoryManager from './AdminCategoryManager';
import AdminProductManager from './AdminProductManager';
import './Dashboard.css';
import { 
  AlertDialog, AlertDialogContent, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogCancel, AlertDialogAction 
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/Skeleton';

const userChartData = [
  { month: "Jan", buyers: 45, sellers: 12 },
  { month: "Feb", buyers: 85, sellers: 28 },
  { month: "Mar", buyers: 150, sellers: 46 },
  { month: "Apr", buyers: 220, sellers: 68 },
  { month: "May", buyers: 310, sellers: 92 },
  { month: "Jun", buyers: 420, sellers: 135 },
];

const revenueChartData = [
  { month: "Jan", StoreSales: 8000, ShelterBookings: 2500 },
  { month: "Feb", StoreSales: 15000, ShelterBookings: 4500 },
  { month: "Mar", StoreSales: 24000, ShelterBookings: 8000 },
  { month: "Apr", StoreSales: 35000, ShelterBookings: 12000 },
  { month: "May", StoreSales: 52000, ShelterBookings: 17500 },
  { month: "Jun", StoreSales: 73000, ShelterBookings: 24000 },
];

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSignoutOpen, setIsSignoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    pets: 0,
    listings: 0,
    products: 0,
    orders: 0,
    revenue: '0 PKR',
    bookings: 0,
    pendingOrders: 0,
    completedOrders: 0,
    notifications: 0
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/analytics', {
        headers: {
          'x-requester-id': user._id
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      fetchAnalytics();
    }
  }, [user]);

  const handleActionClick = (actionName) => {
    alert(`${actionName} action triggered. Admin console feature active!`);
  };

  return (
    <div className="dash-container">
      {/* Header bar */}
      <header className="dash-header">
        <div className="dash-brand" onClick={() => setActiveTab('dashboard')} style={{ cursor: 'pointer' }}>
          <img src="/logo/logo.jpeg" alt="PetLink Logo" className="dash-logo" />
          <h1 className="dash-brand-name" style={{ color: '#EAB308' }}>PetLink Admin console</h1>
        </div>

        
        <div className="dash-user-nav">
          <div style={{ position: 'relative', cursor: 'pointer', marginRight: '8px' }}>
            <Bell size={20} color="var(--color-muted)" />
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#EF4444', color: '#FFF', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '800' }}>
              {stats.notifications}
            </span>
          </div>

          <div className="dash-profile-badge">
            <img 
              src={user.profilePic || "/logo/logo.jpeg"} 
              alt="Avatar" 
              style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', marginRight: '6px' }} 
            />
            <span className="dash-profile-name">{user.name}</span>
            <span className="dash-profile-role" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#EAB308' }}>Administrator</span>
          </div>

          <button 
            type="button" 
            className="btn btn-outline btn-signout" 
            style={{ padding: '8px 16px', gap: '6px', fontSize: '13px' }}
            onClick={() => setIsSignoutOpen(true)}
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </header>

      <div className="dash-body">
        {/* Sidebar Nav */}
        <aside className="dash-sidebar" style={{ position: 'sticky', top: '73px', height: 'calc(100vh - 73px)', overflowY: 'auto' }}>
          <span className={`dash-side-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} />
            Dashboard
          </span>
          <span className={`dash-side-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={18} />
            Users
          </span>
          <span className={`dash-side-link ${activeTab === 'pets' ? 'active' : ''}`} onClick={() => setActiveTab('pets')}>
            <PawPrint size={18} />
            Pet Profiles
          </span>
          <span className={`dash-side-link ${activeTab === 'marketplace' ? 'active' : ''}`} onClick={() => setActiveTab('marketplace')}>
            <HeartHandshake size={18} />
            Marketplace
          </span>
          <span className={`dash-side-link ${activeTab === 'shelter' ? 'active' : ''}`} onClick={() => setActiveTab('shelter')}>
            <Calendar size={18} />
            Shelter Requests
          </span>
          <span className={`dash-side-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <ShoppingBag size={18} />
            Products
          </span>
          <span className={`dash-side-link ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
            <FolderOpen size={18} />
            Categories
          </span>
          <span className={`dash-side-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <PackageOpen size={18} />
            Orders
          </span>
          <span className={`dash-side-link ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>
            <CreditCard size={18} />
            Payments
          </span>
          <span className={`dash-side-link ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
            <Bell size={18} />
            Notifications
          </span>
          <span className={`dash-side-link ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <FileText size={18} />
            Reports
          </span>
          <span className={`dash-side-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Sliders size={18} />
            Settings
          </span>
        </aside>

        {/* Content Pane */}
        <main className="dash-content">
          {activeTab === 'dashboard' && (
            <div className="fade-in">
              <div className="dash-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 className="dash-title">Administrator Overview Panel</h2>
                  <span className="dash-subtitle">High-level operations telemetry, verified metrics summaries, and quick setup launchers.</span>
                </div>
              </div>

              {/* Stats Cards Grid */}
              {loading ? (
                <div className="dash-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div key={idx} style={{ display: 'flex', padding: '20px', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                      <Skeleton width="48px" height="48px" style={{ borderRadius: '12px', marginRight: '16px' }} />
                      <div style={{ flex: 1 }}>
                        <Skeleton width="90px" height="12px" style={{ marginBottom: '6px' }} />
                        <Skeleton width="60px" height="20px" style={{ marginBottom: '6px' }} />
                        <Skeleton width="80px" height="10px" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dash-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                  <div className="metric-card hover-lift" style={{ display: 'flex', padding: '20px', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                    <div className="metric-icon-box" style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(0, 102, 204, 0.08)', borderRadius: '12px', padding: '12px', marginRight: '16px' }}>
                      <Users size={24} />
                    </div>
                    <div>
                      <span className="metric-label" style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '600' }}>Total Users</span>
                      <h3 className="metric-value" style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0' }}>{stats.users}</h3>
                      <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <TrendingUp size={10} /> Live DB count
                      </span>
                    </div>
                  </div>

                  <div className="metric-card hover-lift" style={{ display: 'flex', padding: '20px', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                    <div className="metric-icon-box" style={{ color: '#EAB308', backgroundColor: 'rgba(234, 179, 8, 0.08)', borderRadius: '12px', padding: '12px', marginRight: '16px' }}>
                      <PawPrint size={24} />
                    </div>
                    <div>
                      <span className="metric-label" style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '600' }}>Total Pets</span>
                      <h3 className="metric-value" style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0' }}>{stats.pets}</h3>
                      <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <TrendingUp size={10} /> Live DB count
                      </span>
                    </div>
                  </div>

                  <div className="metric-card hover-lift" style={{ display: 'flex', padding: '20px', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                    <div className="metric-icon-box" style={{ color: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.08)', borderRadius: '12px', padding: '12px', marginRight: '16px' }}>
                      <HeartHandshake size={24} />
                    </div>
                    <div>
                      <span className="metric-label" style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '600' }}>Marketplace Listings</span>
                      <h3 className="metric-value" style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0' }}>{stats.listings}</h3>
                      <span style={{ fontSize: '10px', color: 'var(--color-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <TrendingUp size={10} /> Active listings
                      </span>
                    </div>
                  </div>

                  <div className="metric-card hover-lift" style={{ display: 'flex', padding: '20px', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                    <div className="metric-icon-box" style={{ color: '#EC4899', backgroundColor: 'rgba(236, 72, 153, 0.08)', borderRadius: '12px', padding: '12px', marginRight: '16px' }}>
                      <ShoppingBag size={24} />
                    </div>
                    <div>
                      <span className="metric-label" style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '600' }}>Products Lister</span>
                      <h3 className="metric-value" style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0' }}>{stats.products}</h3>
                      <span style={{ fontSize: '10px', color: 'var(--color-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <TrendingUp size={10} /> Products catalog
                      </span>
                    </div>
                  </div>

                  <div className="metric-card hover-lift" style={{ display: 'flex', padding: '20px', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                    <div className="metric-icon-box" style={{ color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '12px', padding: '12px', marginRight: '16px' }}>
                      <DollarSign size={24} />
                    </div>
                    <div>
                      <span className="metric-label" style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '600' }}>Total Revenue</span>
                      <h3 className="metric-value" style={{ fontSize: '18px', fontWeight: '800', margin: '4px 0' }}>{stats.revenue}</h3>
                      <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <TrendingUp size={10} /> Sales volume
                      </span>
                    </div>
                  </div>

                  <div className="metric-card hover-lift" style={{ display: 'flex', padding: '20px', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                    <div className="metric-icon-box" style={{ color: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.08)', borderRadius: '12px', padding: '12px', marginRight: '16px' }}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <span className="metric-label" style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '600' }}>Shelter Bookings</span>
                      <h3 className="metric-value" style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0' }}>{stats.bookings}</h3>
                      <span style={{ fontSize: '10px', color: 'var(--color-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <TrendingUp size={10} /> Active bookings
                      </span>
                    </div>
                  </div>

                  <div className="metric-card hover-lift" style={{ display: 'flex', padding: '20px', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                    <div className="metric-icon-box" style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderRadius: '12px', padding: '12px', marginRight: '16px' }}>
                      <Activity size={24} />
                    </div>
                    <div>
                      <span className="metric-label" style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '600' }}>Pending Orders</span>
                      <h3 className="metric-value" style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0' }}>{stats.pendingOrders}</h3>
                      <span style={{ fontSize: '10px', color: '#EF4444', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <AlertCircle size={10} /> Needs packaging
                      </span>
                    </div>
                  </div>

                  <div className="metric-card hover-lift" style={{ display: 'flex', padding: '20px', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                    <div className="metric-icon-box" style={{ color: '#059669', backgroundColor: 'rgba(5, 150, 105, 0.08)', borderRadius: '12px', padding: '12px', marginRight: '16px' }}>
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <span className="metric-label" style={{ fontSize: '12px', color: 'var(--color-muted)', fontWeight: '600' }}>Completed Orders</span>
                      <h3 className="metric-value" style={{ fontSize: '20px', fontWeight: '800', margin: '4px 0' }}>{stats.completedOrders}</h3>
                      <span style={{ fontSize: '10px', color: '#10B981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <CheckCircle size={10} /> Fully dispatched
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions Panel */}
              <div className="quick-actions-section" style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '20px', border: '1px solid var(--color-border)', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={18} color="var(--color-primary)" />
                  Operations Quick Launchers
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                  <button className="pet-btn-outline" style={{ padding: '10px 16px', fontSize: '12px', justifyContent: 'center' }} onClick={() => setActiveTab('users')}>
                    <Users size={14} style={{ marginRight: '6px' }} />
                    Verify Accounts
                  </button>
                  <button className="pet-btn-outline" style={{ padding: '10px 16px', fontSize: '12px', justifyContent: 'center' }} onClick={() => handleActionClick('Add Product')}>
                    <PlusCircle size={14} style={{ marginRight: '6px' }} />
                    Add Product Catalog
                  </button>
                  <button className="pet-btn-outline" style={{ padding: '10px 16px', fontSize: '12px', justifyContent: 'center' }} onClick={() => handleActionClick('Create Category')}>
                    <FolderOpen size={14} style={{ marginRight: '6px' }} />
                    Create Category
                  </button>
                  <button className="pet-btn-outline" style={{ padding: '10px 16px', fontSize: '12px', justifyContent: 'center' }} onClick={() => setActiveTab('orders')}>
                    <PackageOpen size={14} style={{ marginRight: '6px' }} />
                    View Orders Queue
                  </button>
                  <button className="pet-btn-outline" style={{ padding: '10px 16px', fontSize: '12px', justifyContent: 'center' }} onClick={() => handleActionClick('Generate Reports')}>
                    <FileText size={14} style={{ marginRight: '6px' }} />
                    Generate PDF Report
                  </button>
                </div>
              </div>

              {/* Analytics Section */}
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '20px', border: '1px solid var(--color-border)', height: '300px' }}>
                    <Skeleton width="180px" height="16px" style={{ marginBottom: '20px' }} />
                    <Skeleton width="100%" height="200px" style={{ borderRadius: '12px' }} />
                  </div>
                  <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '20px', border: '1px solid var(--color-border)', height: '300px' }}>
                    <Skeleton width="180px" height="16px" style={{ marginBottom: '20px' }} />
                    <Skeleton width="100%" height="200px" style={{ borderRadius: '12px' }} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>Monthly Users & Activity Telemetry</h4>
                    <div style={{ height: '240px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: 'var(--color-muted)', fontWeight: '600' }} />
                          <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: 'var(--color-muted)', fontWeight: '600' }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '12px', fontWeight: '700' }} />
                          <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '700', paddingTop: '10px' }} />
                          <Line type="monotone" dataKey="buyers" name="Buyers" stroke="#0066CC" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="sellers" name="Sellers" stroke="#2ECC71" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>Revenue & Sales Analytics (PKR)</h4>
                    <div style={{ height: '240px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: 'var(--color-muted)', fontWeight: '600' }} />
                          <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: 'var(--color-muted)', fontWeight: '600' }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '12px', fontWeight: '700' }} formatter={(value) => `${value.toLocaleString()} PKR`} />
                          <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '700', paddingTop: '10px' }} />
                          <Bar dataKey="StoreSales" name="Store Sales" fill="#EA580C" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="ShelterBookings" name="Shelter Bookings" fill="#9B59B6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Activity Log */}
              <div style={{ backgroundColor: '#FFF', padding: '24px', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px' }}>Live Platform Events Logging</h4>
                <div style={{ gap: '12px', display: 'flex', flexDirection: 'column' }}>
                  {stats.logs && stats.logs.length > 0 ? (
                    stats.logs.map((log, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: idx === stats.logs.length - 1 ? '0' : '8px', borderBottom: idx === stats.logs.length - 1 ? 'none' : '1px solid var(--color-bg-light)', fontSize: '12px', alignItems: 'center' }}>
                        <span style={{ color: 'var(--color-dark)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {log.type === 'user' ? (
                            <ShieldCheck size={14} color="#16A34A" />
                          ) : (
                            <PawPrint size={14} color="#EAB308" />
                          )}
                          {log.message}
                        </span>
                        <span style={{ color: 'var(--color-muted)' }}>
                          {new Date(log.time).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--color-muted)', fontSize: '12px', textAlign: 'center', padding: '12px 0' }}>
                      No recent platform events recorded.
                    </p>
                  )}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'users' && (
            <AdminUsersManager user={user} />
          )}

          {activeTab === 'categories' && (
            <AdminCategoryManager user={user} />
          )}

          {activeTab === 'products' && (
            <AdminProductManager user={user} />
          )}

          {!['dashboard', 'users', 'categories', 'products'].includes(activeTab) && (
            <div style={{ backgroundColor: '#FFF', padding: '40px', borderRadius: '20px', border: '1px solid var(--color-border)', textAlign: 'center' }} className="fade-in">
              <ShieldAlert size={48} color="var(--color-primary)" style={{ margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')} Console Pane
              </h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '13px', maxWidth: '460px', margin: '0 auto 20px auto' }}>
                This administration interface tab is reserved for next sprint implementation steps. Admins will have full permissions parameters configure.
              </p>
              <button className="pet-btn-outline" style={{ margin: '0 auto' }} onClick={() => setActiveTab('dashboard')}>
                Return to Overview Dashboard
              </button>
            </div>
          )}
        </main>
      </div>

      <AlertDialog open={isSignoutOpen} onOpenChange={setIsSignoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of the Admin Control Panel session?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onLogout}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
