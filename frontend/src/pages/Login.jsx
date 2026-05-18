import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
        <h2 style={S.title}>Sign in to your account</h2>
        <p style={S.sub}>Enter your credentials to continue</p>

        {error && <div style={S.error}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={S.form}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Enter your password"
              value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p style={S.foot}>Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500 }}>Register here</Link></p>
      </div>
    </div>
  );
};

const S = {
  page: { minHeight: 'calc(100vh - 56px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg)' },
  box: { width: '100%', maxWidth: 420 },
  brand: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 },
  brandIcon: { width: 36, height: 36, background: 'var(--primary)', color: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 },
  brandName: { fontSize: 16, fontWeight: 700 },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  sub: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 },
  error: { background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #fecaca', borderRadius: 6, padding: '10px 12px', fontSize: 13, marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  foot: { textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 },
};

export default Login;
