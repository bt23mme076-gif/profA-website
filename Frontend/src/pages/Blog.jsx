import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight, FiCalendar, FiClock, FiSearch, FiTag, FiPlus, FiHome,
  FiLoader, FiX, FiImage, FiBold, FiItalic, FiList, FiLink,
  FiAlignLeft, FiCode, FiType, FiEye, FiEdit3, FiSave, FiTrash2,
  FiUpload, FiCheck, FiMinus, FiChevronDown
} from 'react-icons/fi';
import { addDoc, updateDoc, deleteDoc, collection, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import { useAuth } from '../context/AuthContext';
import EditableText from '../components/EditableText';

// ─── constants ───────────────────────────────────────────────────────────────
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=900&fit=crop';

// ─── animation variants ───────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const viewportOptions = { once: true, margin: '0px 0px -80px 0px', amount: 0.15 };
const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.96, y: 10, transition: { duration: 0.2 } },
};

// ─── helpers ──────────────────────────────────────────────────────────────────
const getTimestamp = (dateVal) => {
  if (!dateVal) return 0;
  try {
    const date = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
    const time = date.getTime();
    return Number.isNaN(time) ? 0 : time;
  } catch { return 0; }
};

const formatDate = (dateVal) => {
  if (!dateVal) return '';
  try {
    const date = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return ''; }
};

