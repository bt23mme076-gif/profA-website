import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EditableText from '../components/EditableText';
import { FiArrowRight, FiBookOpen, FiStar, FiChevronLeft, FiChevronRight, FiCheck, FiCalendar } from 'react-icons/fi';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { subscribeToNewsletter } from '../utils/newsletter';
import { where, orderBy, limit } from 'firebase/firestore';

// ─── Color palette (Website_colours.pdf)
// bg-white    → sections 1,2,4,6   bg-[#f0f1ff] → sections 3,5,8 (subtle blue-tint)
// #3333FF / #2222CC → blue  |  #FF6600 / #CC5200 → orange  |  #111111 → text


// ─── Animation variants ──────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
};
const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};
const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.05 } }
};
const viewportOptions = { once: true, margin: '0px 0px -60px 0px', amount: 0.15 };

// ─── Styles to remove extra space ─────────────────────────────────────────────
const styles = {
  container: {
    padding: '1rem',
    maxWidth: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center align content
  },
  heroSection: {
    padding: '1rem',
    margin: '0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center align hero section
  },
  heroTitle: {
    margin: '0',
    padding: '0',
    fontSize: '2rem',
    lineHeight: '1.2',
    textAlign: 'center',
  },
  heroSubtitle: {
    margin: '0.5rem 0',
    fontSize: '1.2rem',
    lineHeight: '1.5',
    textAlign: 'center',
  },
  heroDescription: {
    margin: '0.5rem 0',
    fontSize: '1rem',
    lineHeight: '1.5',
    textAlign: 'center',
  },
  button: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    borderRadius: '8px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center',
  },
};

