import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const SessionCard = ({ session, onJoin, onLeave, joining }) => {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const isParticipant = user && session.participants?.some(p => (p._id || p) === userId);
  const isCreator = user && session.creator?._id === userId;
  const isFull = session.participants?.length >= session.maxParticipants;
  const spotsLeft = session.maxParticipants - (session.participants?.length || 0);
  const isPast = new Date(session.date) < new Date();

  return (
    <div className="card fade-in" style={S.card}>
      {/* Top: type badge + subject */}
      <div style={S.top}>
        <span className={`badge badge-${session.sessionType}`}>
          {session.sessionType === 'online' ? '🌐 Online' : '📍 In-Person'}
        </span>
        <span style={S.subject}>{session.subject}</span>
      </div>

      {/* Title */}
      <Link to={`/sessions/${session._id}`}>
        <h3 style={S.title}>{session.title}</h3>
      </Link>

      {/* Description */}
      <p style={S.desc}>{session.description}</p>

      {/* Info rows */}
      <div style={S.info}>
        <div style={S.infoRow}>
          <span style={S.infoIcon}>📅</span>
          <span>{format(new Date(session.date), 'MMM d, yyyy')} at {format(new Date(session.date), 'h:mm a')}</span>
        </div>
        <div style={S.infoRow}>
          <span style={S.infoIcon}>👤</span>
          <span>Created by <strong>{session.creator?.name}</strong></span>
        </div>
        {session.sessionType === 'offline' && session.location && (
          <div style={S.infoRow}>
            <span style={S.infoIcon}>📍</span>
            <span>{session.location}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={S.footer}>
        {/* Participants count */}
        <div style={S.spots}>
          <div style={S.spotsBar}>
            <div style={{ ...S.spotsBarFill, width: `${Math.min(100, (session.participants?.length / session.maxParticipants) * 100)}%`, background: isFull ? 'var(--danger)' : 'var(--primary)' }} />
          </div>
          <span style={{ fontSize: 12, color: isFull ? 'var(--danger)' : 'var(--text-muted)' }}>
            {session.participants?.length}/{session.maxParticipants} {!isFull && `(${spotsLeft} left)`}
          </span>
        </div>

        {/* Action buttons */}
        <div style={S.actions}>
          <Link to={`/sessions/${session._id}`}>
            <button className="btn btn-ghost btn-sm">View</button>
          </Link>
          {user && !isPast && (
            isCreator ? (
              <Link to={`/sessions/${session._id}/edit`}>
                <button className="btn btn-outline btn-sm">Edit</button>
              </Link>
            ) : isParticipant ? (
              <button className="btn btn-danger btn-sm" onClick={() => onLeave(session._id)} disabled={joining === session._id}>
                {joining === session._id ? <span className="spinner" /> : 'Leave'}
              </button>
            ) : (
              <button className="btn btn-success btn-sm" onClick={() => onJoin(session._id)} disabled={isFull || joining === session._id}>
                {joining === session._id ? <span className="spinner" /> : isFull ? 'Full' : 'Join'}
              </button>
            )
          )}
        </div>
      </div>

      {/* Creator badge */}
      {isCreator && <div style={S.creatorBadge}>Your session</div>}
      {isParticipant && !isCreator && <div style={{ ...S.creatorBadge, background: 'var(--success-light)', color: 'var(--success)', borderColor: '#bbf7d0' }}>Joined</div>}
    </div>
  );
};

const S = {
  card: { display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', transition: 'box-shadow 0.2s', cursor: 'default' },
  top: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  subject: { fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 20, border: '1px solid var(--border)' },
  title: { fontSize: 15, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, marginTop: 2 },
  desc: { fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  info: { display: 'flex', flexDirection: 'column', gap: 5, borderTop: '1px solid var(--border)', paddingTop: 10 },
  infoRow: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)' },
  infoIcon: { fontSize: 13, width: 18, flexShrink: 0 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 },
  spots: { display: 'flex', flexDirection: 'column', gap: 4 },
  spotsBar: { width: 80, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' },
  spotsBarFill: { height: '100%', borderRadius: 2, transition: 'width 0.3s' },
  actions: { display: 'flex', gap: 6 },
  creatorBadge: { position: 'absolute', top: 12, right: 12, fontSize: 11, background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary-border)', padding: '2px 8px', borderRadius: 20, fontWeight: 500 },
};

export default SessionCard;
