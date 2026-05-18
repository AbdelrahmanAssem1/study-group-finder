import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createSession, getSession, updateSession } from '../api/sessions';

const SUBJECTS = [
  'Mathematics','Physics','Chemistry','Biology','Computer Science',
  'Software Engineering','Data Science','Artificial Intelligence',
  'Web Development','Networking','Databases','Algorithms',
  'Economics','Statistics','English Literature','History',
  'Engineering','Medicine','Psychology','Philosophy','Other',
];

const SessionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '', subject: '', description: '', date: '',
    sessionType: 'online', location: '', meetingLink: '', maxParticipants: 20,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getSession(id).then(res => {
      const s = res.data.session;
      setForm({
        title: s.title, subject: s.subject, description: s.description,
        date: new Date(s.date).toISOString().slice(0, 16),
        sessionType: s.sessionType, location: s.location || '',
        meetingLink: s.meetingLink || '', maxParticipants: s.maxParticipants,
      });
    }).catch(() => { toast.error('Session not found'); navigate('/'); })
      .finally(() => setFetching(false));
  }, [id, isEdit, navigate]);

  // ── THIS IS THE FIX: handle ALL inputs including select ──────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.subject) { setError('Please select a subject'); return; }
    if (!form.description.trim()) { setError('Description is required'); return; }
    if (!form.date) { setError('Date and time is required'); return; }
    if (new Date(form.date) <= new Date()) { setError('Session date must be in the future'); return; }

    setLoading(true);
    try {
      if (isEdit) {
        await updateSession(id, form);
        toast.success('Session updated!');
        navigate(`/sessions/${id}`);
      } else {
        const res = await createSession(form);
        toast.success('Session created successfully!');
        navigate(`/sessions/${res.data.session._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="page-loader">
      <div className="spinner spinner-dark" style={{ width: 24, height: 24 }} />
      <span>Loading...</span>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.container}>
        {/* Back */}
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          ← Back
        </button>

        <div className="card">
          <h2 style={S.title}>{isEdit ? 'Edit Study Session' : 'Create New Study Session'}</h2>
          <p style={S.sub}>Fill in the details below to {isEdit ? 'update your' : 'create a new'} session</p>

          <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />

          {error && <div style={S.error}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} style={S.form}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Session Title *</label>
              <input className="form-input" name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. Calculus Chapter 5 Review" maxLength={100} required />
              <span className="form-hint">{form.title.length}/100 characters</span>
            </div>

            {/* Subject */}
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <select className="form-input" name="subject" value={form.subject} onChange={handleChange} required>
                <option value="">-- Select a subject --</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-input" name="description" value={form.description} onChange={handleChange}
                placeholder="What topics will you cover? What should participants bring or prepare?" maxLength={500} required />
              <span className="form-hint">{form.description.length}/500 characters</span>
            </div>

            {/* Date + Type row */}
            <div style={S.row}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Date & Time *</label>
                <input className="form-input" type="datetime-local" name="date" value={form.date}
                  onChange={handleChange} min={new Date().toISOString().slice(0, 16)} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Session Type *</label>
                <select className="form-input" name="sessionType" value={form.sessionType} onChange={handleChange}>
                  <option value="online">🌐 Online (Virtual)</option>
                  <option value="offline">📍 Offline (In-Person)</option>
                </select>
              </div>
            </div>

            {/* Conditional field — THIS IS THE FIX */}
            {form.sessionType === 'online' ? (
              <div className="form-group">
                <label className="form-label">Meeting Link <span>(optional)</span></label>
                <input className="form-input" name="meetingLink" value={form.meetingLink} onChange={handleChange}
                  placeholder="https://zoom.us/j/... or Google Meet link" type="url" />
                <span className="form-hint">You can add this later if you don't have it yet</span>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Location / Venue <span>(optional)</span></label>
                <input className="form-input" name="location" value={form.location} onChange={handleChange}
                  placeholder="e.g. Library Room 204, Building A, Floor 2" />
                <span className="form-hint">Be specific so participants can find the place</span>
              </div>
            )}

            {/* Max participants */}
            <div className="form-group">
              <label className="form-label">Maximum Participants: <strong>{form.maxParticipants}</strong></label>
              <input type="range" name="maxParticipants" min={2} max={50} value={form.maxParticipants}
                onChange={handleChange} style={S.slider} />
              <div style={S.sliderLabels}><span>2 (min)</span><span>50 (max)</span></div>
            </div>

            {/* Buttons */}
            <div style={S.btns}>
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-lg" style={{ minWidth: 160, justifyContent: 'center' }} disabled={loading}>
                {loading ? <><span className="spinner" /> Saving...</> : isEdit ? 'Save Changes' : 'Create Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const S = {
  page: { background: 'var(--bg)', minHeight: 'calc(100vh - 56px)', padding: '24px' },
  container: { maxWidth: 680, margin: '0 auto' },
  title: { fontSize: 20, fontWeight: 700 },
  sub: { fontSize: 13, color: 'var(--text-muted)', marginTop: 4 },
  error: { background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #fecaca', borderRadius: 6, padding: '10px 12px', fontSize: 13, marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  slider: { width: '100%', accentColor: 'var(--primary)', cursor: 'pointer', height: 4 },
  sliderLabels: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-light)', marginTop: 2 },
  btns: { display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 4 },
};

export default SessionForm;