const getMonthYear = (dateVal) => {
  if (!dateVal) return 'Unscheduled';
  try {
    const date = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch { return 'Unscheduled'; }
};

const estimateReadTime = (blog) => {
  const sourceText = [blog?.excerpt, blog?.content].filter(Boolean).join(' ').trim();
  if (!sourceText) return '2 min read';
  const wordCount = sourceText.split(/\s+/).filter(Boolean).length;
  return `${Math.max(2, Math.ceil(wordCount / 180))} min read`;
};

const getBlogHref = (blog) => `/blog/${blog.slug || blog.id}`;

// ─── Rich Text Editor ────────────────────────────────────────────────────────
// Global CSS — injected once
if (typeof document !== 'undefined' && !document.getElementById('rte-styles-v3')) {
  const s = document.createElement('style');
  s.id = 'rte-styles-v3';
  s.textContent = `
    .rte-wrap { border:1px solid #d8e0ea; border-radius:16px; overflow:hidden; background:#fff; }
    .rte-toolbar { display:flex; flex-wrap:wrap; gap:2px; align-items:center; padding:8px 10px; background:#f7f9fc; border-bottom:1px solid #e8eef5; }
    .rte-btn { width:32px; height:32px; display:flex; align-items:center; justify-content:center; border:none; background:transparent; border-radius:8px; cursor:pointer; color:#5f748f; font-size:13px; font-family:inherit; transition:all 0.15s; }
    .rte-btn:hover { background:#fff; color:#004b8d; box-shadow:0 1px 4px rgba(0,0,0,0.08); }
    .rte-btn:disabled { opacity:0.4; cursor:not-allowed; }
    .rte-sep { width:1px; height:20px; background:#d8e0ea; margin:0 4px; }
    .rte-link-bar { display:flex; gap:8px; align-items:center; padding:8px 14px; background:#eef4fa; border-bottom:1px solid #e8eef5; }
    .rte-link-input { flex:1; background:transparent; border:none; outline:none; font-size:13px; color:#10233d; font-family:Inter,sans-serif; }
    .rte-link-btn { background:#004b8d; color:#fff; border:none; border-radius:8px; padding:4px 12px; font-size:12px; font-weight:600; cursor:pointer; font-family:Inter,sans-serif; }
    .rte-link-cancel { background:transparent; border:none; color:#5f748f; cursor:pointer; display:flex; align-items:center; }
    .rte-upload-progress { display:flex; align-items:center; gap:8px; padding:10px 14px; background:#f0f6ff; border-bottom:1px solid #dce8f8; font-size:13px; color:#004b8d; font-family:Inter,sans-serif; }
    .rte-area {
      min-height:360px; max-height:580px; overflow-y:auto;
      padding:20px 24px; outline:none;
      font-family:Georgia,serif; font-size:1rem; line-height:1.9; color:#10233d;
      cursor:text; word-break:break-word;
    }
    .rte-area:empty::before { content:attr(data-placeholder); color:#c0cdd8; font-style:italic; pointer-events:none; }
    .rte-area h2 { font-family:'Playfair Display',Georgia,serif; font-size:1.6rem; font-weight:700; color:#0f2745; margin:1.5em 0 0.5em; line-height:1.2; }
    .rte-area h3 { font-family:'Playfair Display',Georgia,serif; font-size:1.25rem; font-weight:600; color:#1a3a5c; margin:1.2em 0 0.4em; }
    .rte-area p { margin:0 0 0.85em; }
    .rte-area ul { list-style:disc; padding-left:1.5em; margin:0 0 1em; }
    .rte-area ol { list-style:decimal; padding-left:1.5em; margin:0 0 1em; }
    .rte-area li { margin-bottom:0.3em; }
    .rte-area blockquote { border-left:4px solid #004b8d; padding:0.5em 1em; margin:1em 0; background:#f8faff; border-radius:0 8px 8px 0; font-style:italic; color:#5f748f; }
    .rte-area pre { background:#1a1e2e; color:#e2e8f0; padding:1em 1.2em; border-radius:10px; font-family:monospace; font-size:0.85rem; overflow-x:auto; margin:1em 0; white-space:pre; }
    .rte-area a { color:#004b8d; text-decoration:underline; }
    .rte-area strong, .rte-area b { font-weight:700; }
    .rte-area em, .rte-area i { font-style:italic; }
    .rte-area u { text-decoration:underline; text-underline-offset:2px; }
    .rte-area hr { border:none; border-top:2px solid #e8eef5; margin:1.5em 0; }
    .rte-area figure { display:block; margin:1.8em 0; text-align:center; }
    .rte-area figure img { display:inline-block; max-width:60%; height:auto; border-radius:10px; box-shadow:0 4px 20px rgba(0,0,0,0.12); }
    .rte-area img:not(figure img) { display:block; max-width:60%; height:auto; border-radius:10px; box-shadow:0 4px 20px rgba(0,0,0,0.12); margin:1.5em auto; }
    @keyframes rte-spin { to { transform:rotate(360deg); } }
    .rte-spinner { width:14px; height:14px; border:2px solid #bcd0e8; border-top-color:#004b8d; border-radius:50%; animation:rte-spin 0.7s linear infinite; }
  `;
  document.head.appendChild(s);
}

function RichEditor({ value, onChange, placeholder = 'Start writing...' }) {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showLinkBar, setShowLinkBar] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const savedRangeRef = useRef(null); // persist selection across async ops & UI state changes
  const isInit = useRef(false);

  // ── Init: set innerHTML once on mount only
  useEffect(() => {
    if (editorRef.current && !isInit.current) {
      editorRef.current.innerHTML = value || '';
      isInit.current = true;
    }
  }, []); // eslint-disable-line

  // ── Sync when value changes externally (tab switch etc.) but editor not focused
  useEffect(() => {
    if (editorRef.current && isInit.current && document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  // ── Save current selection to ref (call before any async operation or state change that causes re-render)
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
        return true;
      }
    }
    return false;
  }, []);

  // ── Restore selection from ref
  const restoreSelection = useCallback(() => {
    if (!savedRangeRef.current) return false;
    editorRef.current?.focus();
    try {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
        return true;
      }
    } catch { }
    return false;
  }, []);

  // ── Move cursor to end of editor
  const moveCursorToEnd = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const range = document.createRange();
    range.selectNodeContents(editorRef.current);
    range.collapse(false);
    const sel = window.getSelection();
    if (sel) { sel.removeAllRanges(); sel.addRange(range); }
    savedRangeRef.current = range.cloneRange();
  }, []);

  const emitChange = useCallback(() => {
    onChange(editorRef.current?.innerHTML || '');
  }, [onChange]);

  const handleInput = useCallback(() => {
    emitChange();
  }, [emitChange]);

  // ── execCommand helper — restores selection first, runs command, saves new selection
  const exec = useCallback((cmd, val = null) => {
    restoreSelection();
    document.execCommand(cmd, false, val);
    saveSelection();
    emitChange();
  }, [restoreSelection, saveSelection, emitChange]);

  // ── On editor click/keyup: always save latest selection
  const handleSelectionChange = useCallback(() => {
    saveSelection();
  }, [saveSelection]);

  // ── Image upload — save range before async, restore after, insert at exact position
  const handleImageFile = useCallback(async (file) => {
    if (!file || uploading) return;
    // Save position before upload dialog closes & async starts
    const hadRange = saveSelection();
    if (!hadRange) moveCursorToEnd();

    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'blogs');

      // Restore cursor (or end)
      const restored = restoreSelection();
      if (!restored) moveCursorToEnd();

      // Build figure + trailing paragraph using DOM (not execCommand — more reliable)
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();

        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Blog image';
        figure.appendChild(img);

        const para = document.createElement('p');
        const br = document.createElement('br');
        para.appendChild(br);

        // Insert figure then paragraph
        range.insertNode(para);
        range.insertNode(figure);

        // Place cursor inside the paragraph after image
        const newRange = document.createRange();
        newRange.setStart(para, 0);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedRangeRef.current = newRange.cloneRange();
      }

      emitChange();
    } catch (e) {
      console.error('Upload failed:', e);
    } finally {
      setUploading(false);
    }
  }, [uploading, saveSelection, restoreSelection, moveCursorToEnd, emitChange]);

  // ── Link insert — save selection, open bar, restore when inserting
  const openLinkBar = useCallback(() => {
    saveSelection();
    // Pre-fill with selected text
    const sel = window.getSelection();
    const selectedText = sel && sel.rangeCount > 0 ? sel.toString() : '';
    setLinkText(selectedText);
    setLinkUrl('');
    setShowLinkBar(true);
  }, [saveSelection]);

  const insertLink = useCallback(() => {
    if (!linkUrl.trim()) return;
    restoreSelection();
    if (linkText.trim() && window.getSelection()?.toString() === '') {
      // No selection — insert new link text
      document.execCommand('insertHTML', false,
        `<a href="${linkUrl.trim()}" target="_blank" rel="noopener noreferrer">${linkText.trim()}</a>`
      );
    } else {
      // Wrap selection with link
      document.execCommand('createLink', false, linkUrl.trim());
      // Make it open in new tab
      const sel = window.getSelection();
      if (sel && sel.anchorNode) {
        let node = sel.anchorNode;
        while (node && node.nodeName !== 'A') node = node.parentNode;
        if (node && node.nodeName === 'A') {
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }
    saveSelection();
    emitChange();
    setShowLinkBar(false);
    setLinkUrl('');
    setLinkText('');
  }, [linkUrl, linkText, restoreSelection, saveSelection, emitChange]);

  const tools = [
    { label: 'T', title: 'Heading 2', action: () => exec('formatBlock', 'H2'), style: { fontFamily: 'Playfair Display,serif', fontWeight: 700, fontSize: 14 } },
    { label: 'H3', title: 'Heading 3', action: () => exec('formatBlock', 'H3'), style: { fontWeight: 700, fontSize: 11 } },
    { label: '¶', title: 'Paragraph', action: () => exec('formatBlock', 'P'), style: { fontSize: 15 } },
    'sep',
    { label: 'B', title: 'Bold', action: () => exec('bold'), style: { fontWeight: 700 } },
    { label: 'I', title: 'Italic', action: () => exec('italic'), style: { fontStyle: 'italic' } },
    { label: 'U', title: 'Underline', action: () => exec('underline'), style: { textDecoration: 'underline' } },
    'sep',
    { label: '≡', title: 'Bullet list', action: () => exec('insertUnorderedList'), style: { fontSize: 16 } },
    { label: '1.', title: 'Numbered list', action: () => exec('insertOrderedList'), style: { fontSize: 11, fontFamily: 'monospace' } },
    { label: '<>', title: 'Code block', action: () => exec('formatBlock', 'PRE'), style: { fontFamily: 'monospace', fontSize: 11 } },
    { label: '—', title: 'Divider', action: () => exec('insertHorizontalRule'), style: { fontSize: 16, letterSpacing: -2 } },
    'sep',
    {
      title: uploading ? 'Uploading…' : 'Insert Image',
      action: () => { if (!uploading) fileInputRef.current?.click(); },
      custom: uploading
        ? <span className="rte-spinner" />
        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    },
    {
      title: 'Insert Link',
      action: openLinkBar,
      custom: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    },
  ];

  return (
    <div className="rte-wrap">
      {/* Toolbar */}
      <div className="rte-toolbar">
        {tools.map((tool, i) =>
          tool === 'sep'
            ? <div key={i} className="rte-sep" />
            : (
              <button
                key={i}
                type="button"
                title={tool.title}
                disabled={tool.title?.includes('Uploading')}
                className="rte-btn"
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent blur which loses selection
                  saveSelection();
                  tool.action();
                }}
                style={tool.style || {}}
              >
                {tool.custom || tool.label}
              </button>
            )
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) handleImageFile(file);
          }}
        />
      </div>

      {/* Upload progress bar */}
      {uploading && (
        <div className="rte-upload-progress">
          <span className="rte-spinner" />
          Uploading image to Cloudinary…
        </div>
      )}

      {/* Link bar */}
      {showLinkBar && (
        <div className="rte-link-bar">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#004b8d" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <input
            className="rte-link-input"
            placeholder="Paste URL… e.g. https://example.com"
            value={linkUrl}
            autoFocus
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); insertLink(); } if (e.key === 'Escape') setShowLinkBar(false); }}
          />
          {!window.getSelection()?.toString() && (
            <input
              className="rte-link-input"
              placeholder="Link text (optional)"
              value={linkText}
              onChange={e => setLinkText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); insertLink(); } }}
              style={{ borderLeft: '1px solid #d0dcea', paddingLeft: 8, maxWidth: 160 }}
            />
          )}
          <button className="rte-link-btn" type="button" onClick={insertLink}>Insert</button>
          <button className="rte-link-cancel" type="button" onClick={() => setShowLinkBar(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="rte-area"
        data-placeholder={placeholder}
        onInput={handleInput}
        onClick={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        onMouseUp={handleSelectionChange}
      />
    </div>
  );
}

// ─── Blog Editor Modal (WordPress-like) ──────────────────────────────────────
function BlogEditorModal({ blog, onClose, onSave, isNew = false }) {
  const [form, setForm] = useState({
    title: blog?.title || '',
    excerpt: blog?.excerpt || '',
    content: blog?.content || '',
    imageUrl: blog?.imageUrl || '',
    category: blog?.category || '',
    author: blog?.author || 'Prof. Vishal Gupta',
    date: blog?.date ? new Date(blog.date?.toDate ? blog.date.toDate() : blog.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    published: blog?.published ?? false,
    showOnHome: blog?.showOnHome ?? false,
    slug: blog?.slug || `blog-${Date.now()}`,
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('write'); // 'write' | 'preview' | 'settings'
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef(null);

  const handleCoverUpload = async (file) => {
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await uploadToCloudinary(file, 'blogs');
      setForm(f => ({ ...f, imageUrl: url }));
    } catch (e) {
      console.error('Cover upload failed', e);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async (publish = null) => {
    setSaving(true);
    try {
      const data = {
        ...form,
        published: publish !== null ? publish : form.published,
        date: new Date(form.date).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await onSave(data);
      onClose();
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSaving(false);
    }
  };

  const wordCount = form.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch bg-black/60 backdrop-blur-md">
      <motion.div
        initial="hidden" animate="visible" exit="exit" variants={modalVariants}
        className="relative flex flex-col w-full max-w-6xl mx-auto my-4 bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Editor Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-[#e8eef5] bg-[#f7f9fc]">
          <div className="flex gap-1">
            {['write', 'preview', 'settings'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-['Inter'] font-semibold capitalize transition-all ${
                  tab === t
                    ? 'bg-white text-[#004b8d] shadow-sm'
                    : 'text-[#5f748f] hover:text-[#10233d]'
                }`}
              >
                {t === 'write' && <><FiEdit3 size={13} className="inline mr-1.5" />{t}</>}
                {t === 'preview' && <><FiEye size={13} className="inline mr-1.5" />{t}</>}
                {t === 'settings' && <><FiTag size={13} className="inline mr-1.5" />{t}</>}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <span className="font-['Inter'] text-xs text-[#8fa3bc]">{wordCount} words · {Math.max(2, Math.ceil(wordCount / 180))} min read</span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#d8e0ea] bg-white text-sm font-['Inter'] font-semibold text-[#5f748f] hover:bg-[#f7f9fc] transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#004b8d] text-sm font-['Inter'] font-semibold text-white hover:bg-[#003a6e] transition-colors disabled:opacity-50"
            >
              {saving ? <FiLoader size={14} className="animate-spin" /> : <FiCheck size={14} />}
              Publish
            </button>
          </div>

          <button type="button" onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#eef4fa] text-[#5f748f] hover:bg-red-50 hover:text-red-500 transition-colors">
            <FiX size={16} />
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto">

          {/* WRITE TAB */}
          {tab === 'write' && (
            <div className="p-6 lg:p-10 space-y-6 max-w-4xl mx-auto">
              {/* Cover Image */}
              <div
                className="relative rounded-2xl overflow-hidden bg-[#eef4fa] border-2 border-dashed border-[#c4d7ec] cursor-pointer group"
                style={{ aspectRatio: '21/7' }}
                onClick={() => coverInputRef.current?.click()}
              >
                {form.imageUrl ? (
                  <>
                    <img src={form.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-['Inter'] text-sm font-semibold flex items-center gap-2">
                        <FiUpload size={16} /> Change Cover
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 py-8">
                    {uploadingCover ? (
                      <FiLoader size={24} className="animate-spin text-[#004b8d]" />
                    ) : (
                      <>
                        <FiImage size={28} className="text-[#a0b8d0]" />
                        <p className="font-['Inter'] text-sm text-[#7a9ab8]">Click to add cover image</p>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={coverInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleCoverUpload(e.target.files[0]); e.target.value = ''; }}
                />
              </div>

              {/* Title */}
              <input
                value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Blog post title..."
                className="w-full text-[clamp(2rem,4vw,3rem)] font-['Playfair_Display'] font-bold text-[#0f2745] placeholder:text-[#c4d0de] outline-none border-none bg-transparent leading-tight"
              />

              {/* Excerpt */}
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm(f => ({ ...f, excerpt: e.target.value }))}
                placeholder="Write a compelling excerpt / subtitle..."
                rows={2}
                className="w-full font-['Georgia',serif] text-lg italic text-[#5f748f] placeholder:text-[#c4d0de] outline-none border-none bg-transparent resize-none leading-8"
              />

              <div className="border-t border-[#e8eef5]" />

              {/* Rich Content Editor */}
              <RichEditor
                value={form.content}
                onChange={(val) => setForm(f => ({ ...f, content: val }))}
                placeholder="Write your full article here. Use the toolbar to format text, add images, links, headings..."
              />
            </div>
          )}

          {/* PREVIEW TAB */}
          {tab === 'preview' && (
            <div className="max-w-3xl mx-auto p-6 lg:p-10">
              {form.imageUrl && (
                <img src={form.imageUrl} alt="Cover" className="w-full rounded-2xl mb-8 shadow-lg" style={{ aspectRatio: '21/9', objectFit: 'cover' }} />
              )}
              <div className="flex flex-wrap gap-3 text-xs text-[#60758d] mb-5">
                {form.date && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#eef4fa] px-3 py-1.5 font-['Inter']">
                    <FiCalendar size={12} /> {formatDate(form.date)}
                  </span>
                )}
                {form.category && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#fff3e7] px-3 py-1.5 font-['Inter'] text-[#c45a04]">
                    <FiTag size={12} /> {form.category}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 rounded-full bg-[#eef4fa] px-3 py-1.5 font-['Inter']">
                  <FiClock size={12} /> {Math.max(2, Math.ceil(wordCount / 180))} min read
                </span>
              </div>
              <h1 className="font-['Playfair_Display'] text-4xl font-bold text-[#0f2745] mb-4 leading-tight">{form.title || 'Untitled'}</h1>
              <p className="font-['Georgia',serif] text-xl italic text-[#5f748f] mb-8 leading-8">{form.excerpt}</p>
              <div
                className="font-['Georgia',serif] text-base leading-8 text-[#2d3d50] prose prose-blue max-w-none
                  [&_h2]:font-['Playfair_Display'] [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#0f2745] [&_h2]:mt-8 [&_h2]:mb-4
                  [&_h3]:font-['Playfair_Display'] [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3
                  [&_p]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4
                  [&_pre]:bg-[#1a1e2e] [&_pre]:text-[#e2e8f0] [&_pre]:p-5 [&_pre]:rounded-xl [&_pre]:font-mono [&_pre]:text-sm [&_pre]:overflow-x-auto [&_pre]:my-5
                  [&_a]:text-[#004b8d] [&_a]:underline
                  [&_blockquote]:border-l-4 [&_blockquote]:border-[#004b8d] [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-[#5f748f] [&_blockquote]:my-6
                  [&_figure]:my-6 [&_img]:rounded-xl [&_img]:shadow-md [&_img]:max-w-full
                  [&_hr]:border-[#e8eef5] [&_hr]:my-8"
                dangerouslySetInnerHTML={{ __html: form.content }}
              />
            </div>
          )}

          {/* SETTINGS TAB */}
          {tab === 'settings' && (
            <div className="max-w-2xl mx-auto p-6 lg:p-10 space-y-6">
              <div>
                <label className="block font-['Inter'] text-xs font-semibold uppercase tracking-[0.18em] text-[#5f748f] mb-2">URL Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                  className="w-full rounded-xl border border-[#d8e0ea] bg-[#f7f9fc] px-4 py-3 font-['Inter'] text-sm text-[#10233d] outline-none focus:border-[#004b8d] focus:bg-white"
                />
                <p className="mt-1 font-['Inter'] text-xs text-[#8fa3bc]">yoursite.com/blog/{form.slug}</p>
              </div>

              <div>
                <label className="block font-['Inter'] text-xs font-semibold uppercase tracking-[0.18em] text-[#5f748f] mb-2">Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="Leadership, Strategy, Management..."
                  className="w-full rounded-xl border border-[#d8e0ea] bg-[#f7f9fc] px-4 py-3 font-['Inter'] text-sm text-[#10233d] outline-none focus:border-[#004b8d] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-['Inter'] text-xs font-semibold uppercase tracking-[0.18em] text-[#5f748f] mb-2">Author</label>
                <input
                  value={form.author}
                  onChange={(e) => setForm(f => ({ ...f, author: e.target.value }))}
                  className="w-full rounded-xl border border-[#d8e0ea] bg-[#f7f9fc] px-4 py-3 font-['Inter'] text-sm text-[#10233d] outline-none focus:border-[#004b8d] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-['Inter'] text-xs font-semibold uppercase tracking-[0.18em] text-[#5f748f] mb-2">Publish Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full rounded-xl border border-[#d8e0ea] bg-[#f7f9fc] px-4 py-3 font-['Inter'] text-sm text-[#10233d] outline-none focus:border-[#004b8d] focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-['Inter'] text-xs font-semibold uppercase tracking-[0.18em] text-[#5f748f] mb-2">Cover Image URL (or upload above)</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-[#d8e0ea] bg-[#f7f9fc] px-4 py-3 font-['Inter'] text-sm text-[#10233d] outline-none focus:border-[#004b8d] focus:bg-white"
                />
              </div>

              <div className="rounded-2xl border border-[#d8e0ea] bg-[#f7f9fc] p-5 space-y-4">
                <p className="font-['Inter'] text-xs font-semibold uppercase tracking-[0.18em] text-[#5f748f]">Visibility</p>
                {[
                  { key: 'published', label: 'Published', desc: 'Visible to all visitors' },
                  { key: 'showOnHome', label: 'Feature on Home Page', desc: 'Show in home blog section' },
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer gap-4">
                    <div>
                      <p className="font-['Inter'] text-sm font-semibold text-[#10233d]">{label}</p>
                      <p className="font-['Inter'] text-xs text-[#8fa3bc]">{desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${form[key] ? 'bg-[#004b8d]' : 'bg-[#d8e0ea]'}`}
                    >
                      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${form[key] ? 'translate-x-6' : ''}`} />
                    </button>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSave(null)}
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#004b8d] py-3 font-['Inter'] text-sm font-semibold text-white hover:bg-[#003a6e] disabled:opacity-50 transition-colors"
                >
                  {saving ? <FiLoader size={15} className="animate-spin" /> : <FiSave size={15} />}
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Blog Page ───────────────────────────────────────────────────────────
export default function Blog() {
  const { isAdmin } = useAuth() || {};
  const { data: pageData } = useFirestoreDoc('content', 'blog', {
    page_heading: 'Blog',
    page_subtitle: 'Thoughts on leadership, strategy, and the human side of management.',
  });
  const { data: blogsRaw, loading: blogsLoading } = useFirestoreCollection('blogs', [], true);

  const [activeMonth, setActiveMonth] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');
  const [editorBlog, setEditorBlog] = useState(null); // blog being edited
  const [isNewBlog, setIsNewBlog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  // Open editor for new blog
  const handleNewBlog = () => {
    setIsNewBlog(true);
    setEditorBlog({});
  };

  // Open editor for existing blog
  const handleEditBlog = (blog) => {
    setIsNewBlog(false);
    setEditorBlog(blog);
  };

  // Save (create or update)
  const handleSaveBlog = async (formData) => {
    if (isNewBlog) {
      await addDoc(collection(db, 'blogs'), formData);
      showToast('Blog post saved!');
    } else {
      await updateDoc(doc(db, 'blogs', editorBlog.id), formData);
      showToast('Changes saved.');
    }
  };

  // Delete
  const handleDeleteBlog = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}"? This cannot be undone.`)) return;
    setDeletingId(blog.id);
    try {
      await deleteDoc(doc(db, 'blogs', blog.id));
      showToast('Blog deleted.');
    } catch {
      showToast('Error deleting blog.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleHome = async (blog) => {
    try {
      await updateDoc(doc(db, 'blogs', blog.id), { showOnHome: !blog.showOnHome });
      showToast(blog.showOnHome ? 'Removed from Home.' : 'Pinned to Home.');
    } catch {
      showToast('Error updating blog.');
    }
  };

  // Data
  const blogs = [...(blogsRaw || [])]
    .filter((b) => isAdmin || b.published)
    .sort((a, b) => getTimestamp(b.date) - getTimestamp(a.date));

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const monthMap = blogs.reduce((acc, blog) => {
    const label = getMonthYear(blog.date);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const months = [
    { label: 'All', count: blogs.length },
    ...Object.keys(monthMap).map((label) => ({ label, count: monthMap[label] })),
  ];

  const filteredBlogs = blogs.filter((blog) => {
    const matchesMonth = activeMonth === 'All' || getMonthYear(blog.date) === activeMonth;
    const matchesSearch =
      !normalizedQuery ||
      blog.title?.toLowerCase().includes(normalizedQuery) ||
      blog.excerpt?.toLowerCase().includes(normalizedQuery) ||
      blog.content?.replace(/<[^>]*>/g, '').toLowerCase().includes(normalizedQuery) ||
      blog.category?.toLowerCase().includes(normalizedQuery);
    return matchesMonth && matchesSearch;
  });

  const latestBlog = blogs[0] || null;
  const featuredBlog = filteredBlogs[0] || null;
  const remainingBlogs = filteredBlogs.slice(1);
  const archiveMonths = Math.max(months.length - 1, 0);
  const activeLabel = activeMonth === 'All' ? 'Entire archive' : activeMonth;

  return (
    <div className="bg-[#f6f8fb] text-[#10233d]">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#0f2745] px-6 py-3 font-['Inter'] text-sm font-medium text-white shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blog Editor Modal */}
      <AnimatePresence>
        {editorBlog !== null && (
          <BlogEditorModal
            blog={editorBlog}
            isNew={isNewBlog}
            onClose={() => setEditorBlog(null)}
            onSave={handleSaveBlog}
          />
        )}
      </AnimatePresence>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-[#17365f] bg-[#0f2745] text-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at top left, rgba(245,196,0,0.22), transparent 32%), radial-gradient(circle at 85% 20%, rgba(255,255,255,0.14), transparent 26%), linear-gradient(135deg, #112b4f 0%, #0c1d35 100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,rgba(5,13,23,0.42))]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 xl:py-24">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl">
            <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <span className="font-['Inter'] text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#FFCC00]">
                Essays, notes, and teaching reflections
              </span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="max-w-3xl font-['Playfair_Display'] text-5xl font-bold leading-[0.95] text-white sm:text-6xl lg:text-7xl text-center">
              <EditableText
                collection="content" docId="blog" field="page_heading"
                defaultValue={pageData?.page_heading || 'Blog'}
                className="font-['Playfair_Display'] font-bold text-white"
              />
            </motion.h1>

            <motion.div variants={fadeInUp} className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              <EditableText
                collection="content" docId="blog" field="page_subtitle"
                defaultValue={pageData?.page_subtitle || 'Thoughts on leadership, strategy, and the human side of management.'}
                className="font-['Inter'] text-slate-200" multiline
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { val: blogs.length, label: 'Published articles' },
                { val: archiveMonths, label: 'Archive months' },
                { val: filteredBlogs.length, label: 'Visible now' },
              ].map(({ val, label }) => (
                <div key={label} className="rounded-3xl border border-white/15 bg-white/8 px-5 py-5 backdrop-blur-sm">
                  <p className="font-['Playfair_Display'] text-3xl font-semibold text-white">{val}</p>
                  <p className="mt-2 font-['Inter'] text-xs uppercase tracking-[0.2em] text-slate-300">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Latest blog card */}
          <motion.div
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="self-end"
          >
            <div className="overflow-hidden rounded-4xl border border-white/15 bg-white/10 shadow-[0_30px_80px_rgba(4,11,20,0.38)] backdrop-blur-sm">
              <div className="relative aspect-4/3 overflow-hidden border-b border-white/10">
                <img
                  src={latestBlog?.imageUrl || FALLBACK_IMAGE}
                  alt={latestBlog?.title || 'Latest article'}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,37,0.05),rgba(8,20,37,0.7))]" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="font-['Inter'] text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#FFCC00]">Latest from the journal</p>
                  <p className="mt-3 font-['Playfair_Display'] text-2xl font-semibold leading-tight text-white">
                    {latestBlog?.title || 'Fresh writing will appear here.'}
                  </p>
                </div>
              </div>
              <div className="space-y-4 px-6 py-6">
                <div className="flex flex-wrap gap-3 text-xs text-slate-200">
                  {latestBlog?.date && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 font-['Inter']">
                      <FiCalendar size={12} /> {formatDate(latestBlog.date)}
                    </span>
                  )}
                  {latestBlog?.category && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 font-['Inter']">
                      <FiTag size={12} /> {latestBlog.category}
                    </span>
                  )}
                </div>
                <p className="font-['Inter'] text-sm leading-7 text-slate-200">
                  {latestBlog?.excerpt || 'Publish a post to feature it here automatically.'}
                </p>
                {latestBlog && !isAdmin && (
                  <Link to={getBlogHref(latestBlog)} className="inline-flex items-center gap-2 font-['Inter'] text-sm font-semibold uppercase tracking-[0.18em] text-white transition-transform duration-200 hover:translate-x-1">
                    Read article <FiArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Admin toolbar ── */}
      {isAdmin && (
        <div className="sticky top-0 z-40 border-b border-[#d8e0ea] bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-12">
            <p className="font-['Inter'] text-xs font-semibold uppercase tracking-[0.2em] text-[#004b8d]">
              Admin · {blogsRaw?.length ?? 0} posts · {blogs.filter(b => !b.published).length} drafts
            </p>
            <button
              type="button"
              onClick={handleNewBlog}
              className="inline-flex items-center gap-2 rounded-full bg-[#004b8d] px-5 py-2.5 font-['Inter'] text-sm font-semibold text-white hover:bg-[#003a6e] transition-colors"
            >
              <FiPlus size={15} /> Write New Post
            </button>
          </div>
        </div>
      )}

      {/* ── Filter bar ── */}
      <section className="relative z-10 -mt-8 pb-20 lg:-mt-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="rounded-4xl border border-[#d8e0ea] bg-white p-6 shadow-[0_24px_70px_rgba(15,39,69,0.08)] lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="font-['Inter'] text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#004b8d]">Browse the archive</p>
                <div className="relative mt-4">
                  <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title, topic, or excerpt"
                    className="w-full rounded-2xl border border-[#d6deea] bg-[#f7f9fc] py-4 pl-12 pr-4 font-['Inter'] text-sm text-[#10233d] outline-none transition-colors placeholder:text-gray-400 focus:border-[#004b8d] focus:bg-white"
                  />
                </div>
              </div>
              <div className="rounded-3xl bg-[#eef4fa] px-5 py-4">
                <p className="font-['Inter'] text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#5f748f]">Current filter</p>
                <p className="mt-2 font-['Playfair_Display'] text-2xl font-semibold text-[#10233d]">{activeLabel}</p>
                <p className="mt-2 font-['Inter'] text-sm leading-6 text-[#5f748f]">
                  Showing {filteredBlogs.length} of {blogs.length} articles.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {months.map((month) => (
                <button
                  key={month.label}
                  type="button"
                  onClick={() => setActiveMonth(month.label)}
                  className={`rounded-full border px-4 py-2 font-['Inter'] text-sm transition-all duration-200 ${
                    activeMonth === month.label
                      ? 'border-[#004b8d] bg-[#004b8d] text-white shadow-lg shadow-[#004b8d]/20'
                      : 'border-[#d6deea] bg-white text-[#51657d] hover:border-[#9fb7d7] hover:text-[#10233d]'
                  }`}
                >
                  {month.label}<span className="ml-2 text-xs opacity-80">{month.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Blog grid ── */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {blogsLoading ? (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="overflow-hidden rounded-4xl border border-[#d8e0ea] bg-white p-6 shadow-sm lg:p-8">
                <div className="animate-pulse space-y-5">
                  <div className="h-72 rounded-3xl bg-[#e8edf4]" />
                  <div className="h-4 w-32 rounded-full bg-[#e8edf4]" />
                  <div className="h-10 w-3/4 rounded-full bg-[#e8edf4]" />
                </div>
              </div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="rounded-4xl border border-dashed border-[#c9d6e6] bg-white px-6 py-20 text-center shadow-sm">
              <p className="font-['Inter'] text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#004b8d]">No matches right now</p>
              <h2 className="mt-4 font-['Playfair_Display'] text-4xl font-semibold text-[#10233d]">Refine the search or switch the archive month.</h2>
              {isAdmin && (
                <button type="button" onClick={handleNewBlog}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#004b8d] px-6 py-3 font-['Inter'] text-sm font-semibold text-white hover:bg-[#003a6e] transition-colors">
                  <FiPlus size={14} /> Write first post
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-14">
              {/* Featured post */}
              {featuredBlog && (
                <motion.article initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
                  className="overflow-hidden rounded-4xl border border-[#d8e0ea] bg-white shadow-[0_24px_70px_rgba(15,39,69,0.08)]">
                  <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="relative min-h-80 overflow-hidden bg-[#dce8f5] lg:min-h-full">
                      <img
                        src={featuredBlog.imageUrl || FALLBACK_IMAGE}
                        alt={featuredBlog.title}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,37,0.04),rgba(8,20,37,0.52))]" />
                      <div className="absolute left-6 top-6 inline-flex rounded-full bg-white/88 px-4 py-2 backdrop-blur-sm">
                        <span className="font-['Inter'] text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#004b8d]">Featured article</span>
                      </div>
                      {isAdmin && !featuredBlog.published && (
                        <div className="absolute right-6 top-6 inline-flex rounded-full bg-amber-100 px-4 py-2">
                          <span className="font-['Inter'] text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-amber-700">Draft</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between p-7 sm:p-10">
                      <div>
                        <div className="flex flex-wrap gap-3 text-xs text-[#60758d] justify-center">
                          {featuredBlog.date && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#eef4fa] px-3 py-1.5 font-['Inter']">
                              <FiCalendar size={12} /> {formatDate(featuredBlog.date)}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-2 rounded-full bg-[#eef4fa] px-3 py-1.5 font-['Inter']">
                            <FiClock size={12} /> {estimateReadTime(featuredBlog)}
                          </span>
                          {featuredBlog.category && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#fff3e7] px-3 py-1.5 font-['Inter'] text-[#c45a04]">
                              <FiTag size={12} /> {featuredBlog.category}
                            </span>
                          )}
                        </div>

                        <div className="mt-5 font-['Playfair_Display'] text-[clamp(2rem,3vw,3.25rem)] font-semibold leading-[1.05] text-[#10233d] text-center">
                          {!isAdmin ? (
                            <Link to={getBlogHref(featuredBlog)} className="transition-colors duration-200 hover:text-[#004b8d]">
                              {featuredBlog.title}
                            </Link>
                          ) : (
                            <span>{featuredBlog.title}</span>
                          )}
                        </div>

                        <div className="mt-6 rounded-3xl border border-[#e4ebf3] bg-[#f7f9fc] p-5">
                          <p className="font-['Playfair_Display'] text-lg italic leading-8 text-[#54687e] text-center"
                            dangerouslySetInnerHTML={{ __html: featuredBlog.excerpt }} />
                        </div>
                      </div>

                      <div className="mt-8 flex flex-wrap gap-3">
                        {!isAdmin ? (
                          <Link to={getBlogHref(featuredBlog)}
                            className="inline-flex items-center gap-2 rounded-full bg-[#004b8d] px-6 py-3 font-['Inter'] text-sm font-semibold uppercase tracking-[0.16em] text-white transition-transform duration-200 hover:-translate-y-0.5">
                            Read full article <FiArrowRight size={15} />
                          </Link>
                        ) : (
                          <>
                            <button type="button" onClick={() => handleEditBlog(featuredBlog)}
                              className="inline-flex items-center gap-2 rounded-full bg-[#004b8d] px-5 py-2.5 font-['Inter'] text-sm font-semibold text-white hover:bg-[#003a6e] transition-colors">
                              <FiEdit3 size={14} /> Edit Post
                            </button>
                            <button type="button" onClick={() => handleToggleHome(featuredBlog)}
                              className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 font-['Inter'] text-sm font-semibold transition-colors ${
                                featuredBlog.showOnHome
                                  ? 'border-[#FFCC00] bg-[#fffbea] text-[#9a7200]'
                                  : 'border-[#bfd0e4] text-[#10233d] hover:border-[#FFCC00] hover:bg-[#fffbea]'
                              }`}>
                              <FiHome size={14} /> {featuredBlog.showOnHome ? 'On Home ✔' : 'Pin to Home'}
                            </button>
                            <button type="button" onClick={() => handleDeleteBlog(featuredBlog)}
                              disabled={deletingId === featuredBlog.id}
                              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2.5 font-['Inter'] text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                              {deletingId === featuredBlog.id ? <FiLoader size={14} className="animate-spin" /> : <FiTrash2 size={14} />}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              )}

              {/* Remaining posts grid */}
              {remainingBlogs.length > 0 && (
                <div>
                  <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
                    className="mb-8 flex flex-col gap-3 border-b border-[#d8e0ea] pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="font-['Inter'] text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#004b8d]">More writing</p>
                      <h2 className="mt-2 font-['Playfair_Display'] text-4xl font-semibold text-[#10233d]">Archive highlights</h2>
                    </div>
                    <p className="max-w-xl font-['Inter'] text-sm leading-7 text-[#5f748f]">
                      A curated archive of essays on management, institutions, leadership, and reflective practice.
                    </p>
                  </motion.div>

                  <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={staggerContainer}
                    className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                    {remainingBlogs.map((blog) => (
                      <motion.article key={blog.id} variants={fadeInUp}
                        className="group overflow-hidden rounded-[1.8rem] border border-[#d8e0ea] bg-white shadow-[0_18px_50px_rgba(15,39,69,0.06)] transition-transform duration-300 hover:-translate-y-1">
                        <div className="relative aspect-16/11 overflow-hidden bg-[#dce8f5]">
                          <img
                            src={blog.imageUrl || FALLBACK_IMAGE}
                            alt={blog.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,37,0.02),rgba(8,20,37,0.42))]" />
                          {blog.category && (
                            <span className="absolute left-4 top-4 inline-flex rounded-full bg-white/90 px-3 py-1.5 font-['Inter'] text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#004b8d] backdrop-blur-sm">
                              {blog.category}
                            </span>
                          )}
                          {isAdmin && !blog.published && (
                            <span className="absolute right-4 top-4 inline-flex rounded-full bg-amber-100 px-3 py-1.5 font-['Inter'] text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-amber-700">
                              Draft
                            </span>
                          )}
                          {isAdmin && blog.showOnHome && (
                            <span className="absolute right-4 bottom-4 inline-flex items-center gap-1 rounded-full bg-[#FFCC00] px-3 py-1.5 font-['Inter'] text-[0.65rem] font-semibold text-[#5a4500]">
                              <FiHome size={10} /> Home
                            </span>
                          )}
                        </div>

                        <div className="space-y-4 p-6">
                          <div className="flex flex-wrap gap-3 text-xs text-[#60758d] justify-center">
                            {blog.date && (
                              <span className="inline-flex items-center gap-2 font-['Inter']">
                                <FiCalendar size={12} /> {formatDate(blog.date)}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-2 font-['Inter']">
                              <FiClock size={12} /> {estimateReadTime(blog)}
                            </span>
                          </div>

                          <div className="font-['Playfair_Display'] text-[1.7rem] font-semibold leading-tight text-[#10233d] text-center">
                            {!isAdmin ? (
                              <Link to={getBlogHref(blog)} className="transition-colors duration-200 hover:text-[#004b8d]">
                                {blog.title}
                              </Link>
                            ) : (
                              <span>{blog.title}</span>
                            )}
                          </div>

                          <p className="font-['Inter'] text-sm leading-7 text-[#5f748f] text-center line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: blog.excerpt?.replace(/<[^>]*>/g, '') }} />

                          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8eef5] pt-4">
                            {!isAdmin ? (
                              <Link to={getBlogHref(blog)}
                                className="inline-flex items-center gap-2 font-['Inter'] text-sm font-semibold uppercase tracking-[0.14em] text-[#004b8d] transition-transform duration-200 hover:translate-x-1">
                                Read article <FiArrowRight size={14} />
                              </Link>
                            ) : (
                              <div className="flex gap-2 flex-wrap">
                                <button type="button" onClick={() => handleEditBlog(blog)}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-[#004b8d] px-4 py-2 font-['Inter'] text-xs font-semibold text-white hover:bg-[#003a6e] transition-colors">
                                  <FiEdit3 size={12} /> Edit
                                </button>
                                <button type="button" onClick={() => handleToggleHome(blog)}
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 font-['Inter'] text-xs font-semibold transition-colors ${
                                    blog.showOnHome
                                      ? 'border-[#FFCC00] bg-[#fffbea] text-[#9a7200]'
                                      : 'border-[#d6deea] text-[#51657d] hover:border-[#FFCC00]'
                                  }`}>
                                  <FiHome size={11} /> {blog.showOnHome ? 'Pinned' : 'Pin'}
                                </button>
                                <button type="button" onClick={() => handleDeleteBlog(blog)}
                                  disabled={deletingId === blog.id}
                                  className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-2 font-['Inter'] text-xs font-semibold text-red-400 hover:bg-red-50 transition-colors">
                                  {deletingId === blog.id ? <FiLoader size={11} className="animate-spin" /> : <FiTrash2 size={11} />}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </motion.div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}