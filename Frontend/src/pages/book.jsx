import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiShoppingCart, FiAward, FiVideo, FiMic, FiEdit2, FiTrash2, FiPlus, FiBookOpen, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import EditableText from '../components/EditableText';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

/* ─── Font + CSS injection ───────────────────────────── */
if (typeof document !== 'undefined') {
  const _bkLink = document.createElement('link');
  _bkLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap';
  _bkLink.rel = 'stylesheet';
  document.head.appendChild(_bkLink);

  const _bkStyle = document.createElement('style');
  _bkStyle.textContent = `
    .bk-root{background:#ffffff;min-height:100vh;}
    .bk-hero{background:linear-gradient(135deg,#dce8f5 0%,#fff7ed 100%);padding:80px 24px 64px;border-bottom:1px solid rgba(0,75,141,.12);position:relative;overflow:hidden;}
    .bk-hero::before{content:'';position:absolute;top:-80px;right:-60px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(249,115,22,.14) 0%,transparent 70%);pointer-events:none;}
    .bk-hero::after{content:'';position:absolute;bottom:-80px;left:-40px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(0,75,141,.1) 0%,transparent 70%);pointer-events:none;}
    .bk-hero-inner{max-width:900px;margin:0 auto;text-align:center;position:relative;z-index:1;}
    .bk-accent-bar{width:80px;height:4px;background:#f97316;border-radius:2px;margin:0 auto 28px;}
    .bk-hero h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.8rem,6vw,5rem);font-weight:700;color:#1a1a1a;line-height:1.1;margin:0 0 20px;letter-spacing:-.02em;}
    .bk-hero p{font-family:'Inter',system-ui,sans-serif;font-size:1.1rem;color:#6b7280;max-width:600px;margin:0 auto 36px;line-height:1.7;}
    .bk-stats{display:flex;justify-content:center;flex-wrap:wrap;gap:12px;}
    .bk-stat{display:inline-flex;flex-direction:column;align-items:center;background:white;border-radius:12px;padding:16px 28px;box-shadow:0 4px 20px rgba(0,75,141,.1);border:1px solid rgba(0,75,141,.08);}
    .bk-stat strong{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:700;color:#004B8D;}
    .bk-stat span{font-family:'Inter',sans-serif;font-size:.72rem;font-weight:500;color:#9ca3af;letter-spacing:.09em;text-transform:uppercase;margin-top:2px;}
    .bk-admin-bar{background:#faf8f5;border-bottom:1px solid #e5e7eb;padding:12px 24px;display:flex;justify-content:flex-end;}
    .bk-admin-bar-inner{max-width:1100px;width:100%;margin:0 auto;display:flex;justify-content:flex-end;}
    .bk-list{max-width:1100px;margin:0 auto;padding:0 24px 80px;}
    .bk-entry{display:grid;grid-template-columns:56px 200px 1fr;gap:0 36px;padding:56px 0;border-bottom:1px solid #f0f0f0;position:relative;align-items:start;}
    @media(max-width:900px){.bk-entry{grid-template-columns:1fr;gap:24px;}.bk-entry-num{display:none;}}
    .bk-entry-num{font-family:'Playfair Display',serif;font-size:4.5rem;font-weight:700;color:transparent;-webkit-text-stroke:1.5px rgba(0,75,141,.15);line-height:1;padding-top:6px;user-select:none;}
    .bk-cover-wrap{border-radius:4px;overflow:hidden;aspect-ratio:2/3;background:#f3f4f6;box-shadow:6px 10px 32px rgba(0,0,0,.18),2px 4px 10px rgba(0,0,0,.1);transform:perspective(800px) rotateY(-5deg);transition:transform .4s cubic-bezier(.16,1,.3,1),box-shadow .4s ease;cursor:pointer;}
    .bk-cover-wrap:hover{transform:perspective(800px) rotateY(0deg) translateY(-6px);box-shadow:10px 24px 56px rgba(0,0,0,.18),2px 6px 14px rgba(0,0,0,.08);}
    .bk-cover-wrap img{width:100%;height:100%;object-fit:cover;display:block;}
    .bk-content{padding-top:4px;}
    .bk-year-tag{display:inline-block;font-family:'Inter',sans-serif;font-size:.68rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#004B8D;background:#dce8f5;padding:3px 10px;border-radius:2px;margin-bottom:14px;}
    .bk-title{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.5rem,2.4vw,2rem);font-weight:700;color:#1a1a1a;line-height:1.2;margin:0 0 10px;letter-spacing:-.01em;}
    .bk-authors{font-family:'Inter',sans-serif;font-size:.9rem;color:#4b5563;margin-bottom:4px;line-height:1.5;}
    .bk-publisher{font-family:'Inter',sans-serif;font-size:.82rem;color:#9ca3af;margin-bottom:24px;}
    .bk-divider{width:40px;height:2px;background:#f97316;margin-bottom:24px;border-radius:1px;}
    .bk-award{display:inline-flex;align-items:flex-start;gap:10px;background:linear-gradient(135deg,#fff7ed,#fef3e2);border:1px solid rgba(249,115,22,.25);border-left:3px solid #f97316;padding:10px 14px;border-radius:0 6px 6px 0;margin-bottom:16px;width:100%;box-sizing:border-box;}
    .bk-award svg{color:#f97316;flex-shrink:0;margin-top:1px;}
    .bk-award a{font-family:'Inter',sans-serif;font-size:.85rem;color:#1a1a1a;text-decoration:none;line-height:1.5;transition:color .2s;}
    .bk-award a:hover{color:#f97316;}
    .bk-section-label{display:flex;align-items:center;gap:8px;font-family:'Inter',sans-serif;font-size:.65rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#9ca3af;margin-bottom:10px;}
    .bk-section-label .blue{color:#004B8D;} .bk-section-label .orange{color:#f97316;}
    .bk-items{list-style:none;padding:0;margin:0 0 20px;}
    .bk-items li{display:flex;align-items:baseline;gap:10px;margin-bottom:8px;font-family:'Inter',sans-serif;font-size:.875rem;color:#374151;line-height:1.6;}
    .bk-dot{width:5px;height:5px;border-radius:50%;background:#004B8D;flex-shrink:0;margin-top:7px;}
    .bk-dot-o{background:#f97316;}
    .bk-items a{color:#374151;text-decoration:none;border-bottom:1px solid transparent;transition:border-color .2s,color .2s;}
    .bk-items a:hover{color:#004B8D;border-bottom-color:#004B8D;}
    .bk-items .ml:hover{color:#f97316;border-bottom-color:#f97316;}
    .bk-btn-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px;}
    .bk-btn-p{display:inline-flex;align-items:center;gap:7px;background:#004B8D;color:white;font-family:'Inter',sans-serif;font-size:.8rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;padding:11px 22px;border:2px solid #004B8D;border-radius:6px;text-decoration:none;transition:background .2s,color .2s,transform .15s;box-shadow:0 2px 8px rgba(0,75,141,.25);}
    .bk-btn-p:hover{background:transparent;color:#004B8D;transform:translateY(-1px);}
    .bk-btn-s{display:inline-flex;align-items:center;gap:7px;background:transparent;color:#1a1a1a;font-family:'Inter',sans-serif;font-size:.8rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;padding:11px 22px;border:2px solid #1a1a1a;border-radius:6px;text-decoration:none;transition:background .2s,color .2s,transform .15s;}
    .bk-btn-s:hover{background:#1a1a1a;color:white;transform:translateY(-1px);}
    .bk-admin-btns{position:absolute;top:56px;right:0;display:flex;gap:8px;opacity:0;transition:opacity .2s;}
    .bk-entry:hover .bk-admin-btns{opacity:1;}
    .bk-edit-btn{padding:7px 10px;background:#004B8D;color:white;border:none;border-radius:4px;cursor:pointer;}
    .bk-del-btn{padding:7px 10px;background:#ef4444;color:white;border:none;border-radius:4px;cursor:pointer;}
    .bk-add-btn{display:inline-flex;align-items:center;gap:7px;background:#004B8D;color:white;font-family:'Inter',sans-serif;font-size:.85rem;font-weight:600;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;transition:background .2s;box-shadow:0 2px 8px rgba(0,75,141,.25);}
    .bk-add-btn:hover{background:#003870;}
    .bk-overlay{position:fixed;inset:0;z-index:50;background:rgba(26,26,26,.65);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;}
    .bk-modal{background:white;max-width:740px;width:100%;border-radius:12px;box-shadow:0 24px 80px rgba(0,0,0,.3);margin:auto;}
    .bk-modal-hd{padding:24px 28px;border-bottom:1px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;}
    .bk-modal-hd h2{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:#1a1a1a;margin:0;}
    .bk-close-btn{background:none;border:none;cursor:pointer;color:#9ca3af;padding:4px;border-radius:4px;transition:background .15s;}
    .bk-close-btn:hover{background:#f3f4f6;color:#1a1a1a;}
    .bk-modal-bd{padding:24px 28px;max-height:calc(100vh - 200px);overflow-y:auto;}
    .bk-field{margin-bottom:16px;}
    .bk-field label{display:block;font-family:'Inter',sans-serif;font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:6px;}
    .bk-inp{width:100%;padding:9px 13px;border:1.5px solid #e5e7eb;border-radius:6px;font-family:'Inter',sans-serif;font-size:.875rem;outline:none;transition:border-color .2s;box-sizing:border-box;}
    .bk-inp:focus{border-color:#004B8D;}
    .bk-g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    .bk-alabel{display:flex;justify-content:space-between;align-items:center;font-family:'Inter',sans-serif;font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#6b7280;margin-bottom:8px;}
    .bk-arow{display:flex;gap:6px;margin-bottom:6px;}
    .bk-arow .bk-inp{flex:1;}
    .bk-radd{background:none;border:1.5px solid #004B8D;color:#004B8D;padding:2px 9px;border-radius:4px;cursor:pointer;font-family:'Inter',sans-serif;font-size:.72rem;font-weight:600;transition:background .15s,color .15s;}
    .bk-radd:hover{background:#004B8D;color:white;}
    .bk-rrem{background:none;border:1.5px solid #fca5a5;color:#ef4444;padding:0 9px;border-radius:4px;cursor:pointer;transition:background .15s;}
    .bk-rrem:hover{background:#fee2e2;}
    .bk-modal-ft{padding:16px 28px;border-top:1px solid #f0f0f0;display:flex;justify-content:flex-end;gap:10px;}
    .bk-cancel{padding:9px 20px;background:transparent;color:#374151;border:1.5px solid #d1d5db;border-radius:6px;font-family:'Inter',sans-serif;font-size:.85rem;font-weight:500;cursor:pointer;transition:background .15s;}
    .bk-cancel:hover{background:#f9fafb;}
    .bk-save{padding:9px 22px;background:#004B8D;color:white;border:2px solid #004B8D;border-radius:6px;font-family:'Inter',sans-serif;font-size:.85rem;font-weight:600;cursor:pointer;transition:background .2s;}
    .bk-save:hover{background:#003870;}
    .bk-save:disabled{opacity:.5;cursor:not-allowed;}
    .bk-error{background:#fee2e2;border:1px solid #fca5a5;color:#991b1b;padding:10px 14px;border-radius:6px;font-family:'Inter',sans-serif;font-size:.85rem;margin-bottom:14px;}
    .bk-prev{height:80px;object-fit:cover;border-radius:4px;margin-top:6px;}
    .bk-loading{text-align:center;padding:80px 24px;font-family:'Inter',sans-serif;font-size:.85rem;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af;}
  `;
  document.head.appendChild(_bkStyle);
}

