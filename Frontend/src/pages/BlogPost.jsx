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

    /* ── Rich HTML content styles ── */
    .bp-content {
      font-family: 'Inter', sans-serif;
      font-size: 1.05rem;
      color: #374151;
      line-height: 1.85;
    }
    .bp-content p {
      margin: 0 0 1.5em;
    }
    .bp-content h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2.2rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 2em 0 0.6em;
      line-height: 1.2;
      letter-spacing: -0.02em;
    }
    .bp-content h2 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.7rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 2em 0 0.6em;
      line-height: 1.25;
      letter-spacing: -0.01em;
      padding-bottom: 0.3em;
      border-bottom: 2px solid #f0f0f0;
    }
    .bp-content h3 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.3rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 1.75em 0 0.5em;
      line-height: 1.3;
    }
    .bp-content h4 {
      font-family: 'Inter', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 1.5em 0 0.4em;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .bp-content strong, .bp-content b {
      font-weight: 700;
      color: #111827;
    }
    .bp-content em, .bp-content i {
      font-style: italic;
      color: #4b5563;
    }
    .bp-content u {
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .bp-content a {
      color: #004B8D;
      text-decoration: underline;
      text-underline-offset: 3px;
      transition: color 0.2s;
    }
    .bp-content a:hover {
      color: #003366;
    }
    .bp-content ul {
      list-style: disc;
      padding-left: 1.6em;
      margin: 0 0 1.4em;
    }
    .bp-content ol {
      list-style: decimal;
      padding-left: 1.6em;
      margin: 0 0 1.4em;
    }
    .bp-content li {
      margin-bottom: 0.5em;
      line-height: 1.75;
    }
    .bp-content blockquote {
      border-left: 4px solid #004B8D;
      padding: 0.75em 1.25em;
      margin: 2em 0;
      background: #f8faff;
      border-radius: 0 8px 8px 0;
      font-style: italic;
      color: #4b5563;
      font-size: 1.05rem;
      line-height: 1.8;
    }
    .bp-content pre {
      background: #1a1e2e;
      color: #e2e8f0;
      padding: 1.25em 1.5em;
      border-radius: 10px;
      font-family: 'Fira Code', 'Courier New', monospace;
      font-size: 0.875rem;
      overflow-x: auto;
      margin: 2em 0;
      line-height: 1.6;
    }
    .bp-content code {
      background: #f3f4f6;
      color: #c45a04;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Fira Code', 'Courier New', monospace;
      font-size: 0.875em;
    }
    .bp-content pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      font-size: inherit;
    }
    .bp-content hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 3em 0;
    }

    /* ── Images in between text — medium size like editor ── */
    .bp-content img {
      max-width: 62%;
      width: auto;
      height: auto;
      display: block;
      margin: 2em auto;
      border-radius: 12px;
      box-shadow: 0 6px 28px rgba(0,0,0,0.13);
    }
    .bp-content figure {
      margin: 2em 0;
      text-align: center;
      width: 100%;
    }
    .bp-content figure img {
      display: inline-block;
      max-width: 62%;
      width: auto;
      height: auto;
      margin: 0 auto 0.75em;
      border-radius: 12px;
      box-shadow: 0 6px 28px rgba(0,0,0,0.13);
    }
    .bp-content figcaption {
      font-family: 'Inter', sans-serif;
      font-size: 0.8rem;
      color: #9ca3af;
      font-style: italic;
      text-align: center;
    }

    /* ── Tables ── */
    .bp-content table {
      width: 100%;
      border-collapse: collapse;
      margin: 2em 0;
      font-size: 0.92rem;
      overflow-x: auto;
      display: block;
    }
    .bp-content thead {
      background: #f1f5f9;
    }
    .bp-content th {
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      font-size: 0.78rem;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #374151;
      padding: 10px 14px;
      border: 1px solid #e5e7eb;
      text-align: left;
    }
    .bp-content td {
      padding: 9px 14px;
      border: 1px solid #e5e7eb;
      color: #374151;
      vertical-align: top;
      line-height: 1.6;
    }
    .bp-content tr:nth-child(even) td {
      background: #f9fafb;
    }

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

