import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import SessionCard from '../components/SessionCard';
import { getSessions, joinSession, leaveSession, getSubjects } from '../api/sessions';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('all');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search.trim()) params.search = search.trim();
      if (subject !== 'all') params.subject = subject;
      if (type !== 'all') params.type = type;
      const res = await getSessions(params);
      setSessions(res.data.sessions);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch {
      toast.error('Cannot connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, [search, subject, type, page]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  useEffect(() => { getSubjects().then(r => setSubjects(r.data.subjects)).catch(() => {}); }, []);

  const handleJoin = async (id) => {
    if (!user) { toast.error('Please sign in to join a session'); return; }
    setJoining(id);
    try {
      const res = await joinSession(id);
      setSessions(prev => prev.map(s => s._id === id ? res.data.session : s));
      toast.success('Joined session successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to join'); }
    finally { setJoining(null); }
  };

  const handleLeave = async (id) => {
    setJoining(id);
    try {
      await leaveSession(id);
      fetchSessions();
      toast.success('Left the session');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to leave'); }
    finally { setJoining(null); }
  };

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleSubject = (e) => { setSubject(e.target.value); setPage(1); };
  const handleType = (e) => { setType(e.target.value); setPage(1); };

  return (
    <div>
      {/* Header bar */}
      <div style={S.header}>
        <div className="container">
          <div style={S.headerInner}>
            <div>
              <h1 style={S.title}>Browse Study Sessions</h1>
              <p style={S.subtitle}>Find and join study groups that match your subjects</p>
            </div>
            {user && (
              <Link to="/sessions/create">
                <button className="btn btn-primary btn-lg">+ Create Session</button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '24px' }}>
        {/* Filters */}
        <div style={S.filters}>
          <input
            className="form-input"
            placeholder="Search by title, subject, or description..."
            value={search}
            onChange={handleSearch}
            style={{ flex: 1, maxWidth: 380 }}
          />
          <select className="form-input" value={subject} onChange={handleSubject} style={{ width: 180 }}>
            <option value="all">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-input" value={type} onChange={handleType} style={{ width: 150 }}>
            <option value="all">All Types</option>
            <option value="online">Online</option>
            <option value="offline">Offline (In-Person)</option>
          </select>
          <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setSubject('all'); setType('all'); setPage(1); }}>
            Clear
          </button>
        </div>

        {/* Stats */}
        {!loading && (
          <div style={S.stats}>
            <span>{total} session{total !== 1 ? 's' : ''} found</span>
            {(search || subject !== 'all' || type !== 'all') && (
              <span style={{ color: 'var(--primary)', marginLeft: 8 }}>· Filtered results</span>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="page-loader">
            <div className="spinner spinner-dark" style={{ width: 24, height: 24 }} />
            <span>Loading sessions...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📚</div>
            <h3>No sessions found</h3>
            <p>{search || subject !== 'all' || type !== 'all' ? 'Try changing your filters' : 'Be the first to create a study session!'}</p>
            {user && <Link to="/sessions/create"><button className="btn btn-primary">Create a Session</button></Link>}
            {!user && <Link to="/register"><button className="btn btn-primary">Register to Create</button></Link>}
          </div>
        ) : (
          <div style={S.grid}>
            {sessions.map(s => (
              <SessionCard key={s._id} session={s} onJoin={handleJoin} onLeave={handleLeave} joining={joining} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={S.pagination}>
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Previous</button>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
            <button className="btn btn-outline btn-sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
};

const S = {
  header: { background: 'white', borderBottom: '1px solid var(--border)', padding: '20px 0' },
  headerInner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 22, fontWeight: 700, color: 'var(--text)' },
  subtitle: { fontSize: 13, color: 'var(--text-muted)', marginTop: 3 },
  filters: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', background: 'white', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 16 },
  stats: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 32 },
};

export default Home;
