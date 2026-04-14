import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ArrowRight, CheckCircle, Star,
  Phone, MapPin, Clock, Search, Filter, User
} from 'lucide-react';

const STEPS = ['Care Type', 'Choose Caregiver', 'Patient Details', 'Requirements', 'Schedule', 'Location', 'Review'];

const initialForm = {
  careType: '',
  caregiverId: '',
  patient: { name: '', age: '', gender: '', medicalConditions: '' },
  careRequirements: [],
  schedule: { startDate: '', endDate: '', timeSlot: '', duration: '' },
  location: { address: '', city: '', pincode: '' },
  additionalNotes: ''
};

export default function BookingForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Caregiver browsing state
  const [caregivers, setCaregivers] = useState([]);
  const [cgLoading, setCgLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCg, setSelectedCg] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch caregivers whenever care type is chosen (step 0 -> step 1)
  useEffect(() => {
    if (step === 1 && form.careType) {
      fetchCaregivers();
    }
  }, [step, form.careType]);

  const fetchCaregivers = async () => {
    setCgLoading(true);
    try {
      const { data } = await axios.get(`/caregivers?careType=${form.careType}&available=true`);
      setCaregivers(data);
    } catch {
      toast.error('Failed to load caregivers');
    } finally {
      setCgLoading(false);
    }
  };

  const setPatient = (f, v) => setForm(prev => ({ ...prev, patient: { ...prev.patient, [f]: v } }));
  const setSchedule = (f, v) => setForm(prev => ({ ...prev, schedule: { ...prev.schedule, [f]: v } }));
  const setLocation = (f, v) => setForm(prev => ({ ...prev, location: { ...prev.location, [f]: v } }));
  const toggleReq = (r) => setForm(prev => ({
    ...prev,
    careRequirements: prev.careRequirements.includes(r)
      ? prev.careRequirements.filter(x => x !== r)
      : [...prev.careRequirements, r]
  }));

  const selectCaregiver = (cg) => {
    setSelectedCg(cg);
    setForm(prev => ({ ...prev, caregiverId: cg._id }));
  };

  const canNext = () => {
    if (step === 0) return !!form.careType;
    if (step === 1) return !!form.caregiverId;
    if (step === 2) return form.patient.name && form.patient.age && form.patient.gender;
    if (step === 3) return form.careRequirements.length > 0;
    if (step === 4) return form.schedule.startDate && form.schedule.timeSlot && form.schedule.duration;
    if (step === 5) return !!form.location.address;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post('/bookings', form);
      setSuccess(true);
      toast.success('Booking request sent! Waiting for caregiver to accept.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredCaregivers = caregivers.filter(cg => {
    const name = cg.user?.name?.toLowerCase() || '';
    const loc = cg.location?.toLowerCase() || '';
    const q = search.toLowerCase();
    return name.includes(q) || loc.includes(q);
  });

  // ── Success screen ────────────────────────────────────────────────
  if (success) return (
    <div style={{ minHeight: '100vh', background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
          <CheckCircle size={44} color="#0f766e" />
        </div>
        <h2 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 32, color: '#111827', marginBottom: 12 }}>Request Sent!</h2>
        <p style={{ color: '#6b7280', fontSize: 16, lineHeight: 1.75, marginBottom: 12 }}>
          Your booking request has been sent to <strong style={{ color: '#0f766e' }}>{selectedCg?.user?.name}</strong>.
        </p>
        <p style={{ color: '#6b7280', fontSize: 15, lineHeight: 1.75, marginBottom: 32 }}>
          You will be notified once the caregiver accepts or rejects your request. You can track the status from your dashboard.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/user-dashboard')}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );

  const careTypes = [
    { id: 'elderly',   label: 'Elderly Care',    icon: '👴', desc: 'For senior citizens needing daily assistance',   color: '#e0f2fe', border: '#7dd3fc' },
    { id: 'maternity', label: 'Maternity Care',  icon: '🤱', desc: 'Pre/post-natal support for mothers',             color: '#fce7f3', border: '#f9a8d4' },
    { id: 'childcare', label: 'Child Care',       icon: '👶', desc: 'Safe supervision for children 0–12 yrs',         color: '#dcfce7', border: '#86efac' },
  ];

  const requirements = [
    { id: 'daily_assistance', label: 'Daily Assistance', icon: '🏠' },
    { id: 'medical_support',  label: 'Medical Support',  icon: '💊' },
    { id: 'childcare',        label: 'Childcare',         icon: '🧒' },
    { id: 'postnatal_care',   label: 'Postnatal Care',   icon: '🤱' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* ── Header ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-ghost btn-sm"
          onClick={() => step === 0 ? navigate('/user-dashboard') : setStep(s => s - 1)}>
          <ArrowLeft size={16} /> {step === 0 ? 'Dashboard' : 'Back'}
        </button>
        <div style={{ fontFamily: 'DM Serif Display,serif', fontSize: 20, color: '#0f766e' }}>Book a Caregiver</div>
      </div>

      {/* ── Step progress ── */}
      <div style={{ background: 'white', padding: '20px 32px', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', minWidth: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                    background: i <= step ? '#0d9488' : '#e5e7eb',
                    color: i <= step ? 'white' : '#9ca3af'
                  }}>
                    {i < step ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: i === step ? '#0d9488' : '#9ca3af', whiteSpace: 'nowrap' }}>{s}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < step ? '#0d9488' : '#e5e7eb', margin: '0 6px', marginBottom: 22, transition: 'background 0.3s' }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Form body ── */}
      <div style={{ maxWidth: step === 1 ? 900 : 720, margin: '40px auto', padding: '0 20px' }}>
        <div className="card" style={{ padding: 40 }}>

          {/* ── Step 0: Care Type ── */}
          {step === 0 && (
            <div>
              <h2 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 26, marginBottom: 8 }}>Who is the care for?</h2>
              <p style={{ color: '#6b7280', marginBottom: 28 }}>Select the type of care needed for your loved one.</p>
              <div style={{ display: 'grid', gap: 16 }}>
                {careTypes.map(ct => (
                  <div key={ct.id} onClick={() => setForm(f => ({ ...f, careType: ct.id, caregiverId: '', patient: initialForm.patient }))}
                    style={{ padding: 24, borderRadius: 14, border: `2px solid ${form.careType === ct.id ? '#0d9488' : ct.border}`, background: form.careType === ct.id ? '#f0fdfa' : ct.color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 20, transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 40 }}>{ct.icon}</div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>{ct.label}</div>
                      <div style={{ fontSize: 14, color: '#6b7280' }}>{ct.desc}</div>
                    </div>
                    {form.careType === ct.id && <CheckCircle size={24} color="#0d9488" style={{ marginLeft: 'auto' }} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 1: Choose Caregiver ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 26, marginBottom: 6 }}>Choose Your Caregiver</h2>
              <p style={{ color: '#6b7280', marginBottom: 24 }}>
                Browse caregivers registered on Prana Solutions who specialise in{' '}
                <strong style={{ color: '#0f766e' }}>{form.careType}</strong> care. Select one to send your request.
              </p>

              {/* Search bar */}
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input className="form-input" placeholder="Search by name or location..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 40 }} />
              </div>

              {cgLoading ? (
                <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
              ) : filteredCaregivers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>🔍</div>
                  <h3 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 20, marginBottom: 8, color: '#374151' }}>No caregivers found</h3>
                  <p style={{ fontSize: 14 }}>No registered caregivers are available for {form.careType} care right now.</p>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={fetchCaregivers}>Refresh</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {filteredCaregivers.map(cg => (
                    <CaregiverCard
                      key={cg._id}
                      cg={cg}
                      selected={form.caregiverId === cg._id}
                      onSelect={() => selectCaregiver(cg)}
                    />
                  ))}
                </div>
              )}

              {form.caregiverId && selectedCg && (
                <div style={{ marginTop: 20, padding: '14px 20px', background: '#f0fdfa', borderRadius: 12, border: '1.5px solid #99f6e4', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircle size={20} color="#0f766e" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0f766e' }}>
                    Selected: {selectedCg.user?.name}
                  </span>
                  <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', fontSize: 12 }} onClick={() => { setSelectedCg(null); setForm(f => ({ ...f, caregiverId: '' })); }}>
                    Change
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Patient Details ── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 26, marginBottom: 8 }}>Patient Details</h2>
              <p style={{ color: '#6b7280', marginBottom: 28 }}>Tell us about the person who needs care.</p>
              <div className="form-group">
                <label className="form-label">Patient's Full Name *</label>
                <input className="form-input" placeholder="e.g. Rama Lakshaama"
                  value={form.patient.name} onChange={e => setPatient('name', e.target.value)} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input className="form-input" type="number" min="0" max="120" placeholder="e.g. 65"
                    value={form.patient.age} onChange={e => setPatient('age', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select className="form-select" value={form.patient.gender} onChange={e => setPatient('gender', e.target.value)}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Medical Conditions (optional)</label>
                <textarea className="form-textarea" placeholder="e.g. Diabetes, Hypertension, Post-surgery recovery..."
                  value={form.patient.medicalConditions} onChange={e => setPatient('medicalConditions', e.target.value)} style={{ minHeight: 90 }} />
              </div>
            </div>
          )}

          {/* ── Step 3: Requirements ── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 26, marginBottom: 8 }}>Care Requirements</h2>
              <p style={{ color: '#6b7280', marginBottom: 28 }}>Select all types of care needed (at least one).</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {requirements.map(r => (
                  <div key={r.id} onClick={() => toggleReq(r.id)}
                    style={{ padding: 20, borderRadius: 14, border: `2px solid ${form.careRequirements.includes(r.id) ? '#0d9488' : '#e5e7eb'}`, background: form.careRequirements.includes(r.id) ? '#f0fdfa' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 28 }}>{r.icon}</div>
                    <div style={{ fontWeight: 600, color: form.careRequirements.includes(r.id) ? '#0f766e' : '#374151' }}>{r.label}</div>
                    {form.careRequirements.includes(r.id) && <CheckCircle size={18} color="#0d9488" style={{ marginLeft: 'auto' }} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 4: Schedule ── */}
          {step === 4 && (
            <div>
              <h2 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 26, marginBottom: 8 }}>Schedule</h2>
              <p style={{ color: '#6b7280', marginBottom: 28 }}>When do you need the caregiver?</p>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input className="form-input" type="date"
                    value={form.schedule.startDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setSchedule('startDate', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date (optional)</label>
                  <input className="form-input" type="date"
                    value={form.schedule.endDate}
                    min={form.schedule.startDate}
                    onChange={e => setSchedule('endDate', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Time Slot *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                  {['Morning (6AM–12PM)', 'Afternoon (12PM–6PM)', 'Evening (6PM–10PM)', 'Night (10PM–6AM)', 'Full Day (24hr)'].map(slot => (
                    <div key={slot} onClick={() => setSchedule('timeSlot', slot)}
                      style={{ padding: '12px 10px', borderRadius: 10, border: `2px solid ${form.schedule.timeSlot === slot ? '#0d9488' : '#e5e7eb'}`, background: form.schedule.timeSlot === slot ? '#f0fdfa' : 'white', cursor: 'pointer', textAlign: 'center', fontSize: 13, fontWeight: 500, color: form.schedule.timeSlot === slot ? '#0f766e' : '#374151', transition: 'all 0.15s' }}>
                      {slot}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Duration *</label>
                <select className="form-select" value={form.schedule.duration} onChange={e => setSchedule('duration', e.target.value)}>
                  <option value="">Select duration</option>
                  <option value="4 hours/day">4 hours/day</option>
                  <option value="8 hours/day">8 hours/day</option>
                  <option value="12 hours/day">12 hours/day</option>
                  <option value="Full-time (24hr)">Full-time (24hr)</option>
                  <option value="Live-in">Live-in Caregiver</option>
                </select>
              </div>
            </div>
          )}

          {/* ── Step 5: Location ── */}
          {step === 5 && (
            <div>
              <h2 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 26, marginBottom: 8 }}>Location</h2>
              <p style={{ color: '#6b7280', marginBottom: 28 }}>Where will the caregiver provide care?</p>
              <div className="form-group">
                <label className="form-label">Full Address *</label>
                <textarea className="form-textarea" placeholder="House/Flat no., Street, Area..."
                  value={form.location.address} onChange={e => setLocation('address', e.target.value)} style={{ minHeight: 80 }} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" placeholder="e.g. Hyderabad"
                    value={form.location.city} onChange={e => setLocation('city', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input className="form-input" placeholder="e.g. 516002"
                    value={form.location.pincode} onChange={e => setLocation('pincode', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Special Instructions / Notes</label>
                <textarea className="form-textarea" placeholder="Any special instructions for the caregiver..."
                  value={form.additionalNotes} onChange={e => setForm(f => ({ ...f, additionalNotes: e.target.value }))} style={{ minHeight: 90 }} />
              </div>
            </div>
          )}

          {/* ── Step 6: Review ── */}
          {step === 6 && (
            <div>
              <h2 style={{ fontFamily: 'DM Serif Display,serif', fontSize: 26, marginBottom: 8 }}>Review Your Request</h2>
              <p style={{ color: '#6b7280', marginBottom: 24 }}>Please confirm all details before sending the request to the caregiver.</p>

              {/* Caregiver summary */}
              {selectedCg && (
                <div style={{ padding: 20, background: '#f0fdfa', borderRadius: 14, border: '1.5px solid #99f6e4', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {selectedCg.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0f766e' }}>Request will be sent to: {selectedCg.user?.name}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                      {selectedCg.specializations?.join(', ')} · {selectedCg.experience} yrs exp · ⭐ {selectedCg.rating}
                    </div>
                  </div>
                </div>
              )}

              {[
                { label: 'Care Type', value: form.careType.charAt(0).toUpperCase() + form.careType.slice(1) },
                { label: 'Patient', value: `${form.patient.name}, ${form.patient.age} yrs, ${form.patient.gender}` },
                { label: 'Medical Conditions', value: form.patient.medicalConditions || 'None' },
                { label: 'Requirements', value: form.careRequirements.map(r => r.replace(/_/g, ' ')).join(', ') },
                { label: 'Start Date', value: form.schedule.startDate },
                { label: 'Time Slot', value: form.schedule.timeSlot },
                { label: 'Duration', value: form.schedule.duration },
                { label: 'Address', value: `${form.location.address}${form.location.city ? ', ' + form.location.city : ''}${form.location.pincode ? ' - ' + form.location.pincode : ''}` },
                { label: 'Notes', value: form.additionalNotes || 'None' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ width: 148, fontSize: 13, color: '#9ca3af', fontWeight: 600, flexShrink: 0 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{item.value}</div>
                </div>
              ))}

              <div style={{ marginTop: 24, padding: 16, background: '#fef3c7', borderRadius: 12, border: '1px solid #fcd34d' }}>
                <p style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>
                  ⏳ After submission, the caregiver will receive your request and can <strong>accept or reject</strong> it. You will be notified of their decision on your dashboard.
                </p>
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 36, paddingTop: 24, borderTop: '1px solid #f3f4f6' }}>
            <button className="btn btn-ghost"
              onClick={() => step === 0 ? navigate('/user-dashboard') : setStep(s => s - 1)}>
              <ArrowLeft size={16} /> {step === 0 ? 'Cancel' : 'Back'}
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canNext()}>
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Sending request...' : '✓ Send Booking Request'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Caregiver card component ─────────────────────────────────────────
function CaregiverCard({ cg, selected, onSelect }) {
  const specLabels = { elderly: 'Elder Care', maternity: 'Maternity', childcare: 'Child Care', medical: 'Medical', postnatal: 'Postnatal' };
  return (
    <div onClick={onSelect}
      style={{ padding: 22, borderRadius: 16, border: `2px solid ${selected ? '#0d9488' : '#e5e7eb'}`, background: selected ? '#f0fdfa' : 'white', cursor: 'pointer', transition: 'all 0.15s', position: 'relative' }}>

      {selected && (
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <CheckCircle size={22} color="#0d9488" />
        </div>
      )}

      {/* Avatar + name */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', background: selected ? '#0d9488' : '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: selected ? 'white' : '#0f766e', flexShrink: 0 }}>
          {cg.user?.name?.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{cg.user?.name}</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>{cg.location || 'Location not set'}</div>
        </div>
      </div>

      {/* Rating + experience */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 13, color: '#6b7280' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Star size={13} color="#f59e0b" fill="#f59e0b" /> {cg.rating || 'New'} ({cg.totalReviews || 0})
        </span>
        <span>· {cg.experience} yr{cg.experience !== 1 ? 's' : ''} exp</span>
        {cg.isVerified && <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Verified</span>}
      </div>

      {/* Specializations */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {cg.specializations?.map(s => (
          <span key={s} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: '#e0f2fe', color: '#0284c7' }}>
            {specLabels[s] || s}
          </span>
        ))}
      </div>

      {/* Bio */}
      {cg.bio && (
        <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {cg.bio}
        </p>
      )}

      {/* Contact */}
      {cg.user?.phone && (
        <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Phone size={12} /> {cg.user.phone}
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <div style={{ padding: '9px 0', borderRadius: 8, background: selected ? '#0d9488' : '#f3f4f6', color: selected ? 'white' : '#374151', textAlign: 'center', fontSize: 13, fontWeight: 600, transition: 'all 0.15s' }}>
          {selected ? '✓ Selected' : 'Select Caregiver'}
        </div>
      </div>
    </div>
  );
}
