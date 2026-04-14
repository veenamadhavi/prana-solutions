import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart, Shield, Clock, Star, ChevronRight, Phone, Mail,
  CheckCircle, Users, Activity, Home, ArrowRight, Menu, X
} from 'lucide-react';

const services = [
  { icon: '👴', title: 'Elder Care', desc: 'Daily personal assistance, medication reminders, mobility support & health monitoring for seniors.', color: '#e0f2fe', accent: '#0284c7' },
  { icon: '🤱', title: 'Maternity Care', desc: 'Compassionate pre & post-natal support, nutrition guidance, and newborn care for new mothers.', color: '#fce7f3', accent: '#db2777' },
  { icon: '👶', title: 'Child Care', desc: 'Safe, nurturing supervision and developmental support for children aged 0–12 years.', color: '#dcfce7', accent: '#16a34a' },
];

const features = [
  { icon: Shield, title: 'Verified Caregivers', desc: 'Every caregiver undergoes rigorous background checks, training, and certification.' },
  { icon: Activity, title: 'Health Monitoring', desc: 'Real-time health updates and daily care reports sent directly to your family.' },
  { icon: Clock, title: '24/7 Support', desc: 'Emergency assistance and round-the-clock support for your peace of mind.' },
  { icon: Heart, title: 'Personalised Care', desc: 'Custom care plans designed for each patient\'s unique medical and personal needs.' },
  { icon: Users, title: 'Dedicated Caregiver', desc: 'One consistent caregiver assigned to your family — not rotating strangers.' },
  { icon: Home, title: 'In-Home Service', desc: 'Professional care delivered in the comfort and safety of your home.' },
];

const testimonials = [
  { name: 'Suresh Kumar', role: 'Software Engineer, Hyderabad', text: 'Prana assigned the perfect caregiver for my mother. She is healthier and happier than ever. Complete peace of mind!', rating: 5 },
  { name: 'Anitha Reddy', role: 'New Mother, Bengaluru', text: 'Post-delivery care was exceptional. Having a dedicated caregiver made my recovery so much smoother.', rating: 5 },
  { name: 'Ravi Teja', role: 'Bank Employee, Vijayawada', text: 'Finding trustworthy childcare as a working parent is stressful. Prana made it effortless and reliable.', rating: 5 },
];