/* ─── Hardcoded initial data ─────────────────────────── */
const INITIAL_BOOKS = [
  {
    id: '1',
    title: "Organizational Theory, Design and Change",
    authors: "Jones, Gareth R., Gupta, Vishal & Gopakumar, KV",
    year: "2024",
    publisher: "Pearson: New Delhi",
    coverUrl: "https://placehold.co/400x600/e6e8ff/1a1a1a?text=Organizational+Theory",
    amazonLink: "https://www.amazon.in/Organizational-Theory-Design-Change-Revised/dp/9361597256",
    flipkartLink: "",
    reviews: [
      {
        text: "Read the book review by Deepak Bhatt, Group Senior Vice-President, Gujarat, BW Businessworld Media Private Limited",
        link: "https://www.deepakbbhatt.com/post/book-review-75-amazing-indians-who-made-a-difference-a-tribute-to-india-s-trailblazers"
      }
    ],
    media: [],
    awards: []
  },
  {
    id: '2',
    title: "75 Amazing Indians Who Made a Difference",
    authors: "Gupta, Vishal K. & Gupta, Vishal",
    year: "2024",
    publisher: "Vitasta Publishing: New Delhi",
    coverUrl: "https://placehold.co/400x600/fff7ed/1a1a1a?text=75+Amazing+Indians",
    amazonLink: "https://www.amazon.in/Amazing-Indians-Who-Made-Difference/dp/811967099X",
    flipkartLink: "https://www.flipkart.com/75-amazing-indians-made-difference/p/itm8606d83f38c0b?pid=9788119670994",
    reviews: [],
    media: [
      { type: 'video', text: "Conversation on the book at IIM Ahmedabad (August, 2021)", link: "https://www.youtube.com/watch?v=GNp7Z_75cRM" },
      { type: 'podcast', text: "Podcast on the book with Secrets of Storytellers (December, 2021)", link: "https://open.spotify.com/embed-podcast/episode/3Lg5ID3kgYuFYtBdrKwFF9" },
      { type: 'video', text: "Talk on the book at IIM Ranchi", link: "https://www.youtube.com/watch?v=toiEi6lzZwE&t=36s" }
    ],
    awards: []
  },
  {
    id: '3',
    title: "Demystifying Leadership: Unveiling the Mahabharata Code",
    authors: "Kaul, A. & Gupta, V.",
    year: "2021",
    publisher: "Bloomsbury: New Delhi",
    coverUrl: "https://placehold.co/400x600/e6e8ff/1a1a1a?text=Demystifying+Leadership",
    amazonLink: "https://www.amazon.in/Demystifying-Leadership-Unveiling-Mahabharata-Code-ebook/dp/B095RFN1XC",
    flipkartLink: "",
    reviews: [],
    media: [],
    awards: [
      { text: "Business Book of the Year award in 'Business Management' category by FICCI (2022)", link: "https://ficci.in/pressrelease-page.asp?nid=4501" }
    ]
  },
  {
    id: '4',
    title: "First Among Equals: TREAT Leadership for LEAP in a Knowledge-based World",
    authors: "Gupta, V.",
    year: "2020",
    publisher: "Bloomsbury: New Delhi",
    coverUrl: "https://placehold.co/400x600/fff7ed/1a1a1a?text=First+Among+Equals",
    amazonLink: "https://www.bloomsbury.com/in/first-among-equals-9789387471207/",
    flipkartLink: "",
    reviews: [
      { text: "Book review published in the South Asian Journal of Human Resources Management (SAJHRM)", link: "https://journals.sagepub.com/doi/full/10.1177/23220937211010231" },
      { text: "Book review published in People Matters", link: "https://www.peoplematters.in/blog/sports-books-movies/first-among-equals-t-r-e-a-t-leadership-for-l-e-a-p-in-a-knowledge-based-world-27720" },
      { text: "Book review published in BusinessWorld", link: "http://bwpeople.businessworld.in/article/First-Among-Equals-T-R-E-A-T-Leadership-for-L-E-A-P-in-a-Knowledge-Based-World-Prof-Vishal-Gupta-IIM-Ahmedabad-/16-07-2021-396895/" }
    ],
    media: [
      { type: 'video', text: "Conversation on the book at Ahmedabad University (July 31, 2021)", link: "https://www.youtube.com/watch?v=3nN_AF7NTEg" }
    ],
    awards: []
  }
];

