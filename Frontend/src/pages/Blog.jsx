import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import { useAuth } from '../context/AuthContext';
import EditableText from '../components/EditableText';
import { FiCalendar, FiArrowRight, FiTag, FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';

/* ─── Font + CSS injection ───────────────────────────── */
if (typeof document !== 'undefined') {
  if (!document.getElementById('bl-fonts')) {
    const _blLink = document.createElement('link');
    _blLink.id = 'bl-fonts';
    _blLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap';
    _blLink.rel = 'stylesheet';
    document.head.appendChild(_blLink);
  }
  if (!document.getElementById('bl-styles')) {
    const _blStyle = document.createElement('style');
    _blStyle.id = 'bl-styles';
    _blStyle.textContent = `
      .bl-root{background:#ffffff;min-height:100vh;}
      .bl-hero{background:linear-gradient(135deg,#dce8f5 0%,#fff7ed 100%);padding:80px 24px 64px;border-bottom:1px solid rgba(0,75,141,.12);position:relative;overflow:hidden;}
      .bl-hero::before{content:'';position:absolute;top:-80px;right:-60px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle,rgba(249,115,22,.14) 0%,transparent 70%);pointer-events:none;}
      .bl-hero::after{content:'';position:absolute;bottom:-80px;left:-40px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,rgba(0,75,141,.1) 0%,transparent 70%);pointer-events:none;}
      .bl-hero-inner{max-width:1100px;margin:0 auto;text-align:center;position:relative;z-index:1;}
      .bl-accent-bar{width:80px;height:4px;background:#f97316;border-radius:2px;margin:0 auto 28px;}
      .bl-hero h1{font-family:'Playfair Display',Georgia,serif;font-size:clamp(2.8rem,6vw,5rem);font-weight:700;color:#1a1a1a;line-height:1.1;margin:0 0 20px;letter-spacing:-.02em;}
      .bl-hero p{font-family:'Inter',system-ui,sans-serif;font-size:1.1rem;color:#6b7280;max-width:600px;margin:0 auto 36px;line-height:1.7;}
      .bl-stats{display:flex;justify-content:center;flex-wrap:wrap;gap:12px;}
      .bl-stat{display:inline-flex;flex-direction:column;align-items:center;background:white;border-radius:12px;padding:16px 28px;box-shadow:0 4px 20px rgba(0,75,141,.1);border:1px solid rgba(0,75,141,.08);}
      .bl-stat strong{font-family:'Playfair Display',serif;font-size:1.8rem;font-weight:700;color:#004B8D;}
      .bl-stat span{font-family:'Inter',sans-serif;font-size:.72rem;font-weight:500;color:#9ca3af;letter-spacing:.09em;text-transform:uppercase;margin-top:2px;}
      .bl-layout{max-width:1100px;margin:0 auto;padding:0 24px 80px;display:grid;grid-template-columns:1fr 264px;gap:0 56px;}
      @media(max-width:900px){.bl-layout{grid-template-columns:1fr;}.bl-sidebar{display:none;}}
      .bl-main{}
      .bl-mobile-search{display:none;padding:20px 0;border-bottom:1px solid #f0f0f0;}
      @media(max-width:900px){.bl-mobile-search{display:block;}}
      .bl-search-inp{width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:6px;font-family:'Inter',sans-serif;font-size:.875rem;outline:none;transition:border-color .2s;box-sizing:border-box;}
      .bl-search-inp:focus{border-color:#004B8D;}
      .bl-entry{display:grid;grid-template-columns:52px 220px 1fr;gap:0 32px;padding:52px 0;border-bottom:1px solid #f0f0f0;position:relative;align-items:start;}
      @media(max-width:720px){.bl-entry{grid-template-columns:1fr;gap:20px;}.bl-entry-num{display:none;}}
      .bl-entry-num{font-family:'Playfair Display',serif;font-size:4.5rem;font-weight:700;color:transparent;-webkit-text-stroke:1.5px rgba(0,75,141,.15);line-height:1;padding-top:4px;user-select:none;}
      .bl-thumb-wrap{border-radius:6px;overflow:hidden;aspect-ratio:4/3;background:#f3f4f6;box-shadow:4px 8px 24px rgba(0,0,0,.12),1px 3px 8px rgba(0,0,0,.08);transition:transform .35s cubic-bezier(.16,1,.3,1),box-shadow .35s ease;}
      .bl-thumb-wrap:hover{transform:translateY(-5px);box-shadow:6px 16px 40px rgba(0,0,0,.14),2px 5px 12px rgba(0,0,0,.07);}
      .bl-thumb-wrap img{width:100%;height:100%;object-fit:cover;display:block;transition:opacity .3s;}
      .bl-thumb-wrap img:hover{opacity:.9;}
      .bl-content{padding-top:2px;}
      .bl-tags{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:14px;}
      .bl-cat-tag{display:inline-block;font-family:'Inter',sans-serif;font-size:.68rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#f97316;background:#fff7ed;padding:3px 10px;border-radius:2px;border:1px solid rgba(249,115,22,.25);}
      .bl-date-tag{display:inline-flex;align-items:center;gap:5px;font-family:'Inter',sans-serif;font-size:.72rem;color:#9ca3af;}
      .bl-title{font-family:'Playfair Display',Georgia,serif;font-size:clamp(1.35rem,2.2vw,1.8rem);font-weight:700;color:#1a1a1a;line-height:1.25;margin:0 0 14px;letter-spacing:-.01em;}
      .bl-title-link{color:inherit;text-decoration:none;transition:color .2s;}
      .bl-title-link:hover{color:#004B8D;}
      .bl-excerpt-wrap{border-left:3px solid #f97316;padding-left:16px;margin-bottom:20px;}
      .bl-excerpt{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-size:.95rem;color:#6b7280;line-height:1.7;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;}
      .bl-divider{width:36px;height:2px;background:#f97316;margin-bottom:20px;border-radius:1px;}
      .bl-read-btn{display:inline-flex;align-items:center;gap:7px;font-family:'Inter',sans-serif;font-size:.8rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#004B8D;background:transparent;border:2px solid #004B8D;padding:9px 18px;border-radius:6px;cursor:pointer;transition:background .2s,color .2s,transform .15s;text-decoration:none;}
      .bl-read-btn:hover{background:#004B8D;color:white;transform:translateY(-1px);}
      .bl-expand{overflow:hidden;transition:max-height .4s cubic-bezier(.16,1,.3,1),opacity .3s;max-height:0;opacity:0;}
      .bl-expand.open{max-height:600px;opacity:1;}
      .bl-expand-inner{background:#f0f5fa;border-radius:8px;padding:20px 22px;margin-top:16px;font-family:'Inter',sans-serif;font-size:.9rem;color:#374151;line-height:1.75;border-left:3px solid #004B8D;}
      .bl-empty{padding:80px 24px;text-align:center;}
      .bl-empty p:first-child{font-family:'Playfair Display',serif;font-size:2rem;color:#d1d5db;margin-bottom:6px;}
      .bl-empty p:last-child{font-family:'Inter',sans-serif;font-size:.875rem;color:#9ca3af;}
      .bl-skeleton-entry{padding:48px 0;border-bottom:1px solid #f0f0f0;display:grid;grid-template-columns:52px 220px 1fr;gap:0 32px;}
      @media(max-width:720px){.bl-skeleton-entry{grid-template-columns:1fr;gap:16px;}}
      .bl-sk{background:#f3f4f6;border-radius:4px;animation:bl-pulse 1.4s ease-in-out infinite;}
      @keyframes bl-pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
      .bl-sidebar{padding-top:48px;}
      .bl-sidebar-sticky{position:sticky;top:24px;display:flex;flex-direction:column;gap:28px;}
      .bl-sidebar-section{}
      .bl-sidebar-label{font-family:'Inter',sans-serif;font-size:.65rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#1a1a1a;margin-bottom:12px;}
      .bl-sidebar-divider{height:1px;background:#f0f0f0;}
      .bl-month-btn{width:100%;text-align:left;font-family:'Inter',sans-serif;font-size:.875rem;color:#6b7280;padding:7px 10px;background:transparent;border:none;cursor:pointer;border-radius:4px;transition:background .15s,color .15s;display:flex;justify-content:space-between;align-items:center;}
      .bl-month-btn:hover{background:#f0f5fa;color:#1a1a1a;}
      .bl-month-btn.active{font-weight:600;color:#004B8D;background:#dce8f5;}
      .bl-month-count{font-size:.72rem;color:#9ca3af;}
      .bl-count-note{font-family:'Inter',sans-serif;font-size:.75rem;color:#9ca3af;line-height:1.5;}
      .bl-count-note strong{color:#1a1a1a;}
    `;
    document.head.appendChild(_blStyle);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatDate = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return ''; }
};

const getMonthYear = (dateVal) => {
  if (!dateVal) return 'Uncategorized';
  try {
    const d = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch { return 'Uncategorized'; }
};

export default function Blog() {
  const { isAdmin } = useAuth() || {};
  const { data: pageData } = useFirestoreDoc('content', 'blog', {
    page_heading: 'Blog',
    page_subtitle: 'Thoughts on leadership, strategy, and the human side of management.',
  });
  const [activeMonth, setActiveMonth] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openBlogId, setOpenBlogId] = useState(null);

  // ✅ Real-time listener - no refresh key needed!
  const { data: blogsRaw, loading: blogsLoading } = useFirestoreCollection('blogs', [], true);

  const blogs = (blogsRaw || []).filter(b => b.published);

  // ── Filters ───────────────────────────────────────────────────────────────
  const filtered = blogs.filter(b => {
    const matchMonth = activeMonth === 'All' || getMonthYear(b.date) === activeMonth;
    const matchSearch = !searchQuery ||
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchMonth && matchSearch;
  });

  const months = ['All', ...Array.from(new Set(
    blogs.map(b => getMonthYear(b.date)).filter(m => m !== 'Uncategorized')
  ))];

  return (
    <div className="min-h-screen bg-white">

      {/* PAGE HEADER */}
      <div className="border-b-2 border-black">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h1
            className="font-['Playfair_Display'] font-bold text-black leading-none"
            style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)' }}
          >
            <EditableText
              collection="content"
              docId="blog"
              field="page_heading"
              defaultValue={pageData?.page_heading || 'Blog'}
              className="font-['Playfair_Display'] font-bold text-black"
            />
          </h1>
          <p className="mt-3 font-['Inter'] text-gray-500 text-base max-w-lg">
            <EditableText
              collection="content"
              docId="blog"
              field="page_subtitle"
              defaultValue={pageData?.page_subtitle || 'Thoughts on leadership, strategy, and the human side of management.'}
              className="font-['Inter'] text-gray-500 text-base"
              multiline
            />
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-0">

          {/* MAIN LIST */}
          <main className="flex-1 min-w-0 lg:pr-12 lg:border-r border-gray-200">

            {/* Mobile search */}
            <div className="lg:hidden py-6 border-b border-gray-200">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search blogs..."
                className="w-full px-4 py-2.5 border border-gray-300 font-['Inter'] text-sm focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {blogsLoading ? (
              <div className="py-16 space-y-12">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse border-b border-gray-100 pb-12">
                    <div className="h-6 bg-gray-100 w-16 mb-4 rounded" />
                    <div className="flex gap-8">
                      <div className="flex-1 space-y-3">
                        <div className="h-8 bg-gray-100 rounded w-3/4" />
                        <div className="h-4 bg-gray-100 rounded w-full" />
                        <div className="h-4 bg-gray-100 rounded w-5/6" />
                      </div>
                      <div className="w-48 h-36 bg-gray-100 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-2xl font-['Playfair_Display'] text-gray-400 mb-2">No articles found</p>
                <p className="text-sm font-['Inter'] text-gray-400">Try adjusting your search or filter.</p>
              </div>
            ) : (
              filtered.map((blog, index) => (
                <article key={blog.id} className="py-10 border-b border-gray-200 last:border-b-0">

                  {/* Numbered title */}
                  <h3
                    className="font-['Playfair_Display'] font-bold text-black leading-tight mb-5"
                    style={{ fontSize: 'clamp(1.35rem, 2.5vw, 1.9rem)' }}
                  >
                    <span className="text-gray-300 mr-2">{index + 1}.</span>
                    {isAdmin ? (
                      <EditableText
                        collection="blogs"
                        docId={blog.id}
                        field="title"
                        defaultValue={blog.title}
                        className="font-bold"
                        multiline={false}
                        modalClassName="rounded-2xl shadow-2xl border border-gray-100 p-4 bg-white"
                      />
                    ) : (
                      <Link
                        to={`/blog/${blog.slug || blog.id}`}
                        className="hover:text-[#004B8D] transition-colors duration-200"
                      >
                        {blog.title}
                      </Link>
                    )}
                  </h3>

                  {/* Two-column: text + image */}
                  <div className="flex flex-col sm:flex-row gap-8 items-start">

                    {/* Left: excerpt + meta + CTA */}
                    <div className="flex-1 min-w-0">
                      <blockquote className="border-l-4 border-[#004B8D] pl-4 mb-5">
                        <p className="font-['Playfair_Display'] italic text-gray-600 text-base leading-relaxed line-clamp-4">
                          {isAdmin ? (
                            <EditableText
                              collection="blogs"
                              docId={blog.id}
                              field="excerpt"
                              defaultValue={blog.excerpt}
                              multiline={true}
                              className="font-['Playfair_Display'] italic text-gray-600 text-base leading-relaxed line-clamp-4"
                              modalClassName="rounded-2xl shadow-2xl border border-gray-100 p-4 bg-white"
                            />
                          ) : blog.excerpt}
                        </p>
                      </blockquote>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-4 mb-5 text-xs font-['Inter'] text-gray-400">
                        {blog.date && (
                          <span className="flex items-center gap-1.5">
                            <FiCalendar size={11} />
                            {formatDate(blog.date)}
                          </span>
                        )}
                        {blog.category && (
                          <span className="flex items-center gap-1.5 text-[#004B8D]">
                            <FiTag size={11} />
                            {blog.category}
                          </span>
                        )}
                      </div>

                      {/* Read Blog & Expand Description */}
                      <button
                        className={`inline-flex items-center gap-2 font-['Inter'] font-bold text-sm text-[#004B8D] group focus:outline-none ${openBlogId === blog.id ? 'underline' : ''}`}
                        onClick={() => setOpenBlogId(openBlogId === blog.id ? null : blog.id)}
                      >
                        <span className="underline underline-offset-2 hover:no-underline">Read Blog</span>
                        <FiArrowRight size={14} className={`group-hover:translate-x-1 transition-transform duration-200 ${openBlogId === blog.id ? 'rotate-90' : ''}`} />
                      </button>
                      {/* Description Expand/Collapse */}
                      <div
                        className={`overflow-hidden transition-all duration-400 ${openBlogId === blog.id ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}
                      >
                        {openBlogId === blog.id && (
                          <div className="bg-[#ebf2f8] rounded-lg p-5 text-gray-700 font-['Inter'] text-base shadow-sm">
                            {isAdmin ? (
                              <EditableText
                                collection="blogs"
                                docId={blog.id}
                                field="content"
                                defaultValue={blog.content}
                                multiline={true}
                                className="w-full min-h-[120px]"
                                placeholder="Enter blog content..."
                                modalClassName="rounded-2xl shadow-2xl border border-gray-100 p-4 bg-white"
                              />
                            ) : blog.content || 'No description available.'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: image */}
                    <div className="w-full sm:w-52 lg:w-60 flex-shrink-0">
                      <Link to={`/blog/${blog.slug || blog.id}`} className="block overflow-hidden">
                        <img
                          src={blog.imageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop'}
                          alt={blog.title}
                          className="w-full h-40 sm:h-36 object-cover hover:opacity-90 transition-opacity duration-300"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/600x400/f0f1ff/3333FF?text=Article';
                          }}
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </main>

          {/* SIDEBAR */}
          <aside className="hidden lg:block w-56 flex-shrink-0 pl-10 pt-10">
            <div className="sticky top-8 space-y-8">

              {/* Search */}
              <div>
                <p className="text-xs font-['Inter'] font-bold uppercase tracking-[0.18em] text-black mb-3">Search blogs</p>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search blogs..."
                  className="w-full px-3 py-2 border border-gray-300 font-['Inter'] text-sm text-black placeholder-gray-400 focus:outline-none focus:border-black transition-colors"
                />
              </div>
              <div className="border-t border-gray-200" />

              {/* Blog Months */}
              <div>
                <p className="text-xs font-['Inter'] font-bold uppercase tracking-[0.18em] text-black mb-3">Blog Months</p>
                <ul className="space-y-0.5">
                  {months.map(month => (
                    <li key={month}>
                      <button
                        onClick={() => setActiveMonth(month)}
                        className={`w-full text-left text-sm font-['Inter'] py-1.5 px-2 transition-colors ${
                          activeMonth === month
                            ? 'font-bold text-[#004B8D] bg-[#ebf2f8]'
                            : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        {month}
                        {month !== 'All' && (
                          <span className="ml-1 text-gray-300 text-xs">
                            ({blogs.filter(b => getMonthYear(b.date) === month).length})
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200" />

              <p className="text-xs font-['Inter'] text-gray-400 leading-relaxed">
                Showing <strong className="text-black">{filtered.length}</strong> of{' '}
                <strong className="text-black">{blogs.length}</strong> articles
              </p>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
