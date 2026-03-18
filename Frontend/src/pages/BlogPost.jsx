import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../firebase/config';
import {
  doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, onSnapshot, updateDoc
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiTag, FiArrowLeft, FiMessageSquare, FiUser, FiMail, FiSend, FiCheck } from 'react-icons/fi';

/* ─── Font + CSS injection ───────────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('bp-styles')) {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  const style = document.createElement('style');
  style.id = 'bp-styles';
  style.textContent = `
    .bp-root { background:#ffffff; min-height:100vh; }
    .bp-header { border-bottom:2px solid black; }
    .bp-header-inner { max-width:780px; margin:0 auto; padding:56px 24px 40px; }
    .bp-back { display:inline-flex; align-items:center; gap:6px; font-family:'Inter',sans-serif; font-size:.8rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:#6b7280; text-decoration:none; margin-bottom:28px; transition:color .2s; }
    .bp-back:hover { color:#1a1a1a; }
    .bp-meta { display:flex; flex-wrap:wrap; align-items:center; gap:12px; margin-bottom:20px; }
    .bp-cat { font-family:'Inter',sans-serif; font-size:.68rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:#f97316; background:#fff7ed; padding:3px 10px; border-radius:2px; border:1px solid rgba(249,115,22,.25); }
    .bp-date { display:inline-flex; align-items:center; gap:5px; font-family:'Inter',sans-serif; font-size:.75rem; color:#9ca3af; }
    .bp-title { font-family:'Playfair Display',Georgia,serif; font-size:clamp(2rem,5vw,3.4rem); font-weight:700; color:#1a1a1a; line-height:1.15; margin:0 0 20px; letter-spacing:-.02em; }
    .bp-excerpt { font-family:'Playfair Display',Georgia,serif; font-style:italic; font-size:1.1rem; color:#6b7280; line-height:1.75; border-left:3px solid #f97316; padding-left:18px; margin:0; }

    .bp-body { max-width:780px; margin:0 auto; padding:0 24px 80px; }
    .bp-hero-img { width:100%; max-height:480px; object-fit:cover; border-radius:0; margin:0 0 48px; display:block; }
    .bp-content { font-family:'Inter',sans-serif; font-size:1.05rem; color:#374151; line-height:1.85; white-space:pre-wrap; }
    .bp-content p { margin:0 0 1.4em; }
    .bp-divider { height:1px; background:#f0f0f0; margin:56px 0; }

    /* Comments */
    .bp-comments-section {}
    .bp-comments-heading { font-family:'Playfair Display',Georgia,serif; font-size:1.8rem; font-weight:700; color:#1a1a1a; margin:0 0 8px; }
    .bp-comments-sub { font-family:'Inter',sans-serif; font-size:.85rem; color:#9ca3af; margin:0 0 36px; }
    .bp-comment-list { list-style:none; padding:0; margin:0 0 48px; display:flex; flex-direction:column; gap:0; }
    .bp-comment { padding:24px 0; border-bottom:1px solid #f0f0f0; }
    .bp-comment:first-child { border-top:1px solid #f0f0f0; }
    .bp-comment-header { display:flex; align-items:flex-start; gap:14px; margin-bottom:12px; }
    .bp-avatar { width:40px; height:40px; border-radius:50%; background:#004B8D; color:white; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700; flex-shrink:0; }
    .bp-comment-meta { flex:1; }
    .bp-comment-author { font-family:'Inter',sans-serif; font-size:.9rem; font-weight:600; color:#1a1a1a; margin:0 0 2px; }
    .bp-comment-date { font-family:'Inter',sans-serif; font-size:.72rem; color:#9ca3af; }
    .bp-comment-text { font-family:'Inter',sans-serif; font-size:.95rem; line-height:1.7; color:#374151; padding-left:54px; }
    .bp-no-comments { font-family:'Playfair Display',Georgia,serif; font-style:italic; color:#9ca3af; font-size:1rem; padding:20px 0 36px; }

    /* Comment form */
    .bp-form-heading { font-family:'Playfair Display',Georgia,serif; font-size:1.5rem; font-weight:700; color:#1a1a1a; margin:0 0 24px; }
    .bp-form { display:flex; flex-direction:column; gap:16px; }
    .bp-form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    @media(max-width:600px){ .bp-form-row { grid-template-columns:1fr; } }
    .bp-field { display:flex; flex-direction:column; gap:6px; }
    .bp-label { font-family:'Inter',sans-serif; font-size:.7rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:#6b7280; }
    .bp-input { padding:10px 13px; border:1.5px solid #e5e7eb; border-radius:6px; font-family:'Inter',sans-serif; font-size:.875rem; outline:none; transition:border-color .2s; box-sizing:border-box; }
    .bp-input:focus { border-color:#004B8D; }
    .bp-textarea { padding:10px 13px; border:1.5px solid #e5e7eb; border-radius:6px; font-family:'Inter',sans-serif; font-size:.875rem; outline:none; transition:border-color .2s; resize:vertical; min-height:120px; box-sizing:border-box; }
    .bp-textarea:focus { border-color:#004B8D; }
    .bp-submit { display:inline-flex; align-items:center; gap:8px; background:#004B8D; color:white; font-family:'Inter',sans-serif; font-size:.85rem; font-weight:600; letter-spacing:.04em; text-transform:uppercase; padding:12px 28px; border:none; border-radius:6px; cursor:pointer; transition:background .2s; align-self:flex-start; }
    .bp-submit:hover:not(:disabled) { background:#003870; }
    .bp-submit:disabled { opacity:.5; cursor:not-allowed; }
    .bp-success-msg { background:#f0fdf4; border:1px solid #86efac; color:#166534; padding:14px 18px; border-radius:8px; font-family:'Inter',sans-serif; font-size:.875rem; display:flex; align-items:center; gap:8px; }
    .bp-error-msg { background:#fef2f2; border:1px solid #fca5a5; color:#991b1b; padding:14px 18px; border-radius:8px; font-family:'Inter',sans-serif; font-size:.875rem; }
    .bp-policy { font-family:'Inter',sans-serif; font-size:.72rem; color:#9ca3af; line-height:1.6; }
    .bp-loading { display:flex; align-items:center; justify-content:center; min-height:50vh; }
    .bp-not-found { max-width:780px; margin:80px auto; padding:0 24px; text-align:center; }
    .bp-not-found h1 { font-family:'Playfair Display',serif; font-size:2.5rem; color:#1a1a1a; margin-bottom:12px; }
    .bp-not-found p { font-family:'Inter',sans-serif; color:#6b7280; margin-bottom:24px; }
  `;
  document.head.appendChild(style);
}

// Robust date normalization to handle Firestore Timestamp objects ({ seconds, nanoseconds }),
// legacy {_seconds,_nanoseconds}, numeric epochs, ISO strings, Date instances, and objects
// returned from backend endpoints.
const toDateObject = (val) => {
  if (!val) return null;
  // Firestore Timestamp instance
  if (typeof val === 'object' && typeof val.toDate === 'function') return val.toDate();
  // Serialized Firestore timestamp { seconds, nanoseconds }
  if (val && (val.seconds != null || val._seconds != null)) {
    const seconds = Number(val.seconds ?? val._seconds);
    const nanoseconds = Number(val.nanoseconds ?? val._nanoseconds ?? 0);
    if (!Number.isFinite(seconds)) return null;
    return new Date(seconds * 1000 + Math.floor(nanoseconds / 1e6));
  }
  // Numeric epoch (seconds or milliseconds) — try to infer
  if (typeof val === 'number') {
    // if it's in seconds (reasonable range), convert to ms
    if (val < 1e12) return new Date(val * 1000);
    return new Date(val);
  }
  // String (ISO) or Date-like
  try {
    const d = new Date(val);
    if (!Number.isNaN(d.getTime())) return d;
  } catch (e) {
    // fallthrough
  }
  return null;
};

const formatDate = (dateVal) => {
  const d = toDateObject(dateVal);
  if (!d) return '';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatCommentDate = (ts) => {
  const d = toDateObject(ts);
  if (!d) return '';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snapshotComments, setSnapshotComments] = useState([]);
  const [localPendingComments, setLocalPendingComments] = useState([]);
  const [approvalToast, setApprovalToast] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const { isAdmin } = useAuth() || {};
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Combined comments (approved from snapshot + local pending ones)
  const comments = [
    ...snapshotComments,
    ...localPendingComments
  ];

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'success' | 'error'
  const [submitMessage, setSubmitMessage] = useState('');

  // Fetch blog by slug or doc id
  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        // Try by slug field first
        const q = query(
          collection(db, 'blogs'),
          where('slug', '==', slug),
          where('published', '==', true)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setBlog({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          // Fallback: try by document ID
          const docSnap = await getDoc(doc(db, 'blogs', slug));
          if (docSnap.exists() && docSnap.data().published) {
            setBlog({ id: docSnap.id, ...docSnap.data() });
          } else {
            setBlog(null);
          }
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBlog();
  }, [slug]);

  // Real-time listener for approved comments
  useEffect(() => {
    if (!blog?.id) return;
    setCommentsLoading(true);
    const q = query(
      collection(db, 'blog_comments'),
      where('blogId', '==', blog.id),
      where('approved', '==', true),
      orderBy('createdAt', 'asc')
    );
    let unsubCalled = false;
    try {
      const unsub = onSnapshot(q, (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setSnapshotComments(data);
        // Remove any local pending comments that match newly approved ones and notify user
        try {
          setLocalPendingComments((prev) => {
            const removed = prev.filter((p) => data.some((s) => (s.comment || '').trim() === (p.comment || '').trim() && (s.name || '').trim() === (p.name || '').trim()));
            const remaining = prev.filter((p) => !data.some((s) => (s.comment || '').trim() === (p.comment || '').trim() && (s.name || '').trim() === (p.name || '').trim()));
            if (removed.length > 0) setApprovalToast('Your comment was approved and is now visible.');
            return remaining;
          });
        } catch (e) {
          // swallow
        }
        setCommentsLoading(false);
      }, async (err) => {
        console.error('Comments realtime error:', err);
        // If permission denied, fallback to backend admin endpoint
        try {
          const resp = await fetch((window && window.__BACKEND_NOTIFY_URL_BASE) ? `${window.__BACKEND_NOTIFY_URL_BASE.replace(/\/$/, '')}/api/comments?blogId=${blog.id}` : `http://localhost:5000/api/comments?blogId=${blog.id}`);
          if (resp.ok) {
            const json = await resp.json();
            if (json && json.comments) {
              setSnapshotComments(json.comments);
              setLocalPendingComments((prev) => {
                const removed = prev.filter((p) => json.comments.some((s) => (s.comment || '').trim() === (p.comment || '').trim() && (s.name || '').trim() === (p.name || '').trim()));
                const remaining = prev.filter((p) => !json.comments.some((s) => (s.comment || '').trim() === (p.comment || '').trim() && (s.name || '').trim() === (p.name || '').trim()));
                if (removed.length > 0) setApprovalToast('Your comment was approved and is now visible.');
                return remaining;
              });
            }
          } else {
            console.warn('Backend comments fetch returned non-OK', resp.status);
          }
        } catch (fetchErr) {
          console.warn('Backend comments fetch failed', fetchErr);
        }
        setCommentsLoading(false);
      });
      // ensure we unsubscribe on cleanup
      return () => {
        if (!unsubCalled) {
          unsubCalled = true;
          unsub();
        }
      };
    } catch (e) {
      console.error('Realtime listener setup failed, falling back to backend:', e);
      // fallback: fetch via backend admin endpoint
      (async () => {
        try {
          const resp = await fetch((window && window.__BACKEND_NOTIFY_URL_BASE) ? `${window.__BACKEND_NOTIFY_URL_BASE.replace(/\/$/, '')}/api/comments?blogId=${blog.id}` : `http://localhost:5000/api/comments?blogId=${blog.id}`);
            if (resp.ok) {
            const json = await resp.json();
            if (json && json.comments) {
              setSnapshotComments(json.comments);
              setLocalPendingComments((prev) => {
                const removed = prev.filter((p) => json.comments.some((s) => (s.comment || '').trim() === (p.comment || '').trim() && (s.name || '').trim() === (p.name || '').trim()));
                const remaining = prev.filter((p) => !json.comments.some((s) => (s.comment || '').trim() === (p.comment || '').trim() && (s.name || '').trim() === (p.name || '').trim()));
                if (removed.length > 0) setApprovalToast('Your comment was approved and is now visible.');
                return remaining;
              });
            }
          }
        } catch (err) {
          console.error('Backend comments fetch error:', err);
        } finally {
          setCommentsLoading(false);
        }
      })();
      return () => {};
    }
  }, [blog?.id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    // Basic sanitization
    const safeName = name.trim().slice(0, 100);
    const safeEmail = email.trim().slice(0, 200);
    const safeComment = comment.trim().slice(0, 2000);

    setSubmitting(true);
    setSubmitStatus(null);
    try {
      await addDoc(collection(db, 'blog_comments'), {
        blogId: blog.id,
        blogSlug: blog.slug || blog.id,
        name: safeName,
        email: safeEmail,
        comment: safeComment,
        approved: false, // admin must approve
        createdAt: serverTimestamp(),
      });
      // Show the comment locally as pending so the user sees it isn't lost
      try {
        const pendingComment = {
          id: `pending-${Date.now()}`,
          name: safeName,
          email: safeEmail,
          comment: safeComment,
          createdAt: new Date().toISOString(),
          pending: true
        };
        setLocalPendingComments((s) => [...s, pendingComment]);
        // Start a short-lived poll to check if admin approves quickly
        (function pollApproval(attemptsLeft = 6) {
          if (attemptsLeft <= 0) return;
          setTimeout(async () => {
            try {
              const resp = await fetch((window && window.__BACKEND_NOTIFY_URL_BASE) ? `${window.__BACKEND_NOTIFY_URL_BASE.replace(/\/$/, '')}/api/comments?blogId=${blog.id}` : `http://localhost:5000/api/comments?blogId=${blog.id}`);
              if (resp.ok) {
                const json = await resp.json();
                const approved = (json && json.comments) ? json.comments.find(c => (c.comment||'').trim() === safeComment && (c.name||'').trim() === safeName) : null;
                if (approved) {
                  // approved by admin — remove local pending and notify
                  setLocalPendingComments((prev) => {
                    const remaining = prev.filter((p) => !(p.comment === safeComment && p.name === safeName));
                    const removed = prev.length - remaining.length;
                    if (removed > 0) setApprovalToast('Your comment was approved and is now visible.');
                    return remaining;
                  });
                  return;
                }
              }
            } catch (err) {
              // ignore
            }
            pollApproval(attemptsLeft - 1);
          }, 3000);
        })();
      } catch (e) {
        console.warn('Failed to append pending comment locally', e);
      }

      // Attempt to notify admin via backend (non-blocking)
      (async () => {
        try {
          const notifyUrl = (window && window.__BACKEND_NOTIFY_URL) || 'http://localhost:5000/api/notify/comment';
          await fetch(notifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: safeName,
              email: safeEmail,
              comment: safeComment,
              blogTitle: blog.title,
              blogId: blog.id,
              blogSlug: blog.slug || blog.id
            })
          });
        } catch (notifyErr) {
          console.warn('Notification failed:', notifyErr);
        }
      })();
      setSubmitStatus('success');
      setSubmitMessage('Your comment has been submitted and is awaiting moderation. Thank you!');
      setName('');
      setEmail('');
      setComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      setSubmitStatus('error');
      setSubmitMessage('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-hide approval toast
  useEffect(() => {
    if (!approvalToast) return;
    const t = setTimeout(() => setApprovalToast(null), 4000);
    return () => clearTimeout(t);
  }, [approvalToast]);

  if (loading) {
    return (
      <div className="bp-loading">
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #e5e7eb', borderTopColor: '#004B8D', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#9ca3af', fontSize: '0.875rem' }}>Loading article…</p>
        </div>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="bp-not-found">
        <h1>Article not found</h1>
        <p>This article may have been removed or the link may be incorrect.</p>
        <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#004B8D', color: 'white', padding: '10px 22px', borderRadius: 6, textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.875rem' }}>
          <FiArrowLeft size={14} /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bp-root">
      {/* ── Header ── */}
      <div className="bp-header">
        <div className="bp-header-inner">
          <Link to="/blog" className="bp-back"><FiArrowLeft size={13} /> Back to Blog</Link>
          <div className="bp-meta">
            {blog.category && <span className="bp-cat"><FiTag size={11} style={{ display: 'inline', marginRight: 4 }} />{blog.category}</span>}
            {blog.date && <span className="bp-date"><FiCalendar size={11} />{formatDate(blog.date)}</span>}
          </div>
          <h1 className="bp-title">{blog.title}</h1>
          {blog.excerpt && <p className="bp-excerpt">{blog.excerpt}</p>}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="bp-body">
        {blog.imageUrl && (
          <motion.img
            src={blog.imageUrl}
            alt={blog.title}
            className="bp-hero-img"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}

        {/* Main content */}
        <motion.div
          className="bp-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {blog.content || blog.excerpt || ''}
        </motion.div>

        <div className="bp-divider" />

        {/* ── Comments ── */}
        <section className="bp-comments-section">
          <h2 className="bp-comments-heading">
            <FiMessageSquare style={{ display: 'inline', marginRight: 10, verticalAlign: 'middle' }} size={22} />
            {commentsLoading ? 'Comments' : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
          </h2>
            {approvalToast && (
              <div style={{ marginTop: 12 }} className="bp-success-msg">
                <FiCheck size={16} />
                {approvalToast}
              </div>
            )}
          <p className="bp-comments-sub">Join the conversation below.</p>

          {/* Comment list */}
          {commentsLoading ? (
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#9ca3af', fontSize: '.875rem' }}>Loading comments…</p>
          ) : (snapshotComments.length === 0 && localPendingComments.length === 0) ? (
            <p className="bp-no-comments">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            <ul className="bp-comment-list">
              {([
                ...snapshotComments,
                ...localPendingComments
              ]).map((c) => (
                <li key={c.id} className="bp-comment">
                  <div className="bp-comment-header">
                    <div className="bp-avatar">{c.name?.charAt(0)?.toUpperCase() || '?'}</div>
                    <div className="bp-comment-meta">
                      <p className="bp-comment-author">
                        {c.name}
                        {c.pending && (
                          <span style={{ color: '#f97316', fontSize: '0.8rem', marginLeft: 8 }}> (Awaiting moderation)</span>
                        )}
                      </p>
                          <p className="bp-comment-date">{formatCommentDate(c.createdAt) || (c.pending ? 'Just now' : '')}{c.pending ? ' • Pending' : ''}</p>
                    </div>
                  </div>
                      <p className="bp-comment-text" style={c.pending ? { opacity: 0.9, fontStyle: 'italic' } : {}}>{c.comment}</p>

                      {/* Admin reply display */}
                      {c.reply && (
                        <div style={{ marginTop: 10, marginLeft: 54, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e6edf6' }}>
                          <p style={{ margin: 0, fontWeight: 600, color: '#004B8D' }}>VISHAL GUPTA</p>
                          <p style={{ margin: '6px 0 0', color: '#374151' }}>{c.reply}</p>
                          {c.replyAt && <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>{formatCommentDate(c.replyAt)}</p>}
                        </div>
                      )}

                      {/* Reply UI for admin */}
                      {isAdmin && c.id && !c.pending && (
                        <div style={{ marginTop: 8, marginLeft: 54 }}>
                          {replyOpenId === c.id ? (
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                style={{ width: 380, maxWidth: '100%', minHeight: 72, padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
                              />
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <button
                                  onClick={async () => {
                                    if (!replyText.trim()) return;
                                    setReplySubmitting(true);
                                    try {
                                      await updateDoc(doc(db, 'blog_comments', c.id), { reply: replyText.trim(), replyAt: serverTimestamp() });
                                      setReplyOpenId(null);
                                      setReplyText('');
                                    } catch (err) {
                                      console.error('Failed to save reply', err);
                                    } finally {
                                      setReplySubmitting(false);
                                    }
                                  }}
                                  disabled={replySubmitting}
                                  style={{ background: '#004B8D', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}
                                >
                                  {replySubmitting ? 'Saving…' : 'Send reply'}
                                </button>
                                <button onClick={() => { setReplyOpenId(null); setReplyText(''); }} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => { setReplyOpenId(c.id); setReplyText(c.reply || ''); }} style={{ background: 'transparent', border: 'none', color: '#004B8D', cursor: 'pointer', fontWeight: 600 }}>Reply</button>
                          )}
                        </div>
                      )}
                </li>
              ))}
            </ul>
          )}

          {/* Comment form */}
          <h3 className="bp-form-heading">Leave a Comment</h3>

          {submitStatus === 'success' ? (
            <div className="bp-success-msg">
              <FiCheck size={16} />
              {submitMessage}
            </div>
          ) : (
            <form className="bp-form" onSubmit={handleCommentSubmit} noValidate>
              {submitStatus === 'error' && (
                <div className="bp-error-msg">{submitMessage}</div>
              )}
              <div className="bp-form-row">
                <div className="bp-field">
                  <label className="bp-label" htmlFor="bp-name"><FiUser size={10} style={{ marginRight: 4 }} />Name *</label>
                  <input
                    id="bp-name"
                    className="bp-input"
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    maxLength={100}
                  />
                </div>
                <div className="bp-field">
                  <label className="bp-label" htmlFor="bp-email"><FiMail size={10} style={{ marginRight: 4 }} />Email (optional)</label>
                  <input
                    id="bp-email"
                    className="bp-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email (not published)"
                    maxLength={200}
                  />
                </div>
              </div>
              <div className="bp-field">
                <label className="bp-label" htmlFor="bp-comment">Comment *</label>
                <textarea
                  id="bp-comment"
                  className="bp-textarea"
                  required
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share your thoughts…"
                  maxLength={2000}
                />
              </div>
              <p className="bp-policy">
                Your email address will not be published. All comments are moderated and will appear after approval.
              </p>
              <button type="submit" className="bp-submit" disabled={submitting || !name.trim() || !comment.trim()}>
                {submitting ? (
                  <>
                    <div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Submitting…
                  </>
                ) : (
                  <><FiSend size={13} /> Post Comment</>
                )}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
