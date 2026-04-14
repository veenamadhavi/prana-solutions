import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Calendar, Users, LogOut, Activity,
  User, Heart, CheckCircle, Clock, MapPin, FileText,
  Bell, ThumbsUp, ThumbsDown, AlertCircle
} from 'lucide-react';

const careIcon = { elderly: '👴', maternity: '🤱', childcare: '👶' };

const STATUS_META = {
  pending_acceptance: { label: 'Awaiting Your Response', bg: '#fef3c7', color: '#92400e' },
  accepted:           { label: 'Accepted',               bg: '#dbeafe', color: '#1e40af' },
  active:             { label: 'Active',                  bg: '#dcfce7', color: '#15803d' },
  completed:          { label: 'Completed',               bg: '#ccfbf1', color: '#0f766e' },
  cancelled:          { label: 'Cancelled',               bg: '#ffe4e6', color: '#9f1239' },
  rejected:           { label: 'Rejected',                bg: '#ffe4e6', color: '#9f1239' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status, bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
}

export default function CaregiverDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [incoming, setIncoming] = useState([]);   // pending_acceptance requests
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateMsg, setUpdateMsg] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [bRes, inRes, pRes] = await Promise.all([
        axios.get('/bookings'),
        axios.get('/bookings/incoming'),
        axios.get('/caregivers/me').catch(() => ({ data: null }))
      ]);
      setBookings(bRes.data);
      setIncoming(inRes.data);
      setProfile(pRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Accept a booking request
  const handleAccept = async (id) => {
    try {
      await axios.patch(`/bookings/${id}/respond`, { action: 'accept' });
      toast.success('✅ Booking request accepted! The family has been notified.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    }
  };

  // Reject a booking request
  const handleReject = async (id) => {
    try {
      await axios.patch(`/bookings/${id}/respond`, { action: 'reject', rejectionReason: rejectReason });
      toast.success('Booking request rejected.');
      setRejectingId(null);
      setRejectReason('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  // Change status: accepted -> active -> completed
  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/bookings/${id}/status`, { status });
      toast.success('Status updated');
      fetchData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Post a health update
  const addHealthUpdate = async (id) => {
    if (!updateMsg.trim()) return;
    try {
      await axios.post(`/bookings/${id}/health-update`, { message: updateMsg });
      toast.success('Health update sent to family');
      setUpdateMsg('');
      setSelectedBookingId(null);
      fetchData();
    } catch {
      toast.error('Failed to send update');
    }
  };

  const activeBookings   = bookings.filter(b => b.status === 'active');
  const acceptedBookings = bookings.filter(b => b.status === 'accepted');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const navItems = [
    { id: 'overview',  icon: LayoutDashboard, label: 'Overview' },
    { id: 'requests',  icon: Bell,             label: `Requests${incoming.length > 0 ? ` (${incoming.length})` : ''}` },
    { id: 'patients',  icon: Users,            label: 'My Patients' },
    { id: 'schedule',  icon: Calendar,         label: 'Schedule' },
    { id: 'updates',   icon: Activity,         label: 'Care Logs' },
    { id: 'profile',   icon: User,             label: 'My Profile' },
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
            <div key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}>
              <item.icon size={18} />
              {item.label}
              {item.id === 'requests' && incoming.length > 0 && (
                <span style={{ marginLeft: 'auto', background: '#e11d48', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>
                  {incoming.length}
                </span>
              )}
            </div>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
          <div style={{ padding: '12px 14px', marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{user?.name}</div>
            <span className="badge badge-teal" style={{ fontSize: 11, marginTop: 4 }}>Caregiver</span>
          </div>
          <div className="sidebar-item" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={18} /> Sign Out
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main-content">

        {/* ═══ OVERVIEW ═══ */}
        {activeTab === 'overview' && (
          <div>
            <div className="page-header">
              <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]}! 🌟</h1>
              <p className="page-sub">Manage your patients, requests and care logs from here.</p>
            </div>

            {/* New requests alert */}
            {incoming.length > 0 && (
              <div style={{ marginBottom: 24, padding: '16px 20px', background: '#fef3c7', borderRadius: 14, border: '1.5px solid #fcd34d', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                onClick={() => setActiveTab('requests')}>
                <AlertCircle size={22} color="#d97706" />
                <div>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: 15 }}>
                    You have {incoming.length} new booking request{incoming.length > 1 ? 's' : ''}!
                  </div>
                  <div style={{ fontSize: 13, color: '#b45309' }}>Click to review and respond →</div>
                </div>
              </div>
            )}

            <div className="stats-grid">
              {[
                { label: 'Pending Requests', value: incoming.length,         icon: Bell,        color: '#fef3c7', iconColor: '#d97706' },
                { label: 'Accepted',          value: acceptedBookings.length, icon: Calendar,    color: '#dbeafe', iconColor: '#1d4ed8' },
                { label: 'Active Care',        value: activeBookings.length,  icon: Activity,    color: '#dcfce7', iconColor: '#16a34a' },
                { label: 'Completed',          value: completedBookings.length,icon: CheckCircle,color: '#ccfbf1', iconColor: '#0f766e' },
              ].map(s => (
                <div key={s.label} className="card stat-card">
                  <div className="stat-icon" style={{ background: s.color }}><s.icon size={20} color={s.iconColor} /></div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <h2 className="section-title" style={{ marginTop: 8 }}>Active & Accepted Patients</h2>
            {loading
              ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
              : [...acceptedBookings, ...activeBookings].length === 0
                ? <div className="empty-state"><Users size={48} /><h3>No active patients</h3><p>Accepted bookings will appear here.</p></div>
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[...acceptedBookings, ...activeBookings].map(b => (
                      <PatientCard key={b._id} booking={b} onStatusUpdate={updateStatus} />
                    ))}
                  </div>
                )
            }
          </div>
        )}

        {/* ═══ INCOMING REQUESTS ═══ */}
        {activeTab === 'requests' && (
          <div>
            <div className="page-header">
              <h1 className="page-title">Booking Requests</h1>
              <p className="page-sub">Families who have requested your caregiving services.</p>
            </div>

            {loading
              ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
              : incoming.length === 0
                ? (
                  <div className="empty-state">
                    <Bell size={48} />
                    <h3>No pending requests</h3>
                    <p>New booking requests from families will appear here.</p>
                  </div>
                )
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {incoming.map(b => (
                      <div key={b._id} className="card" style={{ padding: 28, border: '1.5px solid #fcd34d' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <div style={{ fontSize: 36 }}>{careIcon[b.careType]}</div>
                            <div>
                              <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>
                                Request from <span style={{ color: '#0d9488' }}>{b.user?.name}</span>
                              </div>
                              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>
                                {b.careType} care · {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                            </div>
                          </div>
                          <StatusBadge status={b.status} />
                        </div>

                        {/* Details grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                          <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Patient</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{b.patient?.name}</div>
                            <div style={{ fontSize: 13, color: '#6b7280' }}>Age {b.patient?.age} · {b.patient?.gender}</div>
                            {b.patient?.medicalConditions && (
                              <div style={{ fontSize: 12, color: '#d97706', marginTop: 5, fontWeight: 500 }}>⚕️ {b.patient.medicalConditions}</div>
                            )}
                          </div>
                          <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Schedule</div>
                            <div style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                              <Clock size={13} /> {b.schedule?.timeSlot}
                            </div>
                            <div style={{ fontSize: 13, color: '#374151' }}>Duration: {b.schedule?.duration}</div>
                            <div style={{ fontSize: 13, color: '#374151' }}>
                              From: {b.schedule?.startDate ? new Date(b.schedule.startDate).toLocaleDateString('en-IN') : 'TBD'}
                            </div>
                          </div>
                          <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Location</div>
                            <div style={{ fontSize: 13, color: '#374151', display: 'flex', gap: 5 }}>
                              <MapPin size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                              <span>{b.location?.address}{b.location?.city ? ', ' + b.location.city : ''}</span>
                            </div>
                          </div>
                          <div style={{ padding: 14, background: '#f8fafc', borderRadius: 10 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Care Requirements</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {b.careRequirements?.map(r => (
                                <span key={r} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#e0f2fe', color: '#0284c7' }}>
                                  {r.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {b.additionalNotes && (
                          <div style={{ marginBottom: 20, padding: '12px 16px', background: '#fefce8', borderRadius: 10, border: '1px solid #fcd34d', fontSize: 13, color: '#92400e' }}>
                            <strong>Special notes:</strong> {b.additionalNotes}
                          </div>
                        )}

                        {/* Family contact */}
                        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#f0fdfa', borderRadius: 10, fontSize: 13, color: '#374151' }}>
                          <strong style={{ color: '#0f766e' }}>Contact: </strong>
                          {b.user?.name} · {b.user?.email}{b.user?.phone ? ' · ' + b.user.phone : ''}
                        </div>

                        {/* Reject form */}
                        {rejectingId === b._id && (
                          <div style={{ marginBottom: 16, padding: 16, background: '#fff1f2', borderRadius: 12, border: '1px solid #fca5a5' }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#991b1b', marginBottom: 10 }}>Reason for rejection (optional)</div>
                            <textarea className="form-textarea" placeholder="e.g. I am not available on those dates..."
                              value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ minHeight: 70, marginBottom: 10 }} />
                            <div style={{ display: 'flex', gap: 10 }}>
                              <button className="btn btn-danger btn-sm" onClick={() => handleReject(b._id)}>Confirm Rejection</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => { setRejectingId(null); setRejectReason(''); }}>Cancel</button>
                            </div>
                          </div>
                        )}

                        {/* Accept / Reject buttons */}
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button className="btn btn-primary" onClick={() => handleAccept(b._id)}
                            style={{ flex: 1 }}>
                            <ThumbsUp size={16} /> Accept Request
                          </button>
                          {rejectingId !== b._id && (
                            <button className="btn btn-danger" onClick={() => setRejectingId(b._id)}
                              style={{ flex: 1 }}>
                              <ThumbsDown size={16} /> Reject Request
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
            }
          </div>
        )}

        {/* ═══ MY PATIENTS ═══ */}
        {activeTab === 'patients' && (
          <div>
            <div className="page-header">
              <h1 className="page-title">My Patients</h1>
              <p className="page-sub">All your accepted and active care assignments.</p>
            </div>
            {bookings.filter(b => !['pending_acceptance', 'rejected'].includes(b.status)).length === 0
              ? <div className="empty-state"><Users size={48} /><h3>No patients yet</h3><p>Accepted bookings will show here.</p></div>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {bookings.filter(b => !['pending_acceptance', 'rejected'].includes(b.status)).map(b => (
                    <PatientCard key={b._id} booking={b} onStatusUpdate={updateStatus} expanded
                      onAddUpdate={() => { setSelectedBookingId(b._id); setActiveTab('updates'); }} />
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* ═══ SCHEDULE ═══ */}
        {activeTab === 'schedule' && (
          <div>
            <div className="page-header">
              <h1 className="page-title">My Schedule</h1>
              <p className="page-sub">Your upcoming and ongoing care appointments.</p>
            </div>
            {bookings.filter(b => ['accepted', 'active'].includes(b.status)).length === 0
              ? <div className="empty-state"><Calendar size={48} /><h3>No upcoming appointments</h3></div>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {bookings.filter(b => ['accepted', 'active'].includes(b.status)).map(b => (
                    <div key={b._id} className="card" style={{ padding: 24 }}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div style={{ fontSize: 32 }}>{careIcon[b.careType]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{b.patient?.name}</div>
                            <StatusBadge status={b.status} />
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 13, color: '#6b7280' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} /> {b.schedule?.timeSlot}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={13} />
                              {b.schedule?.startDate ? new Date(b.schedule.startDate).toLocaleDateString('en-IN') : 'TBD'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} /> {b.location?.city || b.location?.address}</span>
                          </div>
                          <div style={{ marginTop: 10 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: '#f0fdfa', color: '#0f766e' }}>
                              {b.schedule?.duration}
                            </span>
                          </div>
                          {b.additionalNotes && (
                            <div style={{ marginTop: 12, padding: '10px 14px', background: '#fefce8', borderRadius: 10, fontSize: 13, color: '#92400e', borderLeft: '3px solid #fcd34d' }}>
                              <strong>Note:</strong> {b.additionalNotes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* ═══ CARE LOGS ═══ */}
        {activeTab === 'updates' && (
          <div>
            <div className="page-header">
              <h1 className="page-title">Care Logs</h1>
              <p className="page-sub">Send health updates to the patient's family.</p>
            </div>
            {bookings.filter(b => ['accepted', 'active'].includes(b.status)).length === 0
              ? <div className="empty-state"><FileText size={48} /><h3>No active patients</h3><p>Health logs appear here once you have active patients.</p></div>
              : bookings.filter(b => ['accepted', 'active'].includes(b.status)).map(b => (
                <div key={b._id} className="card" style={{ padding: 28, marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 28 }}>{careIcon[b.careType]}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{b.patient?.name}</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>{b.careType} · {b.location?.city} · Family: {b.user?.name}</div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  {/* Past updates */}
                  {(b.healthUpdates || []).length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                        Previous Updates ({b.healthUpdates.length})
                      </div>
                      {b.healthUpdates.slice().reverse().slice(0, 5).map((u, i) => (
                        <div key={i} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10, marginBottom: 8, fontSize: 13, borderLeft: '3px solid #99f6e4' }}>
                          <div style={{ color: '#9ca3af', marginBottom: 4, fontSize: 12 }}>{new Date(u.timestamp).toLocaleString('en-IN')}</div>
                          <div style={{ color: '#374151' }}>{u.message}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new update */}
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>Add Health Update for {b.user?.name}'s family</div>
                    <textarea className="form-textarea"
                      placeholder={`e.g. ${b.patient?.name} had a good morning, vitals are stable...`}
                      value={selectedBookingId === b._id ? updateMsg : ''}
                      onChange={e => { setSelectedBookingId(b._id); setUpdateMsg(e.target.value); }}
                      style={{ minHeight: 80, marginBottom: 12 }} />
                    <button className="btn btn-primary btn-sm"
                      onClick={() => addHealthUpdate(b._id)}
                      disabled={!updateMsg.trim() || selectedBookingId !== b._id}>
                      <Activity size={14} /> Send Update to Family
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ═══ PROFILE ═══ */}
        {activeTab === 'profile' && (
          <div>
            <div className="page-header">
              <h1 className="page-title">My Profile</h1>
              <p className="page-sub">Your caregiver profile as seen by families</p>
            </div>
            <div className="card" style={{ padding: 32, maxWidth: 540 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#0f766e' }}>
                  {user?.name?.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{user?.name}</div>
                  <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 6 }}>{user?.email}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="badge badge-teal">Caregiver</span>
                    {profile?.isVerified && <span className="badge badge-green">✓ Verified</span>}
                    <span className={`badge ${profile?.isAvailable ? 'badge-green' : 'badge-gray'}`}>
                      {profile?.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
              {profile && (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Specializations</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {profile.specializations?.map(s => <span key={s} className="badge badge-teal">{s}</span>)}
                    </div>
                  </div>
                  {[
                    { label: 'Experience',   value: `${profile.experience} year${profile.experience !== 1 ? 's' : ''}` },
                    { label: 'Rating',       value: `${profile.rating}/5 ⭐ (${profile.totalReviews} reviews)` },
                    { label: 'Location',     value: profile.location || 'Not set' },
                    { label: 'Bio',          value: profile.bio || 'Not set' },
                    { label: 'Phone',        value: user?.phone || 'Not set' },
                  ].map(f => (
                    <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6', fontSize: 14 }}>
                      <span style={{ color: '#9ca3af', fontWeight: 600 }}>{f.label}</span>
                      <span style={{ color: '#111827', fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>{f.value}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Patient card used in overview / patients tab ─────────────────────
function PatientCard({ booking: b, onStatusUpdate, expanded, onAddUpdate }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 32 }}>{careIcon[b.careType]}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{b.patient?.name}</span>
              <StatusBadge status={b.status} />
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              {b.careType} · Age {b.patient?.age} · {b.patient?.gender}
            </div>
            {b.patient?.medicalConditions && (
              <div style={{ fontSize: 12, color: '#d97706', marginTop: 4, fontWeight: 500 }}>⚕️ {b.patient.medicalConditions}</div>
            )}
            {expanded && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: '#6b7280' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {b.schedule?.timeSlot} · {b.schedule?.duration}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {b.location?.address}</span>
              </div>
            )}
            {expanded && b.user && (
              <div style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>
                Family: <strong style={{ color: '#111827' }}>{b.user.name}</strong>{b.user.phone ? ' · ' + b.user.phone : ''}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {b.status === 'accepted' && (
            <button className="btn btn-primary btn-sm" onClick={() => onStatusUpdate(b._id, 'active')}>
              <CheckCircle size={14} /> Start Care
            </button>
          )}
          {b.status === 'active' && (
            <button className="btn btn-sm" style={{ background: '#dcfce7', color: '#16a34a', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontWeight: 600 }}
              onClick={() => onStatusUpdate(b._id, 'completed')}>
              <CheckCircle size={14} /> Mark Complete
            </button>
          )}
          {onAddUpdate && ['accepted', 'active'].includes(b.status) && (
            <button className="btn btn-ghost btn-sm" onClick={onAddUpdate}>
              <Activity size={14} /> Care Log
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
