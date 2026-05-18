import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const active = (path) => location.pathname === path;

  return (
    <nav style={S.nav}>
      <div className="container" style={S.inner}>
        {/* Logo */}
        <Link to="/" style={S.logo}>
          <div style={S.logoIcon}>SG</div>
          <span style={S.logoText}>StudyGroup</span>
        </Link>

        {/* Nav links */}
        <div style={S.links}>
          <Link to="/" style={{ ...S.link, ...(active('/') ? S.linkActive : {}) }}>Browse Sessions</Link>
          {user && <Link to="/dashboard" style={{ ...S.link, ...(active('/dashboard') ? S.linkActive : {}) }}>My Dashboard</Link>}
        </div>

        {/* Right side */}
        <div style={S.right}>
          {user ? (
            <>
              <Link to="/sessions/create">
                <button className="btn btn-primary btn-sm">+ New Session</button>
              </Link>
              <div ref={dropRef} style={S.userMenu}>
                <button style={S.userBtn} onClick={() => setOpen(!open)}>
                  <div style={S.avatar}>{user.name.charAt(0).toUpperCase()}</div>
                  <span style={S.userName}>{user.name.split(' ')[0]}</span>
                  <span style={{ color: 'var(--text-light)', fontSize: 10 }}>▼</span>
                </button>
                {open && (
                  <div style={S.dropdown}>
                    <div style={S.dropInfo}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{user.email}</div>
                      {user.major && <div style={{ color: 'var(--primary)', fontSize: 11, marginTop: 3 }}>{user.major}</div>}
                    </div>
                    <div style={S.dropDivider} />
                    <Link to="/dashboard" onClick={() => setOpen(false)}>
                      <button style={S.dropItem}>📋 My Dashboard</button>
                    </Link>
                    <Link to="/sessions/create" onClick={() => setOpen(false)}>
                      <button style={S.dropItem}>➕ Create Session</button>
                    </Link>
                    <div style={S.dropDivider} />
                    <button style={{ ...S.dropItem, color: 'var(--danger)' }} onClick={() => { logout(); navigate('/login'); setOpen(false); }}>
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login"><button className="btn btn-ghost btn-sm">Sign In</button></Link>
              <Link to="/register"><button className="btn btn-primary btn-sm">Register</button></Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const S = {
  nav: { background: 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-sm)' },
  inner: { display: 'flex', alignItems: 'center', height: 56, gap: 24 },
  logo: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  logoIcon: { width: 32, height: 32, background: 'var(--primary)', color: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 },
  logoText: { fontSize: 15, fontWeight: 700, color: 'var(--text)' },
  links: { display: 'flex', gap: 2, flex: 1 },
  link: { padding: '5px 12px', borderRadius: 6, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, transition: 'all 0.15s' },
  linkActive: { background: 'var(--primary-light)', color: 'var(--primary)' },
  right: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  userMenu: { position: 'relative' },
  userBtn: { display: 'flex', alignItems: 'center', gap: 7, background: 'var(--bg)', border: '1px solid var(--border)', padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  avatar: { width: 24, height: 24, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 },
  userName: { fontWeight: 500, fontSize: 13, color: 'var(--text)' },
  dropdown: { position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: 'white', border: '1px solid var(--border)', borderRadius: 10, width: 220, boxShadow: 'var(--shadow-md)', overflow: 'hidden', zIndex: 200 },
  dropInfo: { padding: '12px 14px' },
  dropDivider: { height: 1, background: 'var(--border)' },
  dropItem: { width: '100%', padding: '9px 14px', background: 'none', border: 'none', textAlign: 'left', fontSize: 13, cursor: 'pointer', color: 'var(--text)', display: 'block' },
};

export default Navbar;