/* ─── Firebase helpers ───────────────────────────────── */
const fetchBooks = async () => {
  try {
    const q = query(collection(db, 'books'), where('published', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

const sanitize = (book, coverUrl) => ({
  title: String(book.title || ''),
  authors: String(book.authors || ''),
  year: String(book.year || ''),
  publisher: String(book.publisher || ''),
  coverUrl: String(coverUrl || ''),
  amazonLink: String(book.amazonLink || ''),
  flipkartLink: String(book.flipkartLink || ''),
  reviews: (book.reviews || []).map(r => ({ text: String(r.text || ''), link: String(r.link || '') })),
  media: (book.media || []).map(m => ({ type: String(m.type || 'video'), text: String(m.text || ''), link: String(m.link || '') })),
  awards: (book.awards || []).map(a => ({ text: String(a.text || ''), link: String(a.link || '') })),
  published: true,
});

const addBook = async (book, file) => {
  try {
    let coverUrl = book.coverUrl || '';
    if (file) coverUrl = await uploadToCloudinary(file, 'books');
    await addDoc(collection(db, 'books'), { ...sanitize(book, coverUrl), createdAt: new Date().toISOString() });
    alert('Book added successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error adding book:', error);
    alert(`Error adding book: ${error.message}`);
    throw error;
  }
};

const addBookWithId = async (id, book, file) => {
  try {
    let coverUrl = book.coverUrl || '';
    if (file) coverUrl = await uploadToCloudinary(file, 'books');
    await setDoc(doc(db, 'books', id), { ...sanitize(book, coverUrl), createdAt: new Date().toISOString() });
    alert('Book saved successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error saving book:', error);
    alert(`Error saving book: ${error.message}`);
    throw error;
  }
};

const updateBook = async (id, book, file) => {
  try {
    let coverUrl = book.coverUrl || '';
    if (file) coverUrl = await uploadToCloudinary(file, 'books');
    await updateDoc(doc(db, 'books', String(id)), { ...sanitize(book, coverUrl), updatedAt: new Date().toISOString() });
    alert('Book updated successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error updating book:', error);
    alert(`Error updating book: ${error.message}`);
    throw error;
  }
};

const deleteBook = async (id) => {
  try {
    await deleteDoc(doc(db, 'books', String(id)));
    alert('Book deleted successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error deleting book:', error);
    alert(`Error deleting book: ${error.message}`);
    throw error;
  }
};

/* ─── Modal ──────────────────────────────────────────── */
function BookEditModal({ book, onClose, onSave }) {
  const [form, setForm] = useState({
    title: book?.title || '',
    authors: book?.authors || '',
    year: book?.year || '',
    publisher: book?.publisher || '',
    coverUrl: book?.coverUrl || '',
    amazonLink: book?.amazonLink || '',
    flipkartLink: book?.flipkartLink || '',
    reviews: Array.isArray(book?.reviews) ? book.reviews : [],
    media: Array.isArray(book?.media) ? book.media : [],
    awards: Array.isArray(book?.awards) ? book.awards : [],
  });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave({
        ...form,
        reviews: form.reviews.filter(r => r.text || r.link),
        media: form.media.filter(m => m.text || m.link),
        awards: form.awards.filter(a => a.text || a.link),
      }, file);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addItem = (f, d) => setForm(p => ({ ...p, [f]: [...(p[f] || []), d] }));
  const remItem = (f, i) => setForm(p => ({ ...p, [f]: (p[f] || []).filter((_, j) => j !== i) }));
  const updItem = (f, i, k, v) => {
    const arr = [...(form[f] || [])];
    arr[i] = { ...arr[i], [k]: v };
    setForm(p => ({ ...p, [f]: arr }));
  };

  return (
    <div className="bk-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bk-modal">
        <div className="bk-modal-hd">
          <h2>{book ? 'Edit Book' : 'Add New Book'}</h2>
          <button className="bk-close-btn" onClick={onClose}><FiX size={20} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="bk-modal-bd">
            {error && <div className="bk-error">{error}</div>}
            <div className="bk-field"><label>Title *</label>
              <input className="bk-inp" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="bk-field"><label>Authors *</label>
              <input className="bk-inp" required value={form.authors} onChange={e => setForm({ ...form, authors: e.target.value })} />
            </div>
            <div className="bk-g2">
              <div className="bk-field"><label>Year *</label>
                <input className="bk-inp" required value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
              </div>
              <div className="bk-field"><label>Publisher *</label>
                <input className="bk-inp" required value={form.publisher} onChange={e => setForm({ ...form, publisher: e.target.value })} />
              </div>
            </div>
            <div className="bk-field"><label>Cover Image</label>
              <input className="bk-inp" type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
              {file && <img src={URL.createObjectURL(file)} alt="preview" className="bk-prev" />}
              {form.coverUrl && !file && <img src={form.coverUrl} alt="current" className="bk-prev" />}
            </div>
            <div className="bk-g2">
              <div className="bk-field"><label>Amazon Link</label>
                <input className="bk-inp" type="url" value={form.amazonLink} onChange={e => setForm({ ...form, amazonLink: e.target.value })} />
              </div>
              <div className="bk-field"><label>Flipkart Link</label>
                <input className="bk-inp" type="url" value={form.flipkartLink} onChange={e => setForm({ ...form, flipkartLink: e.target.value })} />
              </div>
            </div>
            {[
              { f: 'reviews', label: 'Reviews', def: { text: '', link: '' }, keys: ['text', 'link'], phs: ['Review text', 'URL'] },
              { f: 'awards', label: 'Awards', def: { text: '', link: '' }, keys: ['text', 'link'], phs: ['Award description', 'URL'] },
            ].map(({ f, label, def, keys, phs }) => (
              <div className="bk-field" key={f}>
                <div className="bk-alabel">
                  <span>{label}</span>
                  <button type="button" className="bk-radd" onClick={() => addItem(f, { ...def })}>+ Add</button>
                </div>
                {(form[f] || []).map((item, i) => (
                  <div key={i} className="bk-arow">
                    {keys.map((k, ki) => (
                      <input key={k} className="bk-inp" type={ki === 1 ? 'url' : 'text'} placeholder={phs[ki]}
                        value={item[k] || ''} onChange={e => updItem(f, i, k, e.target.value)} />
                    ))}
                    <button type="button" className="bk-rrem" onClick={() => remItem(f, i)}><FiTrash2 size={13} /></button>
                  </div>
                ))}
              </div>
            ))}
            <div className="bk-field">
              <div className="bk-alabel">
                <span>Media & Talks</span>
                <button type="button" className="bk-radd" onClick={() => addItem('media', { type: 'video', text: '', link: '' })}>+ Add</button>
              </div>
              {(form.media || []).map((m, i) => (
                <div key={i} className="bk-arow">
                  <select className="bk-inp" style={{ width: 90, flex: 'none' }} value={m.type} onChange={e => updItem('media', i, 'type', e.target.value)}>
                    <option value="video">Video</option>
                    <option value="podcast">Podcast</option>
                  </select>
                  <input className="bk-inp" placeholder="Description" value={m.text} onChange={e => updItem('media', i, 'text', e.target.value)} />
                  <input className="bk-inp" type="url" placeholder="URL" value={m.link} onChange={e => updItem('media', i, 'link', e.target.value)} />
                  <button type="button" className="bk-rrem" onClick={() => remItem('media', i)}><FiTrash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="bk-modal-ft">
            <button type="button" className="bk-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="bk-save" disabled={saving}>{saving ? 'Saving…' : 'Save Book'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function Books() {
  const { isAdmin } = useAuth() || {};
  const { data: pageData } = useFirestoreDoc('content', 'books', {
    page_heading: 'Books',
    page_heading_em: 'Authored',
    page_subtitle: 'Published works bridging organizational theory, leadership dynamics, and ancient wisdom for the modern world.',
  });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { load(); }, []);

  const sortByYearDesc = (arr) => [...arr].sort((a, b) => parseInt(b.year) - parseInt(a.year));

  const load = async () => {
    try {
      const data = await fetchBooks();
      setBooks(data.length ? sortByYearDesc(data) : sortByYearDesc(INITIAL_BOOKS));
    } catch {
      setBooks(sortByYearDesc(INITIAL_BOOKS));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data, file) => {
    try { await addBook(data, file); await load(); setShowAdd(false); } catch {}
  };

  const handleUpdate = async (data, file) => {
    try {
      const id = String(editingBook.id);
      const existing = await fetchBooks();
      if (existing.some(b => b.id === id)) await updateBook(id, data, file);
      else await addBookWithId(id, data, file);
      await load();
      setEditingBook(null);
    } catch {}
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this book?')) {
      try { await deleteBook(id); await load(); } catch {}
    }
  };

  const fy = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: .6, ease: [.16, 1, .3, 1] } } };
  const stg = { visible: { transition: { staggerChildren: .09 } } };

  const awardsCount = books.reduce((n, b) => n + (b.awards?.length || 0), 0);
  const years = books.map(b => parseInt(b.year)).filter(Boolean);
  const yearRange = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : '—';

  return (
    <div className="bk-root">
      {showAdd && <BookEditModal book={null} onClose={() => setShowAdd(false)} onSave={handleAdd} />}
      {editingBook && <BookEditModal book={editingBook} onClose={() => setEditingBook(null)} onSave={handleUpdate} />}

      {/* Hero */}
      <section className="bk-hero">
        <motion.div className="bk-hero-inner" initial="hidden" animate="visible" variants={stg}>
          <motion.div variants={fy}>
            <div className="bk-accent-bar" />
            <h1>
              <EditableText
                collection="content"
                docId="books"
                field="page_heading"
                defaultValue={pageData?.page_heading || 'Books'}
              />{' '}<em style={{ fontStyle: 'italic', fontWeight: 400, color: '#6b7280' }}>
                <EditableText
                  collection="content"
                  docId="books"
                  field="page_heading_em"
                  defaultValue={pageData?.page_heading_em || 'Authored'}
                />
              </em>
            </h1>
            <p>
              <EditableText
                collection="content"
                docId="books"
                field="page_subtitle"
                defaultValue={pageData?.page_subtitle || 'Published works bridging organizational theory, leadership dynamics, and ancient wisdom for the modern world.'}
                multiline
              />
            </p>
          </motion.div>
          <motion.div variants={fy} className="bk-stats">
            <div className="bk-stat"><strong>{books.length || INITIAL_BOOKS.length}</strong><span>Books Published</span></div>
            <div className="bk-stat"><strong>{yearRange}</strong><span>Publication Range</span></div>
            {awardsCount > 0 && <div className="bk-stat"><strong>{awardsCount}</strong><span>Awards Won</span></div>}
          </motion.div>
        </motion.div>
      </section>

      {/* Admin bar */}
      {isAdmin && (
        <div className="bk-admin-bar">
          <div className="bk-admin-bar-inner">
            <button className="bk-add-btn" onClick={() => setShowAdd(true)}>
              <FiPlus size={15} /> Add New Book
            </button>
          </div>
        </div>
      )}

      {/* Book list */}
      {loading ? (
        <div className="bk-loading">Loading books…</div>
      ) : (
        <div className="bk-list" style={{ paddingTop: 48 }}>
          {books.map((book, idx) => (
            <motion.div
              key={book.id}
              className="bk-entry"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              variants={fy}
            >
              <div className="bk-entry-num">{String(idx + 1).padStart(2, '0')}</div>

              <div>
                <div className="bk-cover-wrap">
                  <img src={book.coverUrl} alt={book.title} />
                </div>
              </div>

              <div className="bk-content">
                {isAdmin && (
                  <div className="bk-admin-btns">
                    <button
                      title={book.showOnHome ? 'Remove from Home page' : 'Show on Home page'}
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, 'books', String(book.id)), { showOnHome: !book.showOnHome });
                          await load();
                        } catch (err) { alert(err.message); }
                      }}
                      style={{ padding: '5px 10px', background: book.showOnHome ? '#004B8D' : '#e5e7eb', color: book.showOnHome ? 'white' : '#374151', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}
                    >
                      {book.showOnHome ? '🏠 On Home' : '+ Home'}
                    </button>
                    <button className="bk-edit-btn" onClick={() => setEditingBook(book)}><FiEdit2 size={14} /></button>
                    <button className="bk-del-btn" onClick={() => handleDelete(book.id)}><FiTrash2 size={14} /></button>
                  </div>
                )}

                <span className="bk-year-tag">{book.year}</span>
                <h2 className="bk-title">{book.title}</h2>
                <p className="bk-authors">{book.authors}</p>
                <p className="bk-publisher">{book.publisher}</p>
                <div className="bk-divider" />

                {book.awards?.length > 0 && book.awards.map((a, i) => (
                  <div key={i} className="bk-award">
                    <FiAward size={15} />
                    <a href={a.link} target="_blank" rel="noopener noreferrer">{a.text}</a>
                  </div>
                ))}

                {book.reviews?.length > 0 && (
                  <>
                    <div className="bk-section-label"><FiBookOpen size={11} className="blue" /> <span>Selected Reviews</span></div>
                    <ul className="bk-items">
                      {book.reviews.map((r, i) => (
                        <li key={i}><span className="bk-dot" />
                          <a href={r.link} target="_blank" rel="noopener noreferrer">{r.text}</a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {book.media?.length > 0 && (
                  <>
                    <div className="bk-section-label"><FiVideo size={11} className="orange" /> <span>Talks & Media</span></div>
                    <ul className="bk-items">
                      {book.media.map((m, i) => (
                        <li key={i}>
                          <span className="bk-dot bk-dot-o" />
                          {m.type === 'video'
                            ? <FiVideo size={12} style={{ color: '#9ca3af', flexShrink: 0 }} />
                            : <FiMic size={12} style={{ color: '#9ca3af', flexShrink: 0 }} />}
                          <a href={m.link} target="_blank" rel="noopener noreferrer" className="ml">{m.text}</a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="bk-btn-row">
                  {book.amazonLink && (
                    <a href={book.amazonLink} target="_blank" rel="noopener noreferrer" className="bk-btn-p">
                      <FiShoppingCart size={14} /> Buy on Amazon
                    </a>
                  )}
                  {book.flipkartLink && (
                    <a href={book.flipkartLink} target="_blank" rel="noopener noreferrer" className="bk-btn-s">
                      <FiShoppingCart size={14} /> Buy on Flipkart
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
