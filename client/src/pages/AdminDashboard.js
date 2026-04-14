import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { LayoutDashboard, Users, Calendar, Activity, LogOut, Heart, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [caregivers, setCaregivers] = useState([]);

  useEffect(() => {
    axios.get('/bookings').then(r => setBookings(r.data)).catch(() => {});
    axios.get('/caregivers').then(r => setCaregivers(r.data)).catch(() => {});
  }, []);

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: Calendar, color: '#e0f2fe', iconColor: '#0284c7' },
    { label: 'Total Caregivers', value: caregivers.length, icon: Users, color: '#dcfce7', iconColor: '#16a34a' },
    { label: 'Active Care', value: bookings.filter(b => b.status === 'active').length, icon: Activity, color: '#ccfbf1', iconColor: '#0f766e' },
    { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, icon: Shield, color: '#fef3c7', iconColor: '#d97706' },
  ];

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-logo"><Heart size={18} color="#0d9488" style={{ display: 'inline', marginRight: 6 }} />Admin Panel</div>
        <nav className="sidebar-nav">
          {[{ id: 'overview', icon: LayoutDashboard, label: 'Overview' }, { id: 'bookings', icon: Calendar, label: 'All Bookings' }, { id: 'caregivers', icon: Users, label: 'Caregivers' }].map(item => (
            <div key={item.id} className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <item.icon size={18} /> {item.label}
            </div>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
          <div className="sidebar-item" onClick={() => { logout(); navigate('/'); }}><LogOut size={18} /> Sign Out</div>
        </div>
      </aside>

      <main className="main-content">
        {activeTab === 'overview' && (
          <div>
            <div className="page-header">
              <h1 className="page-title">Admin Dashboard</h1>
              <p className="page-sub">Prana Solutions management overview</p>
            </div>
            <div className="stats-grid">
              {stats.map(s => (
                <div key={s.label} className="card stat-card">
                  <div className="stat-icon" style={{ background: s.color }}><s.icon size={20} color={s.iconColor} /></div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <h2 className="section-title">Recent Bookings</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Patient</th><th>Care Type</th><th>User</th><th>Caregiver</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {bookings.slice(0, 10).map(b => (
                    <tr key={b._id}>
                      <td><strong>{b.patient?.name}</strong><br /><span style={{ fontSize: 12, color: '#9ca3af' }}>Age {b.patient?.age}</span></td>
                      <td><span className="badge badge-teal">{b.careType}</span></td>
                      <td>{b.user?.name || '—'}</td>
                      <td>{b.caregiver?.user?.name || <span style={{ color: '#d97706', fontSize: 12 }}>Unassigned</span>}</td>
                      <td><span className={`badge status-${b.status}`}>{b.status}</span></td>
                      <td style={{ fontSize: 12 }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <div className="page-header"><h1 className="page-title">All Bookings</h1></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Patient</th><th>Care Type</th><th>Schedule</th><th>Location</th><th>Status</th><th>Booked On</th></tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id}>
                      <td><strong>{b.patient?.name}</strong>, {b.patient?.age} · {b.patient?.gender}</td>
                      <td><span className="badge badge-teal">{b.careType}</span></td>
                      <td style={{ fontSize: 12 }}>{b.schedule?.timeSlot}<br />{b.schedule?.duration}</td>
                      <td style={{ fontSize: 12 }}>{b.location?.city}</td>
                      <td><span className={`badge status-${b.status}`}>{b.status}</span></td>
                      <td style={{ fontSize: 12 }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'caregivers' && (
          <div>
            <div className="page-header"><h1 className="page-title">All Caregivers</h1></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Specializations</th><th>Experience</th><th>Rating</th><th>Status</th></tr></thead>
                <tbody>
                  {caregivers.map(c => (
                    <tr key={c._id}>
                      <td><strong>{c.user?.name}</strong><br /><span style={{ fontSize: 12, color: '#9ca3af' }}>{c.user?.email}</span></td>
                      <td>{c.specializations?.map(s => <span key={s} className="badge badge-teal" style={{ marginRight: 4, marginBottom: 4, fontSize: 11 }}>{s}</span>)}</td>
                      <td>{c.experience} yrs</td>
                      <td>⭐ {c.rating} ({c.totalReviews})</td>
                      <td>
                        <span className={`badge ${c.isVerified ? 'badge-green' : 'badge-amber'}`}>{c.isVerified ? '✓ Verified' : 'Pending'}</span>
                        {' '}
                        <span className={`badge ${c.isAvailable ? 'badge-teal' : 'badge-gray'}`}>{c.isAvailable ? 'Available' : 'Busy'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
