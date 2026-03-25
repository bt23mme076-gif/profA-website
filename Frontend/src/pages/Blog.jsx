import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiCalendar, FiClock, FiSearch, FiTag, FiPlus, FiHome, FiLoader, FiStar } from 'react-icons/fi';
import { addDoc, updateDoc, collection, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import { useAuth } from '../context/AuthContext';
import EditableText from '../components/EditableText';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=900&fit=crop';

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const viewportOptions = { once: true, margin: '0px 0px -80px 0px', amount: 0.15 };

const getTimestamp = (dateVal) => {
  if (!dateVal) return 0;

  try {
    const date = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
    const time = date.getTime();
    return Number.isNaN(time) ? 0 : time;
  } catch {
    return 0;
  }
};

const formatDate = (dateVal) => {
  if (!dateVal) return '';

  try {
    const date = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

const getMonthYear = (dateVal) => {
  if (!dateVal) return 'Unscheduled';

  try {
    const date = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return 'Unscheduled';
  }
};

const estimateReadTime = (blog) => {
  const sourceText = [blog?.excerpt, blog?.content].filter(Boolean).join(' ').trim();
  if (!sourceText) return '2 min read';

  const wordCount = sourceText.split(/\s+/).filter(Boolean).length;
  return `${Math.max(2, Math.ceil(wordCount / 180))} min read`;
};

const getBlogHref = (blog) => `/blog/${blog.slug || blog.id}`;

export default function Blog() {
  const { isAdmin } = useAuth() || {};
  const { data: pageData } = useFirestoreDoc('content', 'blog', {
    page_heading: 'Blog',
    page_subtitle: 'Thoughts on leadership, strategy, and the human side of management.',
  });
  const { data: blogsRaw, loading: blogsLoading } = useFirestoreCollection('blogs', [], true);

  const [activeMonth, setActiveMonth] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openBlogId, setOpenBlogId] = useState(null);
  const [addingBlog, setAddingBlog] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const handleAddBlog = async () => {
    setAddingBlog(true);
    try {
      await addDoc(collection(db, 'blogs'), {
        title: 'New Blog Post',
        excerpt: 'Add your excerpt here...',
        content: 'Start writing your blog content here...',
        imageUrl: '',
        author: 'Prof. Vishal Gupta',
        date: new Date().toISOString(),
        published: false,
        showOnHome: false,
        category: '',
        slug: `blog-${Date.now()}`,
      });
      showToast('New draft created — scroll down to find and edit it.');
    } catch {
      showToast('Error creating blog post. Please try again.');
    } finally {
      setAddingBlog(false);
    }
  };

  const handleToggleHome = async (blog) => {
    try {
      await updateDoc(doc(db, 'blogs', blog.id), { showOnHome: !blog.showOnHome });
      showToast(blog.showOnHome ? 'Removed from Home page.' : 'Pinned to Home page blog section.');
    } catch {
      showToast('Error updating blog. Please try again.');
    }
  };

  // Admins see all blogs (including unpublished drafts)
  const blogs = [...(blogsRaw || [])]
    .filter((blog) => isAdmin || blog.published)
    .sort((left, right) => getTimestamp(right.date) - getTimestamp(left.date));

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const monthMap = blogs.reduce((accumulator, blog) => {
    const label = getMonthYear(blog.date);
    accumulator[label] = (accumulator[label] || 0) + 1;
    return accumulator;
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
      blog.content?.toLowerCase().includes(normalizedQuery) ||
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

      {/* ── Toast notification ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#0f2745] px-6 py-3 font-['Inter'] text-sm font-medium text-white shadow-2xl">
          {toast}
        </div>
      )}

      <section className="relative overflow-hidden border-b border-[#17365f] bg-[#0f2745] text-white">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at top left, rgba(245, 196, 0, 0.22), transparent 32%), radial-gradient(circle at 85% 20%, rgba(255, 255, 255, 0.14), transparent 26%), linear-gradient(135deg, #112b4f 0%, #0c1d35 100%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,transparent,rgba(5,13,23,0.42))]" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 xl:py-24">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl">
            <motion.div variants={fadeInUp} className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <span className="font-['Inter'] text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#f5c400]">
                Essays, notes, and teaching reflections
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="max-w-3xl font-['Playfair_Display'] text-5xl font-bold leading-[0.95] text-white sm:text-6xl lg:text-7xl text-center"
            >
              <EditableText
                collection="content"
                docId="blog"
                field="page_heading"
                defaultValue={pageData?.page_heading || 'Blog'}
                className="font-['Playfair_Display'] font-bold text-white"
              />
            </motion.h1>

            <motion.div variants={fadeInUp} className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              <EditableText
                collection="content"
                docId="blog"
                field="page_subtitle"
                defaultValue={pageData?.page_subtitle || 'Thoughts on leadership, strategy, and the human side of management.'}
                className="font-['Inter'] text-slate-200"
                multiline
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/15 bg-white/8 px-5 py-5 backdrop-blur-sm">
                <p className="font-['Playfair_Display'] text-3xl font-semibold text-white">{blogs.length}</p>
                <p className="mt-2 font-['Inter'] text-xs uppercase tracking-[0.2em] text-slate-300">Published articles</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/8 px-5 py-5 backdrop-blur-sm">
                <p className="font-['Playfair_Display'] text-3xl font-semibold text-white">{archiveMonths}</p>
                <p className="mt-2 font-['Inter'] text-xs uppercase tracking-[0.2em] text-slate-300">Archive months</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/8 px-5 py-5 backdrop-blur-sm">
                <p className="font-['Playfair_Display'] text-3xl font-semibold text-white">{filteredBlogs.length}</p>
                <p className="mt-2 font-['Inter'] text-xs uppercase tracking-[0.2em] text-slate-300">Visible now</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="self-end"
          >
            <div className="overflow-hidden rounded-4xl border border-white/15 bg-white/10 shadow-[0_30px_80px_rgba(4,11,20,0.38)] backdrop-blur-sm">
              <div className="relative aspect-4/3 overflow-hidden border-b border-white/10">
                <img
                  src={latestBlog?.imageUrl || FALLBACK_IMAGE}
                  alt={latestBlog?.title || 'Latest article'}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.target.src = FALLBACK_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,37,0.05),rgba(8,20,37,0.7))]" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="font-['Inter'] text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#f5c400]">
                    Latest from the journal
                  </p>
                  <p className="mt-3 font-['Playfair_Display'] text-2xl font-semibold leading-tight text-white">
                    {latestBlog?.title || 'Fresh writing will appear here.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 px-6 py-6">
                <div className="flex flex-wrap gap-3 text-xs text-slate-200">
                  {latestBlog?.date && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 font-['Inter']">
                      <FiCalendar size={12} />
                      {formatDate(latestBlog.date)}
                    </span>
                  )}
                  {latestBlog?.category && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 font-['Inter']">
                      <FiTag size={12} />
                      {latestBlog.category}
                    </span>
                  )}
                </div>

                <p className="font-['Inter'] text-sm leading-7 text-slate-200">
                  {latestBlog?.excerpt || 'The archive is connected. Publish a post to feature it here automatically.'}
                </p>

                {latestBlog && !isAdmin && (
                  <Link
                    to={getBlogHref(latestBlog)}
                    className="inline-flex items-center gap-2 font-['Inter'] text-sm font-semibold uppercase tracking-[0.18em] text-white transition-transform duration-200 hover:translate-x-1"
                  >
                    Read article
                    <FiArrowRight size={14} />
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
              Admin mode — {blogsRaw?.length ?? 0} total posts ({blogs.filter(b => !b.published).length} drafts)
            </p>
            <button
              type="button"
              onClick={handleAddBlog}
              disabled={addingBlog}
              className="inline-flex items-center gap-2 rounded-full bg-[#004b8d] px-5 py-2.5 font-['Inter'] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {addingBlog ? (
                <FiLoader size={15} className="animate-spin" />
              ) : (
                <FiPlus size={15} />
              )}
              {addingBlog ? 'Creating…' : 'Add New Blog'}
            </button>
          </div>
        </div>
      )}

      <section className="relative z-10 -mt-8 pb-20 lg:-mt-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="rounded-4xl border border-[#d8e0ea] bg-white p-6 shadow-[0_24px_70px_rgba(15,39,69,0.08)] lg:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div>
                <p className="font-['Inter'] text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#004b8d]">
                  Browse the archive
                </p>
                <div className="relative mt-4">
                  <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by title, topic, or excerpt"
                    className="w-full rounded-2xl border border-[#d6deea] bg-[#f7f9fc] py-4 pl-12 pr-4 font-['Inter'] text-sm text-[#10233d] outline-none transition-colors placeholder:text-gray-400 focus:border-[#004b8d] focus:bg-white"
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-[#eef4fa] px-5 py-4">
                <p className="font-['Inter'] text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#5f748f]">
                  Current filter
                </p>
                <p className="mt-2 font-['Playfair_Display'] text-2xl font-semibold text-[#10233d]">{activeLabel}</p>
                <p className="mt-2 font-['Inter'] text-sm leading-6 text-[#5f748f]">
                  Showing {filteredBlogs.length} of {blogs.length} published articles.
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
                  {month.label}
                  <span className="ml-2 text-xs opacity-80">{month.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {blogsLoading ? (
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="overflow-hidden rounded-4xl border border-[#d8e0ea] bg-white p-6 shadow-sm lg:p-8">
                <div className="animate-pulse space-y-5">
                  <div className="h-72 rounded-3xl bg-[#e8edf4]" />
                  <div className="h-4 w-32 rounded-full bg-[#e8edf4]" />
                  <div className="h-10 w-3/4 rounded-full bg-[#e8edf4]" />
                  <div className="h-20 rounded-[1.2rem] bg-[#e8edf4]" />
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                {[1, 2].map((item) => (
                  <div key={item} className="animate-pulse overflow-hidden rounded-[1.8rem] border border-[#d8e0ea] bg-white p-5 shadow-sm">
                    <div className="h-44 rounded-[1.3rem] bg-[#e8edf4]" />
                    <div className="mt-5 h-4 w-24 rounded-full bg-[#e8edf4]" />
                    <div className="mt-4 h-7 w-4/5 rounded-full bg-[#e8edf4]" />
                    <div className="mt-4 h-16 rounded-2xl bg-[#e8edf4]" />
                  </div>
                ))}
              </div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="rounded-4xl border border-dashed border-[#c9d6e6] bg-white px-6 py-20 text-center shadow-sm">
              <p className="font-['Inter'] text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#004b8d]">
                No matches right now
              </p>
              <h2 className="mt-4 font-['Playfair_Display'] text-4xl font-semibold text-[#10233d]">
                Refine the search or switch the archive month.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl font-['Inter'] text-base leading-7 text-[#5f748f]">
                The current combination of search terms and month filters does not return any published posts.
              </p>
            </div>
          ) : (
            <div className="space-y-14">
              {featuredBlog && (
                <motion.article
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOptions}
                  variants={fadeInUp}
                  className="overflow-hidden rounded-4xl border border-[#d8e0ea] bg-white shadow-[0_24px_70px_rgba(15,39,69,0.08)]"
                >
                  <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="relative min-h-80 overflow-hidden bg-[#dce8f5] lg:min-h-full">
                      <img
                        src={featuredBlog.imageUrl || FALLBACK_IMAGE}
                        alt={featuredBlog.title}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.target.src = FALLBACK_IMAGE;
                        }}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,37,0.04),rgba(8,20,37,0.52))]" />
                      <div className="absolute left-6 top-6 inline-flex rounded-full bg-white/88 px-4 py-2 backdrop-blur-sm">
                        <span className="font-['Inter'] text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#004b8d]">
                          Featured article
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-7 sm:p-10">
                      <div>
                        <div className="flex flex-wrap gap-3 text-xs text-[#60758d]">
                          {featuredBlog.date && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#eef4fa] px-3 py-1.5 font-['Inter']">
                              <FiCalendar size={12} />
                              {formatDate(featuredBlog.date)}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-2 rounded-full bg-[#eef4fa] px-3 py-1.5 font-['Inter']">
                            <FiClock size={12} />
                            {estimateReadTime(featuredBlog)}
                          </span>
                          {featuredBlog.category && (
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#fff3e7] px-3 py-1.5 font-['Inter'] text-[#c45a04]">
                              <FiTag size={12} />
                              {featuredBlog.category}
                            </span>
                          )}
                        </div>

                        <div className="mt-5 font-['Playfair_Display'] text-[clamp(2rem,3vw,3.25rem)] font-semibold leading-[1.05] text-[#10233d]">
                          {isAdmin ? (
                            <EditableText
                              collection="blogs"
                              docId={featuredBlog.id}
                              field="title"
                              defaultValue={featuredBlog.title}
                              className="font-['Playfair_Display'] font-semibold text-[#10233d]"
                              multiline={false}
                              modalClassName="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl"
                            />
                          ) : (
                            <Link to={getBlogHref(featuredBlog)} className="transition-colors duration-200 hover:text-[#004b8d]">
                              {featuredBlog.title}
                            </Link>
                          )}
                        </div>

                        <div className="mt-6 rounded-3xl border border-[#e4ebf3] bg-[#f7f9fc] p-5">
                          {isAdmin ? (
                            <EditableText
                              collection="blogs"
                              docId={featuredBlog.id}
                              field="excerpt"
                              defaultValue={featuredBlog.excerpt}
                              className="font-['Playfair_Display'] text-lg italic leading-8 text-[#54687e]"
                              multiline
                              modalClassName="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl"
                            />
                          ) : (
                            <p className="font-['Playfair_Display'] text-lg italic leading-8 text-[#54687e]">
                              {featuredBlog.excerpt}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-8 space-y-5">
                        <div className="flex flex-wrap gap-3">
                          {!isAdmin && (
                            <Link
                              to={getBlogHref(featuredBlog)}
                              className="inline-flex items-center gap-2 rounded-full bg-[#004b8d] px-6 py-3 font-['Inter'] text-sm font-semibold uppercase tracking-[0.16em] text-white transition-transform duration-200 hover:-translate-y-0.5"
                            >
                              Read full article
                              <FiArrowRight size={15} />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => setOpenBlogId(openBlogId === featuredBlog.id ? null : featuredBlog.id)}
                            className="inline-flex items-center gap-2 rounded-full border border-[#bfd0e4] px-6 py-3 font-['Inter'] text-sm font-semibold uppercase tracking-[0.16em] text-[#10233d] transition-colors duration-200 hover:border-[#004b8d] hover:text-[#004b8d]"
                          >
                            {openBlogId === featuredBlog.id ? 'Hide preview' : 'Quick preview'}
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleToggleHome(featuredBlog)}
                              className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 font-['Inter'] text-sm font-semibold uppercase tracking-[0.16em] transition-colors duration-200 ${
                                featuredBlog.showOnHome
                                  ? 'border-[#f5c400] bg-[#fffbea] text-[#9a7200] hover:border-red-300 hover:bg-red-50 hover:text-red-600'
                                  : 'border-[#bfd0e4] text-[#10233d] hover:border-[#f5c400] hover:bg-[#fffbea] hover:text-[#9a7200]'
                              }`}
                            >
                              <FiHome size={14} />
                              {featuredBlog.showOnHome ? 'Featured on Home' : 'Feature on Home'}
                            </button>
                          )}
                        </div>

                        {openBlogId === featuredBlog.id && (
                          <div className="rounded-3xl border border-[#dbe5f0] bg-[#eef4fa] p-5 font-['Inter'] text-sm leading-7 text-[#324860] sm:text-base">
                            {isAdmin ? (
                              <EditableText
                                collection="blogs"
                                docId={featuredBlog.id}
                                field="content"
                                defaultValue={featuredBlog.content}
                                multiline
                                className="w-full min-h-35"
                                placeholder="Enter blog content..."
                                modalClassName="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl"
                              />
                            ) : (
                              featuredBlog.content || featuredBlog.excerpt || 'No preview available.'
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              )}

              {remainingBlogs.length > 0 && (
                <div>
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOptions}
                    variants={fadeInUp}
                    className="mb-8 flex flex-col gap-3 border-b border-[#d8e0ea] pb-6 sm:flex-row sm:items-end sm:justify-between"
                  >
                    <div>
                      <p className="font-['Inter'] text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#004b8d]">
                        More writing
                      </p>
                      <h2 className="mt-2 font-['Playfair_Display'] text-4xl font-semibold text-[#10233d]">
                        Archive highlights
                      </h2>
                    </div>
                    <p className="max-w-xl font-['Inter'] text-sm leading-7 text-[#5f748f]">
                      A curated archive of essays on management, institutions, leadership, and reflective practice.
                    </p>
                  </motion.div>

                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOptions}
                    variants={staggerContainer}
                    className="grid gap-7 md:grid-cols-2 xl:grid-cols-3"
                  >
                    {remainingBlogs.map((blog) => (
                      <motion.article
                        key={blog.id}
                        variants={fadeInUp}
                        className="group overflow-hidden rounded-[1.8rem] border border-[#d8e0ea] bg-white shadow-[0_18px_50px_rgba(15,39,69,0.06)] transition-transform duration-300 hover:-translate-y-1"
                      >
                        <div className="relative aspect-16/11 overflow-hidden bg-[#dce8f5]">
                          <img
                            src={blog.imageUrl || FALLBACK_IMAGE}
                            alt={blog.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            onError={(event) => {
                              event.target.src = FALLBACK_IMAGE;
                            }}
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
                            <span className="absolute right-4 bottom-4 inline-flex items-center gap-1 rounded-full bg-[#f5c400] px-3 py-1.5 font-['Inter'] text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#5a4500]">
                              <FiHome size={10} /> Home
                            </span>
                          )}
                        </div>

                        <div className="space-y-5 p-6">
                          <div className="flex flex-wrap gap-3 text-xs text-[#60758d]">
                            {blog.date && (
                              <span className="inline-flex items-center gap-2 font-['Inter']">
                                <FiCalendar size={12} />
                                {formatDate(blog.date)}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-2 font-['Inter']">
                              <FiClock size={12} />
                              {estimateReadTime(blog)}
                            </span>
                          </div>

                          <div className="font-['Playfair_Display'] text-[1.7rem] font-semibold leading-tight text-[#10233d]">
                            {isAdmin ? (
                              <EditableText
                                collection="blogs"
                                docId={blog.id}
                                field="title"
                                defaultValue={blog.title}
                                className="font-['Playfair_Display'] font-semibold text-[#10233d]"
                                multiline={false}
                                modalClassName="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl"
                              />
                            ) : (
                              <Link to={getBlogHref(blog)} className="transition-colors duration-200 hover:text-[#004b8d]">
                                {blog.title}
                              </Link>
                            )}
                          </div>

                          {isAdmin ? (
                            <EditableText
                              collection="blogs"
                              docId={blog.id}
                              field="excerpt"
                              defaultValue={blog.excerpt}
                              className="font-['Inter'] text-sm leading-7 text-[#5f748f]"
                              multiline
                              modalClassName="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl"
                            />
                          ) : (
                            <p className="font-['Inter'] text-sm leading-7 text-[#5f748f]">
                              {blog.excerpt}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e8eef5] pt-5">
                            {!isAdmin ? (
                              <Link
                                to={getBlogHref(blog)}
                                className="inline-flex items-center gap-2 font-['Inter'] text-sm font-semibold uppercase tracking-[0.14em] text-[#004b8d] transition-transform duration-200 hover:translate-x-1"
                              >
                                Read article
                                <FiArrowRight size={14} />
                              </Link>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleHome(blog)}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 font-['Inter'] text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-200 ${
                                  blog.showOnHome
                                    ? 'border-[#f5c400] bg-[#fffbea] text-[#9a7200] hover:border-red-300 hover:bg-red-50 hover:text-red-600'
                                    : 'border-[#d6deea] text-[#51657d] hover:border-[#f5c400] hover:bg-[#fffbea] hover:text-[#9a7200]'
                                }`}
                              >
                                <FiHome size={12} />
                                {blog.showOnHome ? 'On Home ✔' : 'Feature on Home'}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setOpenBlogId(openBlogId === blog.id ? null : blog.id)}
                              className="font-['Inter'] text-xs font-semibold uppercase tracking-[0.16em] text-[#6f8298] transition-colors duration-200 hover:text-[#004b8d]"
                            >
                              {openBlogId === blog.id ? 'Close preview' : 'Preview'}
                            </button>
                          </div>

                          {openBlogId === blog.id && (
                            <div className="rounded-[1.25rem] bg-[#eef4fa] p-4 font-['Inter'] text-sm leading-7 text-[#324860]">
                              {isAdmin ? (
                                <EditableText
                                  collection="blogs"
                                  docId={blog.id}
                                  field="content"
                                  defaultValue={blog.content}
                                  multiline
                                  className="w-full min-h-30"
                                  placeholder="Enter blog content..."
                                  modalClassName="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xl"
                                />
                              ) : (
                                blog.content || blog.excerpt || 'No preview available.'
                              )}
                            </div>
                          )}
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
