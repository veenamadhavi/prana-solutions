import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Heart, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', phone: '', specializations: [], experience: '', bio: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const specs = ['elderly', 'maternity', 'childcare', 'medical', 'postnatal'];

  const toggleSpec = (s) => setForm(f => ({
    ...f, specializations: f.specializations.includes(s) ? f.specializations.filter(x => x !== s) : [...f.specializations, s]
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await signup(form);
      toast.success(`Welcome to Prana Solutions, ${user.name}!`);
      navigate(`/${user.role}-dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#0d9488', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Heart size={28} color="white" fill="white" />
          </div>
          <h1 style={{ fontSize: 28, fontFamily: 'DM Serif Display,serif', color: '#111827', marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: '#6b7280', fontSize: 14 }}>Join Prana Solutions and get started</p>
        </div>

        <div className="card" style={{ padding: 36 }}>
          <form onSubmit={handleSubmit}>
            {/* Role selector */}
            <div className="form-group">
              <label className="form-label">I am a</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {['user', 'caregiver'].map(r => (
                  <div key={r} onClick={() => setForm(f => ({ ...f, role: r }))}
                    style={{ padding: '14px 16px', borderRadius: 10, border: `2px solid ${form.role === r ? '#0d9488' : '#e5e7eb'}`, background: form.role === r ? '#f0fdfa' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{r === 'user' ? '👨‍👩‍👧' : '👩‍⚕️'}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: form.role === r ? '#0f766e' : '#374151' }}>
                      {r === 'user' ? 'Family / Patient' : 'Caregiver'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Your name" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+91 xxxxx xxxxx" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPw ? 'text' : 'password'} placeholder="Min 6 characters"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {form.role === 'caregiver' && (
              <>
                <div className="form-group">
                  <label className="form-label">Specializations</label>
                  <div className="checkbox-group">
                    {specs.map(s => (
                      <label key={s} className="checkbox-label">
                        <input type="checkbox" checked={form.specializations.includes(s)} onChange={() => toggleSpec(s)} />
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input className="form-input" type="number" min="0" placeholder="e.g. 3"
                    value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bio</label>
                  <textarea className="form-textarea" placeholder="Briefly describe your background..."
                    value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ minHeight: 80 }} />
                </div>
              </>
            )}

            <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              Already have an account? <Link to="/login" style={{ color: '#0d9488', fontWeight: 600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