// Robust date normalization
const toDateObject = (val) => {
  if (!val) return null;
  if (typeof val === 'object' && typeof val.toDate === 'function') return val.toDate();
  if (val && (val.seconds != null || val._seconds != null)) {
    const seconds = Number(val.seconds ?? val._seconds);
    const nanoseconds = Number(val.nanoseconds ?? val._nanoseconds ?? 0);
    if (!Number.isFinite(seconds)) return null;
    return new Date(seconds * 1000 + Math.floor(nanoseconds / 1e6));
  }
  if (typeof val === 'number') {
    if (val < 1e12) return new Date(val * 1000);
    return new Date(val);
  }
  try {
    const d = new Date(val);
    if (!Number.isNaN(d.getTime())) return d;
  } catch (e) {}
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

  const comments = [...snapshotComments, ...localPendingComments];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');

  // Fetch blog by slug or doc id
  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'blogs'),
          where('slug', '==', slug),
          where('published', '==', true)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setBlog({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
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
        setLocalPendingComments((prev) => {
          const removed = prev.filter((p) => data.some((s) => (s.comment || '').trim() === (p.comment || '').trim() && (s.name || '').trim() === (p.name || '').trim()));
          const remaining = prev.filter((p) => !data.some((s) => (s.comment || '').trim() === (p.comment || '').trim() && (s.name || '').trim() === (p.name || '').trim()));
          if (removed.length > 0) setApprovalToast('Your comment was approved and is now visible.');
          return remaining;
        });
        setCommentsLoading(false);
      }, async (err) => {
        console.error('Comments realtime error:', err);
        setCommentsLoading(false);
      });
      return () => {
        if (!unsubCalled) { unsubCalled = true; unsub(); }
      };
    } catch (e) {
      console.error('Realtime listener setup failed:', e);
      setCommentsLoading(false);
      return () => {};
    }
  }, [blog?.id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
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
        approved: false,
        createdAt: serverTimestamp(),
      });
      const pendingComment = {
        id: `pending-${Date.now()}`,
        name: safeName,
        email: safeEmail,
        comment: safeComment,
        createdAt: new Date().toISOString(),
        pending: true
      };
      setLocalPendingComments((s) => [...s, pendingComment]);

      // Non-blocking admin notify
      (async () => {
        try {
          const notifyUrl = (window && window.__BACKEND_NOTIFY_URL) || 'http://localhost:5000/api/notify/comment';
          await fetch(notifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: safeName, email: safeEmail, comment: safeComment, blogTitle: blog.title, blogId: blog.id, blogSlug: blog.slug || blog.id })
          });
        } catch (notifyErr) {
          console.warn('Notification failed:', notifyErr);
        }
      })();

      setSubmitStatus('success');
      setSubmitMessage('Your comment has been submitted and is awaiting moderation. Thank you!');
      setName(''); setEmail(''); setComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      setSubmitStatus('error');
      setSubmitMessage('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
          {blog.excerpt && (
            // excerpt may be plain text (old posts) or have HTML — strip tags for the header pull quote
            <p className="bp-excerpt">{blog.excerpt.replace(/<[^>]*>/g, '')}</p>
          )}
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

        {/* ── Main content — renders rich HTML from editor (images, headings, tables, etc.) ── */}
        <motion.div
          className="bp-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          dangerouslySetInnerHTML={{ __html: blog.content || blog.excerpt || '' }}
        />

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
              {comments.map((c) => (
                <li key={c.id} className="bp-comment">
                  <div className="bp-comment-header">
                    <div className="bp-avatar">{c.name?.charAt(0)?.toUpperCase() || '?'}</div>
                    <div className="bp-comment-meta">
                      <p className="bp-comment-author">
                        {c.name}
                        {c.pending && (
                          <span style={{ color: '#f97316', fontSize: '0.8rem', marginLeft: 8 }}>(Awaiting moderation)</span>
                        )}
                      </p>
                      <p className="bp-comment-date">{formatCommentDate(c.createdAt) || (c.pending ? 'Just now' : '')}{c.pending ? ' • Pending' : ''}</p>
                    </div>
                  </div>
                  <p className="bp-comment-text" style={c.pending ? { opacity: 0.9, fontStyle: 'italic' } : {}}>{c.comment}</p>

                  {/* Admin reply display */}
                  {c.reply && (
                    <div style={{ marginTop: 10, marginLeft: 54, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e6edf6' }}>
                      <p style={{ margin: 0, fontWeight: 600, color: '#004B8D', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>VISHAL GUPTA</p>
                      <p style={{ margin: '6px 0 0', color: '#374151', fontFamily: 'Inter, sans-serif' }}>{c.reply}</p>
                      {c.replyAt && <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#9ca3af', fontFamily: 'Inter, sans-serif' }}>{formatCommentDate(c.replyAt)}</p>}
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
                            style={{ width: 380, maxWidth: '100%', minHeight: 72, padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', fontFamily: 'Inter, sans-serif' }}
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
                              style={{ background: '#004B8D', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}
                            >
                              {replySubmitting ? 'Saving…' : 'Send reply'}
                            </button>
                            <button onClick={() => { setReplyOpenId(null); setReplyText(''); }} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setReplyOpenId(c.id); setReplyText(c.reply || ''); }} style={{ background: 'transparent', border: 'none', color: '#004B8D', cursor: 'pointer', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Reply</button>
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
                  <input id="bp-name" className="bp-input" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" maxLength={100} />
                </div>
                <div className="bp-field">
                  <label className="bp-label" htmlFor="bp-email"><FiMail size={10} style={{ marginRight: 4 }} />Email (optional)</label>
                  <input id="bp-email" className="bp-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email (not published)" maxLength={200} />
                </div>
              </div>
              <div className="bp-field">
                <label className="bp-label" htmlFor="bp-comment">Comment *</label>
                <textarea id="bp-comment" className="bp-textarea" required value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your thoughts…" maxLength={2000} />
              </div>
              <p className="bp-policy">Your email address will not be published. All comments are moderated and will appear after approval.</p>
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