import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Calendar, Activity, LogOut, Plus,
  User, Clock, MapPin, Trash2, ChevronRight, Heart, Bell, Info
} from 'lucide-react';

const careIcon = { elderly: '👴', maternity: '🤱', childcare: '👶' };

const STATUS_META = {
  pending_acceptance: { label: 'Awaiting Caregiver Response', bg: '#fef3c7', color: '#92400e' },
  accepted:           { label: 'Caregiver Accepted',          bg: '#dbeafe', color: '#1e40af' },
  active:             { label: 'Care Active',                  bg: '#dcfce7', color: '#15803d' },
  completed:          { label: 'Completed',                   bg: '#ccfbf1', color: '#0f766e' },
  cancelled:          { label: 'Cancelled',                   bg: '#ffe4e6', color: '#9f1239' },
  rejected:           { label: 'Rejected by Caregiver',       bg: '#ffe4e6', color: '#9f1239' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status, bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: m.bg, color: m.color, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get('/bookings');
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.delete(`/bookings/${id}`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch {
      toast.error('Failed to cancel booking');
    }
  };

  const pending    = bookings.filter(b => b.status === 'pending_acceptance');
  const accepted   = bookings.filter(b => b.status === 'accepted');
  const active     = bookings.filter(b => b.status === 'active');
  const completed  = bookings.filter(b => b.status === 'completed');
  const rejected   = bookings.filter(b => b.status === 'rejected');

  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'bookings', icon: Calendar,        label: 'My Bookings' },
    { id: 'health',   icon: Activity,        label: 'Health Updates' },
    { id: 'profile',  icon: User,            label: 'My Profile' },
  ];

  return (
    <div className="dashboard-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Heart size={18} color="#0d9488" style={{ display: 'inline', marginRight: 6 }} />
          Prana Solutions
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <div key={item.id} className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
              <item.icon size={18} /> {item.label}
            </div>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
          <div style={{ padding: '12px 14px', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{user?.email}</div>
          </div>
          <div className="sidebar-item" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={18} /> Sign Out
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">

        {/* ═══ OVERVIEW ═══ */}
        {activeTab === 'overview' && (
          <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 className="page-title">Good day, {user?.name?.split(' ')[0]}! 👋</h1>
                <p className="page-sub">Here's a summary of your care arrangements.</p>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/book')}>
                <Plus size={16} /> Book Caregiver
              </button>
            </div>

            {/* Rejected bookings alert */}
            {rejected.length > 0 && (
              <div style={{ marginBottom: 20, padding: '14px 20px', background: '#fff1f2', borderRadius: 14, border: '1.5px solid #fca5a5', display: 'flex', alignItems: 'center', gap: 14 }}>
                <Info size={20} color="#e11d48" />
                <div>
                  <div style={{ fontWeight: 700, color: '#9f1239', fontSize: 14 }}>
                    {rejected.length} booking request{rejected.length > 1 ? 's were' : ' was'} rejected by the caregiver.
                  </div>
                  <div style={{ fontSize: 13, color: '#be123c' }}>You can book a different caregiver.</div>
                </div>
                <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/book')}>
                  Book Again
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
              {[
                { label: 'Awaiting Response', value: pending.length,   icon: Bell,     color: '#fef3c7', iconColor: '#d97706' },
                { label: 'Accepted',          value: accepted.length,  icon: Calendar, color: '#dbeafe', iconColor: '#1d4ed8' },
                { label: 'Active Care',       value: active.length,    icon: Activity, color: '#dcfce7', iconColor: '#16a34a' },
                { label: 'Completed',         value: completed.length, icon: Heart,    color: '#ccfbf1', iconColor: '#0f766e' },
              ].map(s => (
                <div key={s.label} className="card stat-card">
                  <div className="stat-icon" style={{ background: s.color }}><s.icon size={20} color={s.iconColor} /></div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent bookings */}
            <h2 className="section-title">Recent Bookings</h2>
            {loading
              ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
              : bookings.length === 0
                ? (
                  <div className="card" style={{ padding: 52, textAlign: 'center' }}>
                    <div style={{ fontSize: 52, marginBottom: 16 }}>🏥</div>
                    <h3 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 22, marginBottom: 10, color: '#111827' }}>No bookings yet</h3>
                    <p style={{ color: '#6b7280', marginBottom: 24 }}>Browse caregivers and send your first booking request.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/book')}><Plus size={16} /> Book a Caregiver</button>
                  </div>
                )
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {bookings.slice(0, 5).map(b => (
                      <BookingCard key={b._id} booking={b} onCancel={cancelBooking} />
                    ))}
                    {bookings.length > 5 && (
                      <button className="btn btn-ghost" style={{ alignSelf: 'center' }} onClick={() => setActiveTab('bookings')}>
                        View all {bookings.length} bookings <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                )
            }
          </div>
        )}

        {/* ═══ ALL BOOKINGS ═══ */}
        {activeTab === 'bookings' && (
          <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 className="page-title">My Bookings</h1>
                <p className="page-sub">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
              </div>
              <button className="btn btn-primary" onClick={() => navigate('/book')}><Plus size={16} /> New Booking</button>
            </div>

            {loading
              ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
              : bookings.length === 0
                ? <div className="empty-state"><Calendar size={48} /><h3>No bookings yet</h3><p>Your bookings will appear here.</p></div>
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {bookings.map(b => <BookingCard key={b._id} booking={b} onCancel={cancelBooking} expanded />)}
                  </div>
                )
            }
          </div>
        )}

        {/* ═══ HEALTH UPDATES ═══ */}
        {activeTab === 'health' && (
          <div>
            <div className="page-header">
              <h1 className="page-title">Health Updates</h1>
              <p className="page-sub">Latest updates sent by your caregivers</p>
            </div>
            {(() => {
              const updates = bookings.flatMap(b =>
                (b.healthUpdates || []).map(u => ({ ...u, booking: b }))
              ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

              if (updates.length === 0) return (
                <div className="empty-state"><Bell size={48} /><h3>No updates yet</h3><p>Health updates from caregivers will appear here.</p></div>
              );
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {updates.map((u, i) => (
                    <div key={i} className="card" style={{ padding: 20, display: 'flex', gap: 16 }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Activity size={18} color="#0f766e" />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
                          {u.booking?.patient?.name} · {new Date(u.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                        <div style={{ fontSize: 15, color: '#111827', lineHeight: 1.6 }}>{u.message}</div>
                        {u.booking?.caregiver?.user && (
                          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
                            From: {u.booking.caregiver.user.name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ═══ PROFILE ═══ */}
        {activeTab === 'profile' && (
          <div>
            <div className="page-header">
              <h1 className="page-title">My Profile</h1>
              <p className="page-sub">Manage your account information</p>
            </div>
            <div className="card" style={{ padding: 32, maxWidth: 540 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#0f766e' }}>
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{user?.name}</div>
                  <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 6 }}>{user?.email}</div>
                  <span className="badge badge-teal">Family Member</span>
                </div>
              </div>
              {[
                { label: 'Name',         value: user?.name },
                { label: 'Email',        value: user?.email },
                { label: 'Phone',        value: user?.phone || 'Not set' },
                { label: 'Role',         value: 'User / Family' },
                { label: 'Total Bookings', value: bookings.length },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>
                  <span style={{ color: '#9ca3af', fontWeight: 600 }}>{f.label}</span>
                  <span style={{ color: '#111827', fontWeight: 500 }}>{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Single booking card ───────────────────────────────────────────────
function BookingCard({ booking: b, onCancel, expanded }) {
  const cancellable = ['pending_acceptance', 'accepted'].includes(b.status);

  return (
    <div className="card" style={{ padding: 24, borderLeft: b.status === 'rejected' ? '4px solid #fca5a5' : b.status === 'pending_acceptance' ? '4px solid #fcd34d' : b.status === 'active' ? '4px solid #86efac' : '4px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 32 }}>{careIcon[b.careType] || '🏥'}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{b.patient?.name}</span>
              <StatusBadge status={b.status} />
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              {b.careType?.charAt(0).toUpperCase() + b.careType?.slice(1)} · Age {b.patient?.age} · {b.patient?.gender}
            </div>

            {expanded && (
              <>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} /> {b.schedule?.timeSlot} · {b.schedule?.duration}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={13} /> {b.location?.address}{b.location?.city ? ', ' + b.location.city : ''}
                </div>

                {/* Caregiver info */}
                {b.caregiver?.user && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: '#f0fdfa', borderRadius: 10, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: '#0f766e' }}>Caregiver: </span>
                    <span style={{ color: '#374151' }}>{b.caregiver.user.name}</span>
                    {b.caregiver.user.phone && <span style={{ color: '#9ca3af' }}> · {b.caregiver.user.phone}</span>}
                  </div>
                )}

                {/* Rejection reason */}
                {b.status === 'rejected' && b.rejectionReason && (
                  <div style={{ marginTop: 10, padding: '10px 14px', background: '#fff1f2', borderRadius: 10, fontSize: 13, color: '#9f1239', borderLeft: '3px solid #fca5a5' }}>
                    <strong>Rejection reason:</strong> {b.rejectionReason}
                  </div>
                )}

                {/* Suggest rebook if rejected */}
                {b.status === 'rejected' && (
                  <div style={{ marginTop: 10 }}>
                    <a href="/book" style={{ fontSize: 13, color: '#0d9488', fontWeight: 600 }}>→ Book a different caregiver</a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {cancellable && (
            <button className="btn btn-danger btn-sm" onClick={() => onCancel(b._id)}>
              <Trash2 size={14} /> Cancel
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
        <span>Booked: {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        {b.schedule?.startDate && (
          <span>Care starts: {new Date(b.schedule.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        )}
      </div>
    </div>
  );
}
