import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import EditableText from '../components/EditableText';
import { FiArrowRight, FiBookOpen, FiStar, FiCheck, FiCalendar } from 'react-icons/fi';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { subscribeToNewsletter } from '../utils/newsletter';
import { where, orderBy, limit } from 'firebase/firestore';

// ─── Color palette (Website_colours.pdf)
// bg-white    → sections 1,2,4,6   bg-[#ebf2f8] → sections 3,5,8 (subtle blue-tint)
// #004B8D / #004B8D → blue  |  #004B8D / #CC5200 → orange  |  #111111 → text


// ─── Animation variants ──────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
};
const fadeInLeft = {
  hidden: { opacity: 0, x: 0 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};
const fadeInRight = {
  hidden: { opacity: 0, x: 0 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
};
const viewportOptions = { once: true, margin: '0px 0px -60px 0px', amount: 0.15 };

export default function Home() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return '';
    try {
      const d = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch { return ''; }
  };

  // ─── Firestore ─────────────────────────────────────────────────────────────
  const { data, loading } = useFirestoreDoc('content', 'home', {
    hero_greeting: "PROFESSOR • RESEARCHER • AUTHOR",
    hero_title: "Creating Happy Leaders",
    hero_name: "Prof. Vishal Gupta",
    hero_subtitle: "IIM Ahmedabad Professor. Researcher. Thought Leader.",
    hero_description: "Professor in Organizational Behavior at the Indian Institute of Management Ahmedabad (IIMA)",
    hero_credential1: "Fellow, IIM Lucknow",
    hero_credential2: "B.E. (Hons.) EEE, BITS-Pilani",
    hero_linkedin: "https://in.linkedin.com/in/vishal-gupta-iima",
    hero_address: "502, Forum Tower, IIMA New Campus",
    hero_phone: "+91-79-7152-4935",
    courses_heading: "Management Courses",
    course1_title: "The Science of Leadership",
    course1_description: "Master the art and science of leading high-performing teams in complex organizational environments.",
    course1_youtube: "",
    course2_title: "Strategy for Executives",
    course2_description: "Develop strategic thinking capabilities to drive innovation and competitive advantage in dynamic markets.",
    course2_youtube: "",
    blog_heading: "Recent Blogs",
    blog1_title: "The Future of Strategic Leadership in Digital Age",
    blog1_excerpt: "Exploring how leaders can navigate uncertainty and drive transformation in rapidly evolving business landscapes.",
    blog1_image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    blog2_title: "Building Resilient Organizations Through Adaptive Strategy",
    blog2_excerpt: "Key insights on developing organizational capabilities that enable sustainable competitive advantage.",
    blog2_image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
    blog3_title: "The Psychology of Decision-Making in Executive Teams",
    blog3_excerpt: "Understanding cognitive biases and behavioral patterns that shape strategic choices at the highest level.",
    blog3_image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
    books_heading: "Published Books",
    book1_title: "Leading Through Complexity",
    book1_description: "A comprehensive guide to navigating uncertainty and driving organizational change.",
    book1_image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    book2_title: "The Strategic Mindset",
    book2_description: "Developing the cognitive capabilities required for effective strategic leadership.",
    book2_image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
    book3_title: "Organizational Behavior in Practice",
    book3_description: "Real-world applications of behavioral science in modern organizations.",
    book3_image: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop",
    speaking_heading: "Speaking Engagements with Prof. Gupta",
    speaking_description: "Prof. Gupta delivers keynotes, executive workshops, and thought-provoking talks at leading organizations, conferences, and academic events around the world.",
    contact_map_image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=800&fit=crop",
    newsletter_heading: "Wisdom delivered to your inbox.",
    newsletter_description: "Don't miss out on new insights on leadership, strategy, and organizational excellence. Sign up for the latest research findings, course updates, and thought-provoking ideas."
  });

  const { data: blogs, loading: blogsLoading } = useFirestoreCollection('blogs', [
    where('published', '==', true),
    orderBy('date', 'desc'),
    limit(6)
  ]);

  const { data: courses, loading: coursesLoading } = useFirestoreCollection('courses', [
    where('published', '==', true),
    limit(6)
  ]);

  const { data: testimonialsRaw, loading: testimonialsLoading } = useFirestoreCollection('testimonials', [
    where('published', '==', true)
  ]);
  const testimonials = testimonialsRaw?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

  const { data: trainingLogosRaw, loading: logosLoading } = useFirestoreCollection('training_partners', [
    where('published', '==', true)
  ]);
  const trainingLogos = trainingLogosRaw?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

  const { data: booksData, loading: booksLoading } = useFirestoreCollection('books', [
    where('published', '==', true)
  ]);

  // ─── Newsletter ────────────────────────────────────────────────────────────
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNewsletterStatus({ message: '', type: '' });
    const result = await subscribeToNewsletter(newsletterEmail);
    setNewsletterStatus({ message: result.message, type: result.success ? 'success' : 'error' });
    if (result.success) {
      setNewsletterEmail('');
      setTimeout(() => setNewsletterStatus({ message: '', type: '' }), 5000);
    }
    setIsSubmitting(false);
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading || blogsLoading || coursesLoading || testimonialsLoading || logosLoading || booksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#004B8D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-['Inter'] text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ─── Blog fallback data ────────────────────────────────────────────────────
  const homeBlogs = (blogs || []).filter(b => b.showOnHome);
  const recentBlogs = homeBlogs.length > 0 ? homeBlogs : (blogs && blogs.length > 0) ? blogs : [
    { id: 'b1', title: data.blog1_title, excerpt: data.blog1_excerpt, imageUrl: data.blog1_image, date: '2026-02-01', slug: 'blog-1' },
    { id: 'b2', title: data.blog2_title, excerpt: data.blog2_excerpt, imageUrl: data.blog2_image, date: '2026-01-28', slug: 'blog-2' },
    { id: 'b3', title: data.blog3_title, excerpt: data.blog3_excerpt, imageUrl: data.blog3_image, date: '2026-01-15', slug: 'blog-3' },
  ];

  // ─── Books data ─────────────────────────────────────────────────────────────
  const homeBooksList = (booksData || []).filter(b => b.showOnHome);
  const staticBooksList = [
    { tf: 'book1_title', df: 'book1_description', imgf: 'book1_image', linkf: 'book1_link', fb: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop' },
    { tf: 'book2_title', df: 'book2_description', imgf: 'book2_image', linkf: 'book2_link', fb: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop' },
    { tf: 'book3_title', df: 'book3_description', imgf: 'book3_image', linkf: 'book3_link', fb: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop' },
  ];

  return (
    <div className="bg-white">

      {/* ══════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════ */}
      <section
        className="min-h-screen grid lg:grid-cols-2 items-center px-4 sm:px-6 lg:px-16 pt-0 pb-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a2d52 0%, #1e3461 40%, #162647 100%)' }}
      >
        {/* Left: Text */}
        <div className="space-y-5 sm:space-y-6 max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Gold tag line */}
            <EditableText
              field="hero_greeting"
              defaultValue={data.hero_greeting}
              className="text-xs sm:text-sm font-['Inter'] font-semibold tracking-[0.25em] uppercase text-[#F5C400] mb-5 block"
            />
            {/* Big white heading */}
            <EditableText
              field="hero_title"
              defaultValue={data.hero_title || 'Creating Happy Leaders'}
              className="text-4xl sm:text-5xl lg:text-[5rem] font-['Playfair_Display'] font-bold text-white leading-[1.05] mb-3 block"
            />
            {/* Gold name subtitle */}
            <EditableText
              field="hero_name"
              defaultValue={data.hero_name}
              className="text-xl sm:text-2xl lg:text-3xl font-['Playfair_Display'] text-[#F5C400] font-semibold mb-5 block"
            />
            {/* Description */}
            <EditableText
              field="hero_description"
              defaultValue={data.hero_description}
              className="text-sm sm:text-base lg:text-lg font-['Inter'] text-gray-300 leading-relaxed block mb-5"
              multiline={true}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="space-y-4"
          >
            {/* CTA Button */}
            <div className="flex flex-wrap gap-3">
              <Link to="/about">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: '#004B8D' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#F5C400] px-7 py-3.5 font-['Inter'] font-bold text-[#0B1628] text-sm rounded-md shadow-lg"
                >
                  Get in Touch
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right: Square Portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-12 lg:mt-0 z-10 flex items-center justify-center"
        >
          {/* Square portrait */}
          <div
            className="relative overflow-hidden rounded-2xl w-64 sm:w-80 lg:w-[400px]"
            style={{
              aspectRatio: '3/4',
              boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
            }}
          >
            <img
              src={data.hero_image || '/prof-gupta.jpg'}
              alt="Prof. Vishal Gupta"
              className="w-full h-full object-cover object-top"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/600x800/1a2d4f/ffffff?text=Prof.+Vishal+Gupta'; }}
            />
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2. COURSES
      ══════════════════════════════════════════════════════ */}
      <section id="courses" className="py-8 sm:py-10 px-4 sm:px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <EditableText
              field="courses_heading"
              defaultValue={data.courses_heading}
              className="text-2xl sm:text-3xl lg:text-4xl font-['Playfair_Display'] font-bold text-[#111111] mb-3 block"
            />
            <div className="w-24 h-1 bg-[#004B8D] rounded-full mx-auto" />
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={staggerContainer}
          >
            {courses && courses.filter(c => c.showOnHome).length > 0 ? (
              courses.filter(c => c.showOnHome).map((course) => {
                const videoId = course.youtubeUrl ? extractVideoId(course.youtubeUrl) : null;
                const thumbnailUrl = course.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);
                return (
                  <motion.div
                    key={course.id}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#ebf2f8] rounded-2xl p-5 flex flex-col shadow-md hover:shadow-2xl transition-all border-l-4 border-[#004B8D]"
                  >
                    <h3 className="text-xl lg:text-2xl font-['Playfair_Display'] font-bold text-[#111111] mb-2 leading-tight">
                      {course.title}
                    </h3>
                    <p className="text-sm font-['Inter'] text-gray-700 mb-4 leading-relaxed">{course.description}</p>
                    {thumbnailUrl && (
                      <div className="w-full mb-6">
                        <a href={course.youtubeUrl || '#'} target="_blank" rel="noopener noreferrer" className="block relative group">
                          <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden shadow-md">
                            <img src={thumbnailUrl} alt={course.title}
                              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                              onError={(e) => { if (videoId && !course.thumbnail) e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors shadow-lg">
                                <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    )}
                    <motion.button
                      whileHover={{ backgroundColor: '#004B8D' }}
                      className="mt-auto px-6 py-3 bg-[#004B8D] text-white font-['Inter'] font-bold rounded-lg transition-colors shadow-md text-sm tracking-wide"
                    >
                      EXPLORE COURSE
                    </motion.button>
                  </motion.div>
                );
              })
            ) : (
              [
                { titleF: 'course1_title', descF: 'course1_description', ytF: 'course1_youtube' },
                { titleF: 'course2_title', descF: 'course2_description', ytF: 'course2_youtube' },
              ].map((c, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#ebf2f8] rounded-2xl p-5 flex flex-col shadow-md hover:shadow-2xl transition-all border-l-4 border-[#004B8D]"
                >
                  <EditableText field={c.titleF} defaultValue={data[c.titleF]}
                    className="text-xl lg:text-2xl font-['Playfair_Display'] font-bold text-[#111111] mb-2 leading-tight block" />
                  <EditableText field={c.descF} defaultValue={data[c.descF]}
                    className="text-sm font-['Inter'] text-gray-700 mb-4 leading-relaxed block" multiline />
                  {data[c.ytF] && (() => {
                    const videoId = extractVideoId(data[c.ytF]);
                    return videoId ? (
                      <div className="w-full mb-6">
                        <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer" className="block relative group">
                          <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden shadow-md">
                            <img src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} alt=""
                              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                              onError={(e) => { e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors shadow-lg">
                                <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    ) : null;
                  })()}
                  <motion.button
                    whileHover={{ backgroundColor: '#004B8D' }}
                    className="mt-auto px-6 py-3 bg-[#004B8D] text-white font-['Inter'] font-bold rounded-lg transition-colors shadow-md text-sm tracking-wide"
                  >
                    EXPLORE COURSE
                  </motion.button>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          3. BLOGS
      ══════════════════════════════════════════════════════ */}
      <section id="blog" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-16 bg-[#ebf2f8]">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div className="mb-12"
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div>
                <EditableText
                  field="blog_heading"
                  defaultValue={data.blog_heading}
                  className="text-3xl sm:text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#111111] block"
                />
                <div className="w-24 h-1 bg-[#004B8D] rounded-full mt-4" />
              </div>
            </div>
          </motion.div>

          {/* Recent Blogs sub-label */}
          <motion.div className="flex items-center gap-3 mb-8"
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInLeft}>
            <div className="w-8 h-8 rounded-full bg-[#004B8D] flex items-center justify-center flex-shrink-0">
              <FiBookOpen size={14} className="text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-['Playfair_Display'] font-bold text-[#111111]">Recent Blogs</h3>
            <div className="h-px flex-1 bg-gray-200" />
          </motion.div>

          {/* Blog tiles — max 3 per row */}
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={staggerContainer}
          >
            {recentBlogs.slice(0, 6).map((blog, index) => (
              <motion.div
                key={blog.id || index}
                variants={fadeInUp}
                whileHover={{ scale: 1.025, y: -5 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all border-l-4 border-[#004B8D] flex flex-col"
              >
                {/* Image */}
                <div className="h-44 bg-gray-200 overflow-hidden">
                  <img
                    src={blog.imageUrl || `https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop`}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400/e6e8ff/2A35CC?text=Article'; }}
                  />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 hover:bg-[#ebf2f8] transition-colors">
                  {blog.date && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <FiCalendar size={11} className="text-[#004B8D]" />
                      <p className="text-xs font-['Inter'] text-gray-500 tracking-wide uppercase">{formatDate(blog.date)}</p>
                    </div>
                  )}
                  <h4 className="text-base font-['Playfair_Display'] font-bold text-[#111111] mb-2 leading-snug line-clamp-2">
                    {blog.title}
                  </h4>
                  <p className="text-sm font-['Inter'] text-gray-600 leading-relaxed mb-4 flex-1 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  <Link
                    to={blog.slug ? `/blog/${blog.slug}` : '#'}
                    className="inline-flex items-center gap-2 text-[#004B8D] hover:text-[#004B8D] font-['Inter'] font-semibold text-sm transition-all group"
                  >
                    Read More
                    <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* All Blogs CTA */}
          <motion.div
            className="text-center mt-14"
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
          >
            <Link to="/blog">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#004B8D' }}
                whileTap={{ scale: 0.97 }}
                className="bg-[#004B8D] px-12 py-4 font-['Inter'] font-bold text-white text-base rounded-md shadow-lg transition-colors"
              >
                My Blogs
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. TESTIMONIALS — infinite scrolling strip
      ══════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 bg-white overflow-hidden relative">
        {/* CSS for marquee animations */}
        <style>{`
          @keyframes marquee-left {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .testimonial-track-left {
            display: flex;
            width: max-content;
            animation: marquee-left 40s linear infinite;
          }
          .testimonial-track-left:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
          <motion.div className="text-center"
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-10 bg-[#004B8D]" />
              <FiStar className="text-[#004B8D]" size={14} />
              <div className="h-px w-10 bg-[#004B8D]" />
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#111111] mb-2">What People Say</h2>
            <div className="w-24 h-1 bg-[#004B8D] rounded-full mx-auto" />
          </motion.div>
        </div>

        {(() => {
          const allItems = testimonials && testimonials.length > 0 ? testimonials : [
            { id: 'f1', quote: "I have to admit that I wasn't sure what would be involved with your course, but I consider myself very blessed to have been a part of it. The historical aspect of Mahabharata was fascinating by itself, and I enjoyed the way you incorporated the epic with current leadership practices.", author: "Colene Sassmann", role: "Class Participant 2023, MBA course", organization: "University of Northern Iowa" },
            { id: 'f2', quote: "observing you from the sidelines, I learnt many things. Chief amongst them, your dhairya, humility and a steadfast bold vision. Your course and its reflections on the ego & self as a leader made a deep impression.", author: "Rupal Nayar", role: "Director, Industry & University Partnerships", organization: "Coursera" },
            { id: 'f3', quote: "We thank you for conducting the session for the Principals of Delhi Public Schools. The session was rewarding and much appreciated by all participants.", author: "Vanita Sehgal", role: "Executive Director, HRDC", organization: "DPSS" },
            { id: 'f4', quote: "Thank you for such wonderful mentor / coach / guide / teacher. I am really feeling happy to be your student. The way you put up the topic is so interesting, I am loving it.", author: "Vijay Vyas", role: "Group Head, HR", organization: "Rushil Decor Limited" },
            { id: 'f5', quote: "Your classes were a real value addition in FDP course. Thank you for teaching us so patiently. You made a complicated course quite easy for us.", author: "Irfana Rashid", role: "FDP 2017 Participant", organization: "IIM Ahmedabad" },
            { id: 'f6', quote: "Just wanted to thank you for the lecture today. It was, probably, the most important lecture that I ever attended.", author: "Kaustubh Korde", role: "PGPX 2018 Participant", organization: "IIM Ahmedabad" },
          ];
          // Duplicate for seamless loop
          const row1 = [...allItems, ...allItems];

          const Card = ({ t }) => (
            <div className="flex-shrink-0 w-[320px] sm:w-[380px] mx-3 bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-[#004B8D] px-6 py-5">
              <p className="text-sm sm:text-[0.9rem] font-['Playfair_Display'] italic text-gray-700 leading-relaxed mb-4 line-clamp-4">
                "{t.quote}"
              </p>
              <div className="h-px bg-gray-100 mb-3" />
              <p className="text-xs font-['Inter'] font-semibold text-[#004B8D]">— {t.author}</p>
              <p className="text-xs font-['Inter'] text-gray-400 italic">
                {t.role}{t.organization ? `, ${t.organization}` : ''}
              </p>
            </div>
          );

          return (
            <div className="flex flex-col gap-5">
              {/* Row 1 — scrolls left */}
              <div className="overflow-hidden">
                <div className="testimonial-track-left">
                  {row1.map((t, i) => <Card key={`r1-${i}`} t={t} />)}
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ══════════════════════════════════════════════════════
          5. TRAININGS DELIVERED — auto-sliding logos
      ══════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 bg-[#ebf2f8] overflow-hidden">
        <style>{`
          @keyframes logos-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .logos-track {
            display: flex;
            align-items: center;
            width: max-content;
            animation: logos-scroll 30s linear infinite;
          }
          .logos-track:hover { animation-play-state: paused; }
        `}</style>

        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 text-center mb-10"
          initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
        >
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#111111] mb-4">
            Trainings Delivered For
          </h2>
          <div className="w-24 h-1 bg-[#004B8D] rounded-full mx-auto mb-6" />
          <p className="text-sm sm:text-base text-gray-600 font-['Inter'] max-w-3xl mx-auto">
            From leading academic institutions to global corporations, Prof. Gupta has delivered transformative training programs.
          </p>
        </motion.div>

        {(() => {
          const logoItems = trainingLogos && trainingLogos.length > 0 ? trainingLogos : [
            { id: 'f1', name: 'IIM Ahmedabad', logoUrl: '' },
            { id: 'f2', name: 'Coursera', logoUrl: '' },
            { id: 'f3', name: 'Delhi Public Schools', logoUrl: '' },
            { id: 'f4', name: 'Rushil Decor', logoUrl: '' },
            { id: 'f5', name: 'University of Northern Iowa', logoUrl: '' },
            { id: 'f6', name: 'University of Mumbai', logoUrl: '' },
            { id: 'f7', name: 'ISRO', logoUrl: '' },
            { id: 'f8', name: 'Larsen & Toubro', logoUrl: '' },
          ];
          const doubled = [...logoItems, ...logoItems];

          return (
            <div className="overflow-hidden">
              <div className="logos-track">
                {doubled.map((logo, i) => (
                  <div key={`logo-${i}`}
                    className="flex-shrink-0 flex items-center justify-center h-16 lg:h-20 px-6 py-3 mx-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-white transition-colors"
                    style={{ maxWidth: '140px' }}
                  >
                    {logo.logoUrl ? (
                      <>
                        <img src={logo.logoUrl} alt={logo.name}
                          className="max-h-full w-auto object-contain"
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                        <span className="font-['Inter'] font-bold text-gray-700 text-center hidden text-sm">{logo.name}</span>
                      </>
                    ) : (
                      <span className="font-['Inter'] font-bold text-gray-700 text-center text-sm lg:text-base whitespace-nowrap">{logo.name}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* ══════════════════════════════════════════════════════
          6. BOOKS
      ══════════════════════════════════════════════════════ */}
      <section id="books" className="py-8 sm:py-10 px-4 sm:px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-8"
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
          >
            <EditableText
              field="books_heading"
              defaultValue={data.books_heading}
              className="text-2xl sm:text-3xl lg:text-4xl font-['Playfair_Display'] font-bold text-[#111111] block mb-3"
            />
            <div className="w-24 h-1 bg-[#004B8D] rounded-full mx-auto" />
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto"
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={staggerContainer}
          >
            {homeBooksList.length > 0 ? (
              /* ── Firestore books with showOnHome == true ── */
              homeBooksList.map((book) => (
                <motion.div
                  key={book.id}
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#004B8D]/30"
                >
                  <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '3/4' }}>
                    <img
                      src={book.coverUrl || 'https://via.placeholder.com/600x800/e6e8ff/2A35CC?text=Book'}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/600x800/e6e8ff/2A35CC?text=Book'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="text-sm sm:text-base font-['Playfair_Display'] font-bold text-[#111111] mb-1 leading-snug">{book.title}</h3>
                    {book.authors && <p className="text-xs font-['Inter'] text-gray-500 mb-1">{book.authors}</p>}
                    {book.year && <p className="text-xs font-['Inter'] text-[#004B8D] font-semibold mb-2">{book.year} · {book.publisher}</p>}
                    <div className="w-10 h-0.5 bg-[#004B8D] rounded-full mb-2" />
                    <div className="flex-1" />
                    <motion.a
                      href={book.amazonLink || 'https://www.amazon.in'}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03, backgroundColor: '#004B8D' }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full text-center bg-[#004B8D] hover:bg-[#004B8D] text-white px-6 py-3 font-['Inter'] font-bold text-sm rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 mt-auto"
                    >
                      Buy on Amazon
                      <FiArrowRight size={14} />
                    </motion.a>
                  </div>
                </motion.div>
              ))
            ) : (
              /* ── Static fallback books from home content doc ── */
              staticBooksList.map((book, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#004B8D]/30"
                >
                  <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '3/4' }}>
                    <img
                      src={data[book.imgf] || book.fb}
                      alt="Book cover"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/600x800/e6e8ff/2A35CC?text=Book'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="flex flex-col flex-1 p-4">
                    <EditableText
                      field={book.tf}
                      defaultValue={data[book.tf]}
                      className="text-sm sm:text-base font-['Playfair_Display'] font-bold text-[#111111] mb-2 block leading-snug"
                    />
                    <div className="w-10 h-0.5 bg-[#004B8D] rounded-full mb-2" />
                    <EditableText
                      field={book.df}
                      defaultValue={data[book.df]}
                      className="text-xs font-['Inter'] text-gray-500 leading-relaxed block flex-1 mb-4"
                      multiline={true}
                    />
                    <motion.a
                      href={data[book.linkf] || 'https://www.amazon.in'}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03, backgroundColor: '#004B8D' }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full text-center bg-[#004B8D] hover:bg-[#004B8D] text-white px-6 py-3 font-['Inter'] font-bold text-sm rounded-lg transition-colors shadow-md flex items-center justify-center gap-2 mt-auto"
                    >
                      Buy on Amazon
                      <FiArrowRight size={14} />
                    </motion.a>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Link to all books */}
          <motion.div className="text-center mt-8"
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
          >
            <Link to="/book">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#004B8D' }}
                whileTap={{ scale: 0.97 }}
                className="bg-[#004B8D] px-12 py-4 font-['Inter'] font-bold text-white text-base rounded-md shadow-lg transition-colors"
              >
                All Books
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          7. SPEAKING
      ══════════════════════════════════════════════════════ */}
      <section id="contact" className="grid lg:grid-cols-2 min-h-[600px]">
        <motion.div
          className="bg-[#ebf2f8] p-6 sm:p-12 lg:p-20 flex flex-col justify-center items-start order-2 lg:order-1 relative overflow-hidden border-l-4 border-[#004B8D]"
          initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInLeft}
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#004B8D]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="w-20 h-1 bg-[#004B8D] mb-6 rounded-full" />
          <EditableText
            field="speaking_heading"
            defaultValue={data.speaking_heading}
            className="text-2xl sm:text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#111111] mb-6 leading-tight block relative z-10"
          />
          <EditableText
            field="speaking_description"
            defaultValue={data.speaking_description}
            className="text-sm sm:text-base lg:text-lg font-['Inter'] text-gray-700 mb-10 max-w-lg leading-relaxed block relative z-10"
            multiline={true}
          />
          <motion.a
            href="https://vishalgupta.kavisha.ai/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, backgroundColor: '#CC5200' }}
            className="relative z-10 inline-block bg-[#004B8D] hover:bg-[#004B8D] text-white px-10 py-4 font-['Inter'] font-bold text-base rounded-md shadow-lg transition-colors"
          >
            Digital Avatar
          </motion.a>
        </motion.div>

        <motion.div
          className="min-h-[400px] lg:min-h-full order-1 lg:order-2 bg-gray-200 overflow-hidden"
          initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInRight}
        >
          <img
            src={data.contact_map_image || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=800&fit=crop'}
            alt="Prof. Gupta speaking at an event"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/1200x800/1a1a1a/ffffff?text=Speaking+Event'; }}
          />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          8. NEWSLETTER
      ══════════════════════════════════════════════════════ */}
      <section id="newsletter" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-16 bg-[#ffffff]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInLeft}
          >
            <div className="w-12 h-1 bg-[#004B8D] mb-5 rounded-full" />
            <EditableText
                field="newsletter_heading"
                defaultValue={data.newsletter_heading}
                className="text-3xl sm:text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#111111] leading-tight block"
            />
          </motion.div>

          <motion.div className="space-y-6"
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInRight}>
            <EditableText
              field="newsletter_description"
              defaultValue={data.newsletter_description}
              className="text-sm sm:text-base lg:text-lg font-['Inter'] text-gray-700 leading-relaxed block"
              multiline={true}
            />
            <form onSubmit={handleNewsletterSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  disabled={isSubmitting}
                  className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-md font-['Inter'] bg-white focus:outline-none focus:border-[#004B8D] transition-colors disabled:opacity-50"
                />
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ backgroundColor: '#004B8D' }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-[#004B8D] px-10 py-4 font-['Inter'] font-bold text-white text-base rounded-md transition-colors shadow-md whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Subscribing...</>
                  ) : 'Sign Up'}
                </motion.button>
              </div>
              {newsletterStatus.message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-md flex items-start gap-3 ${newsletterStatus.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
                >
                  {newsletterStatus.type === 'success' && <FiCheck className="text-green-600 text-xl flex-shrink-0 mt-0.5" />}
                  <p className={`text-sm font-['Inter'] ${newsletterStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                    {newsletterStatus.message}
                  </p>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </section>

    </div>
  );
}