const stats = [
  { value: '500+', label: 'Families Served' },
  { value: '150+', label: 'Verified Caregivers' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Support Available' },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 5%', height: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#0f766e' }}>
          Prana <span style={{ color: '#1f2937' }}>Solutions</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="#services" style={{ padding: '8px 14px', fontSize: 14, color: '#4b5563', fontWeight: 500 }}>Services</a>
          <a href="#features" style={{ padding: '8px 14px', fontSize: 14, color: '#4b5563', fontWeight: 500 }}>Features</a>
          <a href="#testimonials" style={{ padding: '8px 14px', fontSize: 14, color: '#4b5563', fontWeight: 500 }}>Reviews</a>
          <a href="#contact" style={{ padding: '8px 14px', fontSize: 14, color: '#4b5563', fontWeight: 500 }}>Contact</a>
          {user ? (
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/${user.role}-dashboard`)}>
              Dashboard <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Sign in</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>Get started</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 50%, #f0fdf4 100%)',
        padding: '80px 5% 100px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -40, width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />
        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ccfbf1',
            color: '#0f766e', padding: '6px 16px', borderRadius: 20, fontSize: 13,
            fontWeight: 600, marginBottom: 24
          }}>
            <Heart size={14} fill="currentColor" /> Trusted In-Home Care Since 2024
          </div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,62px)', fontFamily: 'DM Serif Display,serif', color: '#111827', marginBottom: 20, lineHeight: 1.15 }}>
            Trusted In-Home Care<br />
            <span style={{ color: '#0d9488' }}>for Your Loved Ones</span>
          </h1>
          <p style={{ fontSize: 18, color: '#4b5563', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.75 }}>
            Professional, compassionate caregivers dedicated to your family. Elder care, maternity support, and childcare — all at home.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate(user ? '/book' : '/signup')}>
              Book a Caregiver <ArrowRight size={18} />
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>
              <Phone size={18} /> Contact Us
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 52, flexWrap: 'wrap' }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0f766e', fontFamily: 'DM Serif Display,serif' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" style={{ padding: '80px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ color: '#0d9488', fontWeight: 600, fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Our Services</p>
            <h2 style={{ fontSize: 38, fontFamily: 'DM Serif Display,serif', color: '#111827' }}>Care for Every Need</h2>
            <p style={{ color: '#6b7280', fontSize: 16, marginTop: 12, maxWidth: 480, margin: '12px auto 0' }}>Specialised in-home care tailored for every stage of life</p>
          </div>
          <div className="grid-3">
            {services.map(s => (
              <div key={s.title} className="card card-hover" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>
                  {s.icon}
                </div>
                <h3 style={{ fontSize: 22, fontFamily: 'DM Serif Display,serif', marginBottom: 10, color: '#111827' }}>{s.title}</h3>
                <p style={{ color: '#6b7280', fontSize: 14, lineHeight: 1.7 }}>{s.desc}</p>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 20, color: s.accent }} onClick={() => navigate(user ? '/book' : '/signup')}>
                  Book now <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 5%', background: '#f0fdfa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ color: '#0d9488', fontWeight: 600, fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Why Prana</p>
            <h2 style={{ fontSize: 38, fontFamily: 'DM Serif Display,serif', color: '#111827' }}>Why Families Choose Us</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} className="card" style={{ padding: 24, display: 'flex', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <f.icon size={20} color="#0f766e" />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontFamily: 'Plus Jakarta Sans,sans-serif', fontWeight: 700, marginBottom: 6, color: '#111827' }}>{f.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ color: '#0d9488', fontWeight: 600, fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Process</p>
            <h2 style={{ fontSize: 38, fontFamily: 'DM Serif Display,serif', color: '#111827' }}>How It Works</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24 }}>
            {[
              { step: 1, title: 'Sign Up', desc: 'Create your account and tell us about your care needs.' },
              { step: 2, title: 'Book a Caregiver', desc: 'Fill our detailed form to specify care type, schedule, and requirements.' },
              { step: 3, title: 'Get Matched', desc: 'We assign the best-fit verified caregiver within 24 hours.' },
              { step: 4, title: 'Care Begins', desc: 'Your dedicated caregiver arrives and provides consistent, compassionate care.' },
            ].map(s => (
              <div key={s.step} style={{ textAlign: 'center', padding: 24 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: '#0d9488', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 700, margin: '0 auto 16px', fontFamily: 'DM Serif Display,serif'
                }}>{s.step}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: '#111827' }}>{s.title}</h3>
                <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ padding: '80px 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ color: '#0d9488', fontWeight: 600, fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Reviews</p>
            <h2 style={{ fontSize: 38, fontFamily: 'DM Serif Display,serif', color: '#111827' }}>What Families Say</h2>
          </div>
          <div className="grid-3">
            {testimonials.map(t => (
              <div key={t.name} className="card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                  {Array(t.rating).fill(0).map((_, i) => (
                    <Star key={i} size={16} color="#f59e0b" fill="#f59e0b" />
                  ))}
                </div>
                <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: '#ccfbf1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, color: '#0f766e'
                  }}>{t.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '80px 5%', background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 40, fontFamily: 'DM Serif Display,serif', color: 'white', marginBottom: 16 }}>
            Give Your Loved Ones the Care They Deserve
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 17, marginBottom: 32, lineHeight: 1.7 }}>
            Join 500+ families who trust Prana Solutions for reliable, compassionate in-home care.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-lg" style={{ background: 'white', color: '#0f766e', fontWeight: 700 }} onClick={() => navigate(user ? '/book' : '/signup')}>
              Book a Caregiver <ArrowRight size={18} />
            </button>
            <button className="btn btn-lg" style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.6)' }} onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>
              <Phone size={18} /> Call Us Now
            </button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" style={{ padding: '80px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ color: '#0d9488', fontWeight: 600, fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contact</p>
            <h2 style={{ fontSize: 38, fontFamily: 'DM Serif Display,serif', color: '#111827' }}>Get in Touch</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#111827' }}>Contact Information</h3>
              {[
                { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
                { icon: Mail, label: 'Email', value: 'care@pranasolutions.in' },
                { icon: Home, label: 'Address', value: 'RGUKT, RK Valley, Kadapa, AP' },
              ].map(c => (
                <div key={c.label} style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <c.icon size={18} color="#0d9488" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
                    <div style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{c.value}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 24, padding: 20, background: '#f0fdfa', borderRadius: 14, border: '1px solid #99f6e4' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} color="#f59e0b" fill="#f59e0b" />)}
                </div>
                <p style={{ fontSize: 13, color: '#374151', fontStyle: 'italic' }}>"The best home care service in Andhra Pradesh."</p>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>— Wadhwani Foundation Review</p>
              </div>
            </div>
            <div className="card" style={{ padding: 32 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: '#111827' }}>Send a Message</h3>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input className="form-input" placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-textarea" placeholder="Tell us how we can help..." />
              </div>
              <button className="btn btn-primary w-full">Send Message <ArrowRight size={16} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#111827', padding: '40px 5%', color: '#9ca3af' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'DM Serif Display,serif', fontSize: 20, color: '#0d9488', marginBottom: 4 }}>Prana <span style={{ color: '#fff' }}>Solutions</span></div>
            <p style={{ fontSize: 13 }}>Trusted in-home care for elders, mothers & children.</p>
          </div>
          <div style={{ fontSize: 13 }}>
            <p>© 2025 Prana Solutions. All rights reserved.</p>
            <p style={{ marginTop: 4 }}>RGUKT RK Valley, Kadapa, AP | Wadhwani Foundation</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