export default function Home() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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
    hero_greeting: "Hey there! Meet",
    hero_name: "Prof. Vishal Gupta",
    hero_subtitle: "IIM Ahmedabad Professor. Researcher. Thought Leader.",
    hero_description: "Leading expert in strategic management and organizational behavior. Prof. Gupta's research and teaching focus on helping leaders and organizations navigate complexity and drive sustainable growth.",
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

  // ─── Testimonial slider ────────────────────────────────────────────────────
  const totalTestimonials = testimonials ? testimonials.length : 0;
  const nextSlide = () => { if (totalTestimonials > 0) setCurrentSlide((p) => (p + 1) % totalTestimonials); };
  const prevSlide = () => { if (totalTestimonials > 0) setCurrentSlide((p) => (p - 1 + totalTestimonials) % totalTestimonials); };

  useEffect(() => {
    if (!isPaused && totalTestimonials > 0) {
      const interval = setInterval(nextSlide, 8000);
      return () => clearInterval(interval);
    }
  }, [currentSlide, isPaused, totalTestimonials]);

  useEffect(() => {
    console.log('Testimonials data:', testimonials);
    console.log('Testimonials count:', testimonials?.length || 0);
  }, [testimonials]);

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading || blogsLoading || coursesLoading || testimonialsLoading || logosLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#3333FF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-['Inter'] text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ─── Blog fallback data ────────────────────────────────────────────────────
  const recentBlogs = (blogs && blogs.length > 0) ? blogs : [
    { id: 'b1', title: data.blog1_title, excerpt: data.blog1_excerpt, imageUrl: data.blog1_image, date: '2026-02-01', slug: 'blog-1' },
    { id: 'b2', title: data.blog2_title, excerpt: data.blog2_excerpt, imageUrl: data.blog2_image, date: '2026-01-28', slug: 'blog-2' },
    { id: 'b3', title: data.blog3_title, excerpt: data.blog3_excerpt, imageUrl: data.blog3_image, date: '2026-01-15', slug: 'blog-3' },
  ];

  return (
    <div className="bg-white">

      {/* ══════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════ */}
      <section className="min-h-screen grid lg:grid-cols-2 items-center px-4 sm:px-6 lg:px-16 py-8 sm:py-12 bg-gradient-to-br from-white to-[#f0f1ff] relative overflow-hidden" style={{ maxWidth: '100vw', boxSizing: 'border-box' }}>
        {/* Decorative orb */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3333FF]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/4 translate-x-1/4" />

        {/* Left: Text */}
        <div className="space-y-7 max-w-2xl relative z-10" style={{ paddingLeft: '0', paddingRight: '0.5rem', boxSizing: 'border-box', overflow: 'hidden' }}>
          <motion.div
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-20 h-1 bg-[#FF6600] mb-6 rounded-full" />
            <EditableText
              field="hero_greeting"
              defaultValue={data.hero_greeting}
              className="text-lg font-['Inter'] text-gray-600 mb-4 block"
            />
            <EditableText
              field="hero_name"
              defaultValue={data.hero_name}
              className="text-4xl sm:text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#000000] leading-tight mb-4 sm:mb-6 block"
            />
            <EditableText
              field="hero_subtitle"
              defaultValue={data.hero_subtitle}
              className="text-lg sm:text-xl lg:text-2xl font-['Playfair_Display'] text-[#000000] font-semibold mb-6 sm:mb-8 block"
            />
            <EditableText
              field="hero_description"
              defaultValue={data.hero_description}
              className="text-lg font-['Inter'] text-gray-600 leading-relaxed block"
              multiline={true}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <Link to="/about">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: '#2222CC' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="bg-[#3333FF] px-8 py-4 font-['Inter'] font-bold text-white text-base rounded-md shadow-lg"
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Right: Portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-12 lg:mt-0 z-10"
        >
          <div className="aspect-[3/4] max-w-lg mx-auto lg:ml-auto rounded-2xl overflow-hidden shadow-2xl bg-gray-200 border-4 border-[#FF6600]">
            <img
              src={data.hero_image || '/prof-gupta.jpg'}
              alt="Prof. Vishal Gupta"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/800x1000/cccccc/333333?text=Prof.+Vishal+Gupta'; }}
            />
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          2. COURSES
      ══════════════════════════════════════════════════════ */}
      <section id="courses" className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <EditableText
              field="courses_heading"
              defaultValue={data.courses_heading}
              className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#111111] mb-4 block"
            />
            <div className="w-24 h-1 bg-[#3333FF] rounded-full mx-auto" />
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={staggerContainer}
          >
            {courses && courses.length > 0 ? (
              courses.slice(0, 2).map((course) => {
                const videoId = course.youtubeUrl ? extractVideoId(course.youtubeUrl) : null;
                const thumbnailUrl = course.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);
                return (
                  <motion.div
                    key={course.id}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#f0f1ff] rounded-2xl p-8 flex flex-col shadow-md hover:shadow-2xl transition-all border-l-4 border-[#3333FF]"
                  >
                    <h3 className="text-3xl lg:text-4xl font-['Playfair_Display'] font-bold text-[#111111] mb-4 leading-tight">
                      {course.title}
                    </h3>
                    <p className="text-base font-['Inter'] text-gray-700 mb-6 leading-relaxed">{course.description}</p>
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
                      whileHover={{ backgroundColor: '#2222CC' }}
                      className="mt-auto px-6 py-3 bg-[#3333FF] text-white font-['Inter'] font-bold rounded-lg transition-colors shadow-md text-sm tracking-wide"
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
                  className="bg-[#f0f1ff] rounded-2xl p-8 flex flex-col shadow-md hover:shadow-2xl transition-all border-l-4 border-[#3333FF]"
                >
                  <EditableText field={c.titleF} defaultValue={data[c.titleF]}
                    className="text-3xl lg:text-4xl font-['Playfair_Display'] font-bold text-[#111111] mb-4 leading-tight block" />
                  <EditableText field={c.descF} defaultValue={data[c.descF]}
                    className="text-base font-['Inter'] text-gray-700 mb-6 leading-relaxed block" multiline />
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
                    whileHover={{ backgroundColor: '#2222CC' }}
                    className="mt-auto px-6 py-3 bg-[#3333FF] text-white font-['Inter'] font-bold rounded-lg transition-colors shadow-md text-sm tracking-wide"
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
      <section id="blog" className="py-16 px-6 lg:px-16 bg-[#f0f1ff]">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <motion.div className="mb-12"
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}>
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div>
                <EditableText
                  field="blog_heading"
                  defaultValue={data.blog_heading}
                  className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#111111] block"
                />
                <div className="w-24 h-1 bg-[#3333FF] rounded-full mt-4" />
              </div>
            </div>
          </motion.div>

          {/* Recent Blogs sub-label */}
          <motion.div className="flex items-center gap-3 mb-8"
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInLeft}>
            <div className="w-8 h-8 rounded-full bg-[#FF6600] flex items-center justify-center flex-shrink-0">
              <FiBookOpen size={14} className="text-white" />
            </div>
            <h3 className="text-xl font-['Playfair_Display'] font-bold text-[#111111]">Recent Blogs</h3>
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
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all border-l-4 border-[#3333FF] flex flex-col"
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
                <div className="p-5 flex flex-col flex-1 hover:bg-[#f0f1ff] transition-colors">
                  {blog.date && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <FiCalendar size={11} className="text-[#FF6600]" />
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
                    className="inline-flex items-center gap-2 text-[#3333FF] hover:text-[#2222CC] font-['Inter'] font-semibold text-sm transition-all group"
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
                whileHover={{ scale: 1.05, backgroundColor: '#2222CC' }}
                whileTap={{ scale: 0.97 }}
                className="bg-[#3333FF] px-12 py-4 font-['Inter'] font-bold text-white text-base rounded-md shadow-lg transition-colors"
              >
                My Blogs
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          4. TESTIMONIALS
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white">
        {/* Decorative quote mark */}
        <div className="absolute top-4 left-6 text-[160px] font-['Playfair_Display'] text-[#3333FF]/6 leading-none select-none pointer-events-none">"</div>
        <div className="absolute bottom-0 right-6 text-[160px] font-['Playfair_Display'] text-[#3333FF]/6 leading-none select-none pointer-events-none rotate-180">"</div>

        <div
          className="max-w-2xl mx-auto px-6 relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Label */}
          <motion.div className="text-center mb-12"
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-10 bg-[#FF6600]" />
              <FiStar className="text-[#FF6600]" size={14} />
              <div className="h-px w-10 bg-[#FF6600]" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#111111] mb-2">What People Say</h2>
            <div className="w-24 h-1 bg-[#3333FF] rounded-full mx-auto" />
          </motion.div>

          {/* Debug info when empty */}
          {(!testimonials || testimonials.length === 0) && (
            <div className="text-center py-4 mb-4">
              <p className="text-[#3333FF] font-['Inter'] font-bold text-sm">
                No testimonials found. Check console for details.
              </p>
            </div>
          )}

          {testimonials && testimonials.length > 0 ? (
            <div className="relative min-h-[300px] flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full"
                >
                  {/* Card */}
                  <div className="bg-white rounded-xl shadow-lg px-8 py-8 border-l-4 border-[#3333FF] mb-6">
                    <p className="text-base lg:text-lg font-['Playfair_Display'] italic text-gray-700 leading-relaxed mb-6">
                      "{testimonials[currentSlide]?.quote}"
                    </p>
                    <div className="h-px bg-gray-100 mb-5" />
                    <p className="text-sm font-['Inter'] font-semibold text-[#3333FF] mb-1">
                      — {testimonials[currentSlide]?.author}
                    </p>
                    <p className="text-xs font-['Inter'] text-gray-500 italic">
                      {testimonials[currentSlide]?.role}
                      {testimonials[currentSlide]?.organization ? `, ${testimonials[currentSlide].organization}` : ''}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              {testimonials.length > 1 && (
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={prevSlide}
                    className="bg-white/90 hover:bg-white text-[#111111] p-2.5 rounded-full shadow-md transition-all hover:scale-110">
                    <FiChevronLeft size={20} strokeWidth={2.5} />
                  </button>
                  {testimonials.map((_, i) => (
                    <button key={i} onClick={() => setCurrentSlide(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-[#3333FF] w-6' : 'bg-[#3333FF]/30 hover:bg-[#3333FF]/60 w-2'}`}
                    />
                  ))}
                  <button onClick={nextSlide}
                    className="bg-white/90 hover:bg-white text-[#111111] p-2.5 rounded-full shadow-md transition-all hover:scale-110">
                    <FiChevronRight size={20} strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Fallback
            <div className="flex flex-col items-center">
              <div className="bg-white rounded-xl shadow-lg px-8 py-8 border-l-4 border-[#3333FF] max-w-xl mx-auto">
                <p className="text-base lg:text-lg font-['Playfair_Display'] italic text-gray-700 leading-relaxed mb-6">
                  "I have to admit that I wasn't sure what would be involved with your course, but I consider myself very blessed to have been a part of it. The historical aspect of Mahabharata was fascinating by itself, and I enjoyed the way you incorporated the epic with current leadership practices. Thank you very much for this unique opportunity!"
                </p>
                <div className="h-px bg-gray-100 mb-5" />
                <p className="text-sm font-['Inter'] font-semibold text-[#3333FF] mb-1">— Colene Sassmann</p>
                <p className="text-xs font-['Inter'] text-gray-500 italic">Class Participant 2023, MBA course, University of Northern Iowa</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          5. TRAININGS DELIVERED
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 bg-[#f0f1ff]">
        <motion.div
          className="max-w-7xl mx-auto px-6 text-center mb-12"
          initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
        >
          <h2 className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#111111] mb-4">
            Trainings Delivered For
          </h2>
          <div className="w-24 h-1 bg-[#FF6600] rounded-full mx-auto mb-6" />
          <p className="text-gray-600 font-['Inter'] max-w-3xl mx-auto">
            From leading academic institutions to global corporations, Prof. Gupta has delivered transformative training programs.
          </p>
        </motion.div>

        <motion.div
          className="max-w-7xl mx-auto px-6"
          initial="hidden" whileInView="visible" viewport={viewportOptions} variants={staggerContainer}
        >
          {trainingLogos && trainingLogos.length > 0 ? (
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
              {trainingLogos.map((logo) => (
                <motion.div key={logo.id} variants={fadeInUp} whileHover={{ scale: 1.08 }}
                  className="flex items-center justify-center h-16 lg:h-20 px-5 py-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-[#f0f1ff] transition-colors">
                  <img src={logo.logoUrl} alt={logo.name}
                    className="max-h-full w-auto object-contain" style={{ maxWidth: '160px' }}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <span className="font-['Inter'] font-bold text-gray-700 text-center hidden">{logo.name}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-10">
              {['IIM Ahmedabad', 'Coursera', 'Delhi Public Schools', 'Rushil Decor', 'University of Northern Iowa', 'University of Mumbai'].map((name) => (
                <motion.div key={name} variants={fadeInUp} whileHover={{ scale: 1.06 }}
                  className="flex items-center justify-center h-14 px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-[#f0f1ff] transition-colors">
                  <span className="font-['Inter'] font-bold text-gray-700 text-center text-sm lg:text-base">{name}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          6. BOOKS
      ══════════════════════════════════════════════════════ */}
      <section id="books" className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div className="mb-12"
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}>
            <EditableText
              field="books_heading"
              defaultValue={data.books_heading}
              className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#111111] text-center block mb-4"
            />
            <div className="w-24 h-1 bg-[#3333FF] rounded-full mx-auto" />
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto"
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={staggerContainer}
          >
            {[
              { tf: 'book1_title', df: 'book1_description', imgf: 'book1_image', fb: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop' },
              { tf: 'book2_title', df: 'book2_description', imgf: 'book2_image', fb: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop' },
              { tf: 'book3_title', df: 'book3_description', imgf: 'book3_image', fb: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop' },
            ].map((book, i) => (
              <motion.div key={i} variants={fadeInUp} whileHover={{ y: -8 }} transition={{ duration: 0.3 }}
                className="group text-center">
                <div className="aspect-[3/4] bg-white rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300 mb-6 border-2 border-gray-200 group-hover:border-[#3333FF]">
                  <img src={data[book.imgf] || book.fb} alt="Book cover"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/600x800/e6e8ff/2A35CC?text=Book'; }} />
                </div>
                <EditableText field={book.tf} defaultValue={data[book.tf]}
                  className="text-2xl font-['Playfair_Display'] font-bold text-[#111111] mb-3 block" />
                <EditableText field={book.df} defaultValue={data[book.df]}
                  className="text-sm font-['Inter'] text-gray-600 mb-4 leading-relaxed block" multiline={true} />
                <motion.a href="#"
                  whileHover={{ scale: 1.05, backgroundColor: '#2222CC' }}
                  className="inline-block bg-[#3333FF] hover:bg-[#2222CC] text-white px-6 py-3 font-['Inter'] font-bold text-sm rounded-md transition-colors shadow-md">
                  Buy on Amazon
                </motion.a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          7. SPEAKING
      ══════════════════════════════════════════════════════ */}
      <section id="contact" className="grid lg:grid-cols-2 min-h-[600px]">
        <motion.div
          className="bg-[#f0f1ff] p-12 lg:p-20 flex flex-col justify-center items-start order-2 lg:order-1 relative overflow-hidden border-l-4 border-[#FF6600]"
          initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInLeft}
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#FF6600]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="w-20 h-1 bg-[#FF6600] mb-6 rounded-full" />
          <EditableText
            field="speaking_heading"
            defaultValue={data.speaking_heading}
            className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#111111] mb-6 leading-tight block relative z-10"
          />
          <EditableText
            field="speaking_description"
            defaultValue={data.speaking_description}
            className="text-lg font-['Inter'] text-gray-700 mb-10 max-w-lg leading-relaxed block relative z-10"
            multiline={true}
          />
          <motion.a
            href="https://vishalgupta.kavisha.ai/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, backgroundColor: '#CC5200' }}
            className="relative z-10 inline-block bg-[#FF6600] hover:bg-[#FF6600] text-white px-10 py-4 font-['Inter'] font-bold text-base rounded-md shadow-lg transition-colors"
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
      <section id="newsletter" className="py-16 px-6 lg:px-16 bg-[#ffffff]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInLeft}
          >
            <div className="w-12 h-1 bg-[#FF6600] mb-5 rounded-full" />
            <EditableText
                field="newsletter_heading"
                defaultValue={data.newsletter_heading}
                className="text-5xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#111111] leading-tight block"
            />
          </motion.div>

          <motion.div className="space-y-6"
            initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInRight}>
            <EditableText
              field="newsletter_description"
              defaultValue={data.newsletter_description}
              className="text-lg font-['Inter'] text-gray-700 leading-relaxed block"
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
                  className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-md font-['Inter'] bg-white focus:outline-none focus:border-[#3333FF] transition-colors disabled:opacity-50"
                />
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ backgroundColor: '#2222CC' }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-[#3333FF] px-10 py-4 font-['Inter'] font-bold text-white text-base rounded-md transition-colors shadow-md whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-2"
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