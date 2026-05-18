import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getMySessions, leaveSession, deleteSession } from '../api/sessions';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [created, setCreated] = useState([]);
  const [joined, setJoined] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('created');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMySessions();
      setCreated(res.data.created);
      setJoined(res.data.joined);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleLeave = async (id) => {
    if (!window.confirm('Leave this session?')) return;
    try { await leaveSession(id); setJoined(p => p.filter(s => s._id !== id)); toast.success('Left session'); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this session? This cannot be undone.')) return;
    try { await deleteSession(id); setCreated(p => p.filter(s => s._id !== id)); toast.success('Session deleted'); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const sessions = tab === 'created' ? created : joined;

  if (loading) return <div className="page-loader"><div className="spinner spinner-dark" style={{ width: 24, height: 24 }} /><span>Loading dashboard...</span></div>;

  return (
    <div style={S.page}>
      <div className="container" style={{ padding: '24px' }}>
        {/* Profile card */}
        <div className="card" style={S.profile}>
          <div style={S.profileLeft}>
            <div style={S.avatar}>{user?.name.charAt(0).toUpperCase()}</div>
            <div>
              <div style={S.profileName}>{user?.name}</div>
              <div style={S.profileEmail}>{user?.email}</div>
              {user?.major && <div style={S.profileMajor}>{user.major}</div>}
            </div>
          </div>
          <div style={S.stats}>
            <div style={S.stat}>
              <div style={S.statNum}>{created.length}</div>
              <div style={S.statLabel}>Created</div>
            </div>
            <div style={S.statDiv} />
            <div style={S.stat}>
              <div style={S.statNum}>{joined.length}</div>
              <div style={S.statLabel}>Joined</div>
            </div>
            <div style={S.statDiv} />
            <div style={S.stat}>
              <div style={S.statNum}>{created.length + joined.length}</div>
              <div style={S.statLabel}>Total</div>
            </div>
          </div>
        </div>

        {/* Tabs + New button */}
        <div style={S.tabsRow}>
          <div style={S.tabs}>
            <button style={{ ...S.tab, ...(tab === 'created' ? S.tabActive : {}) }} onClick={() => setTab('created')}>
              Created Sessions ({created.length})
            </button>
            <button style={{ ...S.tab, ...(tab === 'joined' ? S.tabActive : {}) }} onClick={() => setTab('joined')}>
              Joined Sessions ({joined.length})
            </button>
          </div>
          <Link to="/sessions/create">
            <button className="btn btn-primary btn-sm">+ New Session</button>
          </Link>
        </div>

        {/* Session list */}
        {sessions.length === 0 ? (
          <div className="empty-state">
            <div className="icon">{tab === 'created' ? '📝' : '🔍'}</div>
            <h3>{tab === 'created' ? 'No sessions created yet' : 'No sessions joined yet'}</h3>
            <p>{tab === 'created' ? 'Create your first session to get started' : 'Browse available sessions and join one'}</p>
            <Link to={tab === 'created' ? '/sessions/create' : '/'}>
              <button className="btn btn-primary">{tab === 'created' ? 'Create Session' : 'Browse Sessions'}</button>
            </Link>
          </div>
        ) : (
          <div style={S.list}>
            {sessions.map(session => {
              const isPast = new Date(session.date) < new Date();
              return (
                <div key={session._id} className="card fade-in" style={S.sessionRow}>
                  <div style={S.sessionLeft}>
                    <div style={S.sessionTop}>
                      <span className={`badge badge-${session.sessionType}`}>
                        {session.sessionType === 'online' ? '🌐 Online' : '📍 In-Person'}
                      </span>
                      <span style={S.subjectTag}>{session.subject}</span>
                      {isPast && <span style={S.pastTag}>Past</span>}
                    </div>
                    <Link to={`/sessions/${session._id}`}>
                      <div style={S.sessionTitle}>{session.title}</div>
                    </Link>
                    <div style={S.sessionMeta}>
                      <span>📅 {format(new Date(session.date), 'MMM d, yyyy')} at {format(new Date(session.date), 'h:mm a')}</span>
                      <span>👥 {session.participants?.length}/{session.maxParticipants} participants</span>
                      {session.sessionType === 'offline' && session.location && <span>📍 {session.location}</span>}
                      {session.sessionType === 'online' && session.meetingLink && <span>🔗 Meeting link set</span>}
                    </div>
                  </div>
                  <div style={S.sessionActions}>
                    <Link to={`/sessions/${session._id}`}>
                      <button className="btn btn-outline btn-sm">View</button>
                    </Link>
                    {tab === 'created' ? (
                      <>
                        <Link to={`/sessions/${session._id}/edit`}>
                          <button className="btn btn-outline btn-sm">Edit</button>
                        </Link>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(session._id)}>Delete</button>
                      </>
                    ) : (
                      !isPast && <button className="btn btn-danger btn-sm" onClick={() => handleLeave(session._id)}>Leave</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const S = {
  page: { background: 'var(--bg)', minHeight: 'calc(100vh - 56px)' },
  profile: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 },
  profileLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 },
  profileName: { fontSize: 17, fontWeight: 700 },
  profileEmail: { fontSize: 13, color: 'var(--text-muted)', marginTop: 2 },
  profileMajor: { display: 'inline-block', background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)', padding: '2px 8px', borderRadius: 20, fontSize: 11, marginTop: 5 },
  stats: { display: 'flex', alignItems: 'center', gap: 20 },
  stat: { textAlign: 'center' },
  statNum: { fontSize: 22, fontWeight: 700, color: 'var(--primary)' },
  statLabel: { fontSize: 11, color: 'var(--text-muted)', marginTop: 2 },
  statDiv: { width: 1, height: 32, background: 'var(--border)' },
  tabsRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 0 },
  tabs: { display: 'flex', gap: 0 },
  tab: { background: 'none', border: 'none', padding: '10px 18px', fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -1, transition: 'all 0.15s' },
  tabActive: { color: 'var(--primary)', borderBottomColor: 'var(--primary)' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  sessionRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  sessionLeft: { flex: 1, minWidth: 0 },
  sessionTop: { display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' },
  sessionTitle: { fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text)' },
  sessionMeta: { display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' },
  sessionActions: { display: 'flex', gap: 6, flexShrink: 0 },
  subjectTag: { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 20, fontSize: 11 },
  pastTag: { background: '#f1f5f9', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 20, fontSize: 11 },
};

export default Dashboard;
