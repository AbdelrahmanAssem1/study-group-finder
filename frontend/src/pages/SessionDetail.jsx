import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getSession, joinSession, leaveSession, deleteSession } from '../api/sessions';
import { useAuth } from '../context/AuthContext';

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const load = async () => {
    try {
      const res = await getSession(id);
      setSession(res.data.session);
    } catch { toast.error('Session not found'); navigate('/'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="page-loader"><div className="spinner spinner-dark" style={{ width: 24, height: 24 }} /><span>Loading...</span></div>;
  if (!session) return null;

  const userId = user?.id || user?._id;
  const isCreator = user && session.creator?._id === userId;
  const isParticipant = user && session.participants?.some(p => (p._id || p) === userId);
  const isFull = session.participants?.length >= session.maxParticipants;
  const isPast = new Date(session.date) < new Date();

  const handleJoin = async () => {
    setActionLoading('join');
    try {
      const res = await joinSession(id);
      setSession(res.data.session);
      toast.success('You joined the session!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to join'); }
    finally { setActionLoading(null); }
  };

  const handleLeave = async () => {
    setActionLoading('leave');
    try {
      await leaveSession(id);
      await load();
      toast.success('You left the session');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to leave'); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this session? This cannot be undone.')) return;
    try {
      await deleteSession(id);
      toast.success('Session deleted');
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
  };

  return (
    <div style={S.page}>
      <div className="container" style={{ maxWidth: 960, padding: '24px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ marginBottom: 16 }}>← Back to Browse</button>

        <div style={S.layout}>
          {/* Main panel */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="card" style={{ marginBottom: 16 }}>
              {/* Badges */}
              <div style={S.badges}>
                <span className={`badge badge-${session.sessionType}`}>
                  {session.sessionType === 'online' ? '🌐 Online' : '📍 In-Person'}
                </span>
                <span className="badge badge-upcoming">{session.status}</span>
                {isPast && <span style={S.pastBadge}>Past</span>}
              </div>

              <h1 style={S.title}>{session.title}</h1>
              <div style={S.subjectTag}>📖 {session.subject}</div>
              <p style={S.description}>{session.description}</p>

              {/* Details grid */}
              <div style={S.detailGrid}>
                <div style={S.detailItem}>
                  <span style={S.detailLabel}>Date & Time</span>
                  <span style={S.detailValue}>{format(new Date(session.date), 'EEEE, MMMM d, yyyy')}</span>
                  <span style={S.detailSub}>{format(new Date(session.date), 'h:mm a')}</span>
                </div>
                <div style={S.detailItem}>
                  <span style={S.detailLabel}>Created By</span>
                  <span style={S.detailValue}>{session.creator?.name}</span>
                  {session.creator?.major && <span style={S.detailSub}>{session.creator.major}</span>}
                </div>
                <div style={S.detailItem}>
                  <span style={S.detailLabel}>Capacity</span>
                  <span style={S.detailValue}>{session.participants?.length} / {session.maxParticipants} participants</span>
                  <span style={{ ...S.detailSub, color: isFull ? 'var(--danger)' : 'var(--success)' }}>
                    {isFull ? 'Session is full' : `${session.maxParticipants - session.participants?.length} spots available`}
                  </span>
                </div>
                <div style={S.detailItem}>
                  <span style={S.detailLabel}>{session.sessionType === 'online' ? 'Meeting Link' : 'Location'}</span>
                  {session.sessionType === 'online' ? (
                    session.meetingLink && isParticipant ? (
                      <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: 13 }}>Join Meeting →</a>
                    ) : (
                      <span style={S.detailValue}>{isParticipant ? session.meetingLink || 'Not provided yet' : 'Join to see link'}</span>
                    )
                  ) : (
                    <span style={S.detailValue}>{session.location || 'Not specified'}</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={S.actions}>
                {user ? (
                  isCreator ? (
                    <>
                      <Link to={`/sessions/${id}/edit`}><button className="btn btn-outline">✏️ Edit Session</button></Link>
                      <button className="btn btn-danger" onClick={handleDelete}>🗑️ Delete</button>
                    </>
                  ) : !isPast && (
                    isParticipant ? (
                      <button className="btn btn-danger" onClick={handleLeave} disabled={actionLoading === 'leave'}>
                        {actionLoading === 'leave' ? <><span className="spinner" /> Leaving...</> : '🚪 Leave Session'}
                      </button>
                    ) : (
                      <button className="btn btn-primary btn-lg" onClick={handleJoin} disabled={isFull || actionLoading === 'join'}>
                        {actionLoading === 'join' ? <><span className="spinner" /> Joining...</> : isFull ? 'Session Full' : '✅ Join Session'}
                      </button>
                    )
                  )
                ) : (
                  <div style={S.loginPrompt}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sign in to join this session</span>
                    <Link to="/login"><button className="btn btn-primary">Sign In</button></Link>
                    <Link to="/register"><button className="btn btn-outline">Register</button></Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={S.sidebar}>
            <div className="card">
              <div style={S.sidebarTitle}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>Participants</span>
                <span style={S.countBadge}>{session.participants?.length}/{session.maxParticipants}</span>
              </div>

              {/* Progress bar */}
              <div style={S.progressBar}>
                <div style={{ ...S.progressFill, width: `${Math.min(100, (session.participants?.length / session.maxParticipants) * 100)}%`, background: isFull ? 'var(--danger)' : 'var(--primary)' }} />
              </div>

              <div style={S.participantList}>
                {session.participants?.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>No participants yet</p>
                ) : session.participants?.map((p, i) => (
                  <div key={i} style={S.participant}>
                    <div style={S.pAvatar}>{(p.name || 'U').charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {p.name}
                        {session.creator?._id === p._id && <span style={S.creatorTag}>host</span>}
                      </div>
                      {p.major && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{p.major}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const S = {
  page: { background: 'var(--bg)', minHeight: 'calc(100vh - 56px)' },
  layout: { display: 'flex', gap: 16, alignItems: 'flex-start' },
  badges: { display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
  pastBadge: { background: '#f1f5f9', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 500 },
  title: { fontSize: 22, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 },
  subjectTag: { display: 'inline-block', background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, marginBottom: 14 },
  description: { fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20 },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'var(--bg)', borderRadius: 8, padding: 16, marginBottom: 20 },
  detailItem: { display: 'flex', flexDirection: 'column', gap: 3 },
  detailLabel: { fontSize: 11, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  detailValue: { fontSize: 13, fontWeight: 500, color: 'var(--text)' },
  detailSub: { fontSize: 12, color: 'var(--text-muted)' },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 16 },
  loginPrompt: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  sidebar: { width: 260, flexShrink: 0 },
  sidebarTitle: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  countBadge: { background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)', padding: '2px 8px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  progressBar: { height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: 14 },
  progressFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s' },
  participantList: { display: 'flex', flexDirection: 'column', gap: 10 },
  participant: { display: 'flex', alignItems: 'center', gap: 9 },
  pAvatar: { width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', border: '1px solid var(--primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: 'var(--primary)', flexShrink: 0 },
  creatorTag: { background: 'var(--warning-light)', color: 'var(--warning)', border: '1px solid #fde68a', padding: '1px 6px', borderRadius: 10, fontSize: 10, fontWeight: 500 },
};

export default SessionDetail;
