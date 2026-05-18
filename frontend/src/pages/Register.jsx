import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', major: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', form);
      login(res.data.user, res.data.token);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.box} className="card">
        <div style={S.brand}>
          <div style={S.brandIcon}>SG</div>
          <span style={S.brandName}>StudyGroup</span>
        </div>
        <h2 style={S.title}>Create your account</h2>
        <p style={S.sub}>Join the platform and start studying together</p>

        {error && <div style={S.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={S.form}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" type="text" placeholder="e.g. Ahmed Mohamed"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required minLength={2} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Major / Field of Study <span>(optional)</span></label>
            <input className="form-input" type="text" placeholder="e.g. Computer Engineering"
              value={form.major} onChange={e => setForm(p => ({ ...p, major: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Minimum 6 characters"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p style={S.foot}>Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sign in</Link></p>
      </div>
    </div>
  );
};

const S = {
  page: { minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' },
  box: { width: '100%', maxWidth: 440 },
  brand: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 },
  brandIcon: { width: 36, height: 36, background: 'var(--primary)', color: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 },
  brandName: { fontSize: 16, fontWeight: 700 },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  sub: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 },
  error: { background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #fecaca', borderRadius: 6, padding: '10px 12px', fontSize: 13, marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  foot: { textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 },
};

export default Register;
