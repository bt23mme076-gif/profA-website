import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EditableText from '../components/EditableText';
import { useAuth } from '../context/AuthContext';
import { FiArrowRight, FiBookOpen, FiStar, FiCheck, FiCalendar } from 'react-icons/fi';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { subscribeToNewsletter } from '../utils/newsletter';
import { where, limit } from 'firebase/firestore';

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


const UNIFORM_CARD =
  "w-full max-w-[340px] mx-auto bg-white rounded-[24px] overflow-hidden border border-gray-200 shadow-sm hover:shadow-2xl hover:border-[#F5C400] transition-all duration-300 flex flex-col h-full group transform hover:-translate-y-2";

const UNIFORM_IMAGE_WRAP =
  "w-full h-[160px] sm:h-[180px] md:h-[200px] overflow-hidden bg-gray-100 relative";

const BOOK_IMAGE_WRAP =
  "w-full aspect-[2/3] max-h-[320px] overflow-hidden bg-gray-100 relative";

const UNIFORM_IMAGE =
  "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110";

const BOOK_IMAGE =
  "w-full h-full object-contain transition-transform duration-100 group-hover:scale-105";

const UNIFORM_BODY =
  "flex flex-col flex-1 p-4 sm:p-5";

const UNIFORM_META =
  "flex items-center gap-2 text-gray-500 text-xs sm:text-sm font-['Inter'] mb-3";

const UNIFORM_TITLE =
  "text-xl sm:text-2xl font-['Playfair_Display'] font-bold text-[#111111] leading-tight line-clamp-2 min-h-[48px]";

const UNIFORM_TEXT =
  "text-sm sm:text-base font-['Inter'] text-gray-600 leading-relaxed line-clamp-3 min-h-[48px]";

// Global sizing helpers to keep headings and body text consistent across the home page
const GLOBAL_HEADING = "text-3xl sm:text-4xl lg:text-5xl font-['Playfair_Display'] font-bold";
const GLOBAL_BODY = "text-base sm:text-lg font-['Inter']";

const UNIFORM_FOOTER =
  "mt-auto pt-4 border-t border-gray-200 flex items-center justify-between gap-3";

const UNIFORM_BUTTON =
  "w-full text-center bg-[#004B8D] text-white px-4 py-3 font-['Inter'] font-bold text-xs sm:text-sm rounded-lg transition-all duration-300 shadow-md flex items-center justify-center gap-2 mt-auto hover:bg-[#F5C400] hover:text-[#0B1628] hover:shadow-lg transform hover:-translate-y-1";

const FALLBACK_TESTIMONIALS = [
  {
    id: 'f1',
    quote:
      "I have to admit that I wasn't sure what would be involved with your course, but I consider myself very blessed to have been a part of it. The historical aspect of Mahabharata was fascinating by itself, and I enjoyed the way you incorporated the epic with current leadership practices.",
    author: 'Colene Sassmann',
    role: 'Class Participant 2023, MBA course',
    organization: 'University of Northern Iowa'
  },
  {
    id: 'f2',
    quote:
      'Observing you from the sidelines, I learnt many things. Chief amongst them, your dhairya, humility and a steadfast bold vision. Your course and its reflections on the ego & self as a leader made a deep impression.',
    author: 'Rupal Nayar',
    role: 'Director, Industry & University Partnerships',
    organization: 'Coursera'
  },
  {
    id: 'f3',
    quote:
      'We thank you for conducting the session for the Principals of Delhi Public Schools. The session was rewarding and much appreciated by all participants.',
    author: 'Vanita Sehgal',
    role: 'Executive Director, HRDC',
    organization: 'DPSS'
  },
  {
    id: 'f4',
    quote:
      'Thank you for such wonderful mentor / coach / guide / teacher. I am really feeling happy to be your student. The way you put up the topic is so interesting, I am loving it.',
    author: 'Vijay Vyas',
    role: 'Group Head, HR',
    organization: 'Rushil Decor Limited'
  },
  {
    id: 'f5',
    quote:
      'Your classes were a real value addition in FDP course. Thank you for teaching us so patiently. You made a complicated course quite easy for us.',
    author: 'Irfana Rashid',
    role: 'FDP 2017 Participant',
    organization: 'IIM Ahmedabad'
  },
  {
    id: 'f6',
    quote:
      'Just wanted to thank you for the lecture today. It was, probably, the most important lecture that I ever attended.',
    author: 'Kaustubh Korde',
    role: 'PGPX 2018 Participant',
    organization: 'IIM Ahmedabad'
  }
];

export default function Home() {
  const { isAdmin } = useAuth();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testimonialPage, setTestimonialPage] = useState(0);

  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    );
    return match ? match[1] : null;
      // Ref for newsletter section
      const newsletterRef = useRef(null);
  
      // Handler to scroll to newsletter
      const scrollToNewsletter = () => {
        if (newsletterRef.current) {
          newsletterRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      };
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return '';
    try {
      const d = dateVal?.toDate ? dateVal.toDate() : new Date(dateVal);
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  // Small renderer for CTA (convert **bold** and *italic* to HTML)
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const renderRichText = (text) => {
    if (!text) return '';
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return html;
  };

  const { data, loading } = useFirestoreDoc('content', 'home', {
    hero_greeting: 'PROFESSOR • RESEARCHER • AUTHOR',
    hero_title: 'Creating Happy Leaders',
    hero_name: 'Prof. Vishal Gupta',
    hero_subtitle: 'IIM Ahmedabad Professor. Researcher. Thought Leader.',
    hero_description:
      'Professor in Organizational Behavior at the Indian Institute of Management Ahmedabad (IIMA)',
    hero_linkedin: 'https://in.linkedin.com/in/vishal-gupta-iima',
    hero_address: '502, Forum Tower, IIMA New Campus',
    hero_phone: '+91-79-7152-4935',

    courses_heading: 'Management Courses',
    course1_title: 'The Science of Leadership',
    course1_description:
      'Master the art and science of leading high-performing teams in complex organizational environments.',
    course1_youtube: '',
    course2_title: 'Strategy for Executives',
    course2_description:
      'Develop strategic thinking capabilities to drive innovation and competitive advantage in dynamic markets.',
    course2_youtube: '',

    blog1_title: 'The Future of Strategic Leadership in Digital Age',
    blog1_excerpt:
      'Exploring how leaders can navigate uncertainty and drive transformation in rapidly evolving business landscapes.',
    blog1_image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    blog2_title: 'Building Resilient Organizations Through Adaptive Strategy',
    blog2_excerpt:
      'Key insights on developing organizational capabilities that enable sustainable competitive advantage.',
    blog2_image:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop',
    blog3_title: 'The Psychology of Decision-Making in Executive Teams',
    blog3_excerpt:
      'Understanding cognitive biases and behavioral patterns that shape strategic choices at the highest level.',
    blog3_image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',

    books_heading: 'Published Books',
    book1_title: 'Leading Through Complexity',
    book1_description: 'A comprehensive guide to navigating uncertainty and driving organizational change.',
    book1_image:
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    book2_title: 'The Strategic Mindset',
    book2_description: 'Developing the cognitive capabilities required for effective strategic leadership.',
    book2_image:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    book3_title: 'Organizational Behavior in Practice',
    book3_description: 'Real-world applications of behavioral science in modern organizations.',
    book3_image:
      'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop',

    speaking_heading: 'Speaking Engagements with Prof. Gupta',
    speaking_description:
      'Prof. Gupta delivers keynotes, executive workshops, and thought-provoking talks at leading organizations, conferences, and academic events around the world.',
    contact_map_image:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=800&fit=crop',

    newsletter_heading: 'Wisdom delivered to your inbox.',
    newsletter_description:
      "Don't miss out on new insights on leadership, strategy, and organizational excellence. Sign up for the latest research findings, course updates, and thought-provoking ideas."
  });

  const { data: blogsRaw, loading: blogsLoading } = useFirestoreCollection(
    'blogs',
    [where('published', '==', true)],
    true
  );

  const { data: courses, loading: coursesLoading } = useFirestoreCollection('courses', [
    where('published', '==', true),
    limit(6)
  ]);

  const { data: testimonialsRaw, loading: testimonialsLoading } = useFirestoreCollection(
    'testimonials',
    [where('published', '==', true)]
  );
  const testimonials = testimonialsRaw?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

  const { data: trainingLogosRaw, loading: logosLoading } = useFirestoreCollection(
    'training_partners',
    [where('published', '==', true)]
  );
  const trainingLogos = trainingLogosRaw?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

  const { data: booksData, loading: booksLoading } = useFirestoreCollection('books', [
    where('published', '==', true)
  ]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNewsletterStatus({ message: '', type: '' });

    try {
      const result = await subscribeToNewsletter(newsletterEmail);
      console.log('Newsletter subscribe result:', result);
      setNewsletterStatus({
        message: result.message,
        type: result.success ? 'success' : 'error'
      });
      if (result.success) {
        setNewsletterEmail('');
        setTimeout(() => setNewsletterStatus({ message: '', type: '' }), 5000);
      }
    } catch (err) {
      console.error('Newsletter subscribe error (outer catch):', err);
      setNewsletterStatus({
        message: 'Something went wrong (outer catch). Please try again later.',
        type: 'error'
      });
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    const allItems = testimonials && testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;
    const totalPages = Math.ceil(allItems.length / 3);
    if (totalPages <= 1) return;

    const timer = setInterval(() => {
      setTestimonialPage((prev) => (prev + 1) % totalPages);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials]);

  if (loading || blogsLoading || coursesLoading || testimonialsLoading || logosLoading || booksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#004B8D] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-['Inter'] text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const blogs = [...(blogsRaw || [])].sort((a, b) => {
    const ta = a.date?.toDate ? a.date.toDate() : new Date(a.date || 0);
    const tb = b.date?.toDate ? b.date.toDate() : new Date(b.date || 0);
    return tb - ta;
  });

  const homeBlogs = blogs.filter((b) => b.showOnHome);
  const recentBlogs =
    homeBlogs.length > 0
      ? homeBlogs
      : blogs.length > 0
      ? blogs
      : [
          {
            id: 'b1',
            title: data.blog1_title,
            excerpt: data.blog1_excerpt,
            imageUrl: data.blog1_image,
            date: '2026-02-01',
            slug: 'blog-1'
          },
          {
            id: 'b2',
            title: data.blog2_title,
            excerpt: data.blog2_excerpt,
            imageUrl: data.blog2_image,
            date: '2026-01-28',
            slug: 'blog-2'
          },
          {
            id: 'b3',
            title: data.blog3_title,
            excerpt: data.blog3_excerpt,
            imageUrl: data.blog3_image,
            date: '2026-01-15',
            slug: 'blog-3'
          }
        ];

  const homeBooksList = (booksData || []).filter((b) => b.showOnHome);

  const staticBooksList = [
    {
      tf: 'book1_title',
      df: 'book1_description',
      imgf: 'book1_image',
      linkf: 'book1_link',
      fb: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'
    },
    {
      tf: 'book2_title',
      df: 'book2_description',
      imgf: 'book2_image',
      linkf: 'book2_link',
      fb: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop'
    },
    {
      tf: 'book3_title',
      df: 'book3_description',
      imgf: 'book3_image',
      linkf: 'book3_link',
      fb: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop'
    }
  ];

  return (
    <div className="bg-white overflow-x-hidden">
      {/* 1. HERO */}
     {/* 1. HERO */}
<section
  className="grid lg:grid-cols-2 items-stretch px-4 sm:px-6 lg:px-16 py-8 lg:py-0 gap-8 lg:gap-0 relative overflow-hidden hero-section"
  style={{ background: 'linear-gradient(135deg, #1a2d52 0%, #1e3461 40%, #162647 100%)', minHeight: 'clamp(640px, 82vh, 920px)' }}
>
  <style>{`
    /* Static yellow underline with hover color */
    .hero-shimmer-line {
      height: 3px;
      width: clamp(120px, 12vw, 260px);
      background: #F5C400; /* solid yellow */
      border-radius: 9999px;
      margin-top: 8px;
      transition: background-color 0.2s ease, transform 0.15s ease;
      cursor: pointer;
    }
    .hero-shimmer-line:hover {
      background: #004B8D; /* blue on hover */
    }

    /* Photo ring: replace gradient glow with single solid yellow border */
    .hero-photo-ring {
      position: relative;
      border-radius: 1rem;
      transition: transform 0.2s ease;
    }
    .hero-photo-ring::before {
      content: '';
      position: absolute;
      inset: -6px;
      border-radius: 1.25rem;
      background: #ffd700; /* solid yellow */
      opacity: 0; /* hidden by default, revealed on hover */
      transform: scale(0.96);
      transition: opacity 0.36s ease, transform 0.36s ease, box-shadow 0.36s ease;
      box-shadow: 0 10px 30px rgba(255, 215, 0, 0.06);
      z-index: -1;
    }
    .hero-photo-ring:hover::before,
    .hero-photo-ring:focus-within::before {
      opacity: 1;
      transform: scale(1.06);
      /* only yellow glow on hover, no gradient or blue */
      box-shadow: 0 14px 40px rgba(255, 215, 0, 0.18);
    }
    .hero-photo-ring:hover .hero-profile-photo,
    .hero-photo-ring:focus-within .hero-profile-photo {
      transform: scale(1.02);
      box-shadow: 0 14px 34px rgba(0, 0, 0, 0.28);
    }
    .hero-profile-photo {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border-radius: 1rem;
      overflow: hidden;
    }

    /* Button glow effects */
    .hero-btn-primary {
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .hero-btn-primary::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #FFD700, #F5C400, #FFA500);
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: inherit;
    }
    .hero-btn-primary:hover::after {
      opacity: 1;
    }
    .hero-btn-primary:hover {
      box-shadow: 0 0 20px rgba(245, 196, 0, 0.5), 0 6px 20px rgba(0,0,0,0.3);
      transform: translateY(-2px) scale(1.04);
    }
    .hero-btn-primary span {
      position: relative;
      z-index: 1;
    }

    /* Credential pills */
    .hero-credential {
      transition: all 0.3s ease;
      cursor: default;
    }
    .hero-credential:hover {
      background: rgba(245, 196, 0, 0.15);
      border-color: rgba(245, 196, 0, 0.6);
      color: #F5C400;
      transform: translateX(4px);
    }

    /* Mobile adjustments to improve hero layout on small screens */
    @media (max-width: 640px) {
      .hero-section {
        /* Horizontally split the screen: top = image, bottom = text */
        min-height: calc(100vh - 64px);
        padding-top: 0;
        padding-bottom: 0;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr;
        align-items: stretch;
        gap: 0;
      }
      .hero-shimmer-line {
        width: 96px;
      }
      .hero-image-col { grid-row: 1; display:flex; align-items:center; justify-content:center; padding-top: 12px; }
      .hero-text-col { grid-row: 2; display:flex; align-items:center; }
      .hero-profile-photo {
        width: 100%;
        height: 100%;
        max-height: 100%;
        object-fit: cover;
        border-radius: 12px;
      }
      /* Make the hero image much larger on mobile: fill the top half */
      .hero-image-col .hero-profile-photo {
        max-width: 100% !important;
        width: 100% !important;
        height: 52vh !important;
        object-fit: cover !important;
        border-radius: 10px;
      }
      .hero-photo-ring {
        display: flex;
        justify-content: center;
        padding-bottom: 8px;
      }
      .hero-title {
        font-size: 1.5rem !important;
        line-height: 1.02 !important;
        margin-bottom: 6px;
      }
      .hero-description { display:block; font-size:0.9rem !important; }
      .hero-text-col .flex { width: 100%; }
      /* ensure text column uses full available width */
      .hero-section > .flex {
        max-width: 100% !important;
        padding-left: 0.75rem;
        padding-right: 0.75rem;
      }
      .hero-greeting { font-size: 0.675rem !important; }
      .hero-name { font-size: 1.05rem !important; }
      .hero-description { display: none; }
      .hero-btn-primary {
        padding: 0.5rem 0.75rem !important;
      }
    }
  `}</style>

  {/* Subtle background orbs */}
  <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#004B8D]/10 rounded-full blur-3xl pointer-events-none" />
  <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#F5C400]/5 rounded-full blur-3xl pointer-events-none" />

  <div className="flex flex-col justify-center space-y-4 sm:space-y-5 w-full h-full relative z-10 order-1 lg:order-1 hero-text-col"
    style={{ maxWidth: 'min(640px, 54vw)' }}>
    <motion.div
      initial={{ opacity: 0, y: 45 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      <EditableText
        field="hero_greeting"
        defaultValue={data.hero_greeting}
        className="text-sm sm:text-base md:text-lg font-['Inter'] font-semibold tracking-[0.25em] uppercase text-[#F5C400] mb-4 block"
      />

      <EditableText
        field="hero_title"
        defaultValue={data.hero_title || 'Creating Happy Leaders'}
        className={`${GLOBAL_HEADING} text-white leading-[1.05] mb-2 block hero-title`}
      />
      {/* Animated shimmer underline */}
      <div className="hero-shimmer-line mb-3" />

      <EditableText
        field="hero_name"
        defaultValue={data.hero_name}
        className={`${GLOBAL_HEADING} text-[#F5C400] font-semibold mb-4 block`}
      />

      <EditableText
        field="hero_description"
        defaultValue={data.hero_description}
        className={`${GLOBAL_BODY} text-gray-300 leading-relaxed block mb-4`}
        multiline={true}
      />

      <div className="flex items-center gap-4">
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.7 }}
      className="space-y-4"
    >
      <div className="flex flex-wrap gap-3 justify-start">
        <div className="relative inline-block">
          <Link to="/about">
            <button className="hero-btn-primary bg-[#F5C400] inline-flex items-center justify-center px-6 py-3.5 font-['Inter'] font-bold text-[#0B1628] text-sm rounded-md shadow-lg">
              {!isAdmin ? (
                <span
                  className="text-sm sm:text-base font-['Inter'] font-bold text-[#0B1628]"
                  dangerouslySetInnerHTML={{ __html: renderRichText(data?.hero_cta_text || 'Get in Touch') }}
                />
              ) : (
                <span className="opacity-0">{data?.hero_cta_text || 'Get in Touch'}</span>
              )}
            </button>
          </Link>

          {/* Editable overlay placed outside the interactive Link/button to avoid nested interactive elements */}
          {isAdmin && (
            <div className="absolute inset-0 flex items-center justify-start pointer-events-none">
              <div className="flex items-center justify-center w-full pointer-events-auto">
                <EditableText
                  collection="content"
                  docId="home"
                  field="hero_cta_text"
                  defaultValue={data?.hero_cta_text || 'Get in Touch'}
                  className="w-full inline-block text-sm sm:text-base font-['Inter'] font-bold text-[#0B1628] text-center px-2"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  </div>

  <motion.div
    initial={{ opacity: 0, scale: 0.95, x: 30 }}
    animate={{ opacity: 1, scale: 1, x: 0 }}
    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
    className="relative z-10 flex items-center justify-center h-full order-2 lg:order-2 hero-image-col"
  >
    <div className="hero-photo-ring">
    <div className="hero-profile-photo w-full aspect-[3/4] shadow-[0_20px_40px_rgba(0,0,0,0.4)] bg-[#1a2d52] overflow-hidden" style={{ maxWidth: 'min(430px, 38vw)' }}>
        <img
          src={data.hero_image || '/prof-gupta.jpg'}
          alt="Prof. Vishal Gupta"
          className="w-full h-full object-cover object-top"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/600x800/1a2d4f/ffffff?text=Prof.+Vishal+Gupta';
          }}
        />
      </div>
    </div>
  </motion.div>
</section>
      {/* 2. COURSES */}
      <section id="courses" className="full-screen-section bg-white pt-6 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            className="text-center mb-8 group"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <EditableText
              field="courses_heading"
              defaultValue={data.courses_heading}
              className={`${GLOBAL_HEADING} text-[#111111] mb-3 block transition-colors duration-300`}
            />
            <div className="w-24 h-1 bg-[#004B8D] rounded-full mx-auto group-hover:bg-[#F5C400] transition-colors duration-300 group-hover:w-32 transition-all" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={staggerContainer}
          >
            {courses && courses.filter((c) => c.showOnHome).length > 0 ? (
              courses.filter((c) => c.showOnHome).map((course) => {
                const videoId = course.youtubeUrl ? extractVideoId(course.youtubeUrl) : null;
                const thumbnailUrl =
                  course.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);

                return (
                  <motion.div
                    key={course.id}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className={`${UNIFORM_CARD} border-l-4 border-l-[#004B8D]`}
                  >
                    <div className={UNIFORM_IMAGE_WRAP}>
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={course.title}
                          className={UNIFORM_IMAGE}
                          onError={(e) => {
                            if (videoId && !course.thumbnail) {
                              e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#ebf2f8]" />
                      )}
                    </div>

                    <div className={UNIFORM_BODY}>
                      <h3 className={UNIFORM_TITLE}>{course.title}</h3>

                      <p className={`${UNIFORM_TEXT} mt-4`}>
                        {course.description}
                      </p>

                      <motion.button
                        whileHover={{ backgroundColor: '#004B8D' }}
                        className={UNIFORM_BUTTON}
                      >
                        EXPLORE COURSE
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              [
                { titleF: 'course1_title', descF: 'course1_description', ytF: 'course1_youtube' },
                { titleF: 'course2_title', descF: 'course2_description', ytF: 'course2_youtube' }
              ].map((c, i) => {
                const videoId = data[c.ytF] ? extractVideoId(data[c.ytF]) : null;

                return (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02, y: -4 }}
                    transition={{ duration: 0.3 }}
                    className={`${UNIFORM_CARD} border-l-4 border-l-[#004B8D]`}
                  >
                    <div className={UNIFORM_IMAGE_WRAP}>
                      {videoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                          alt=""
                          className={UNIFORM_IMAGE}
                          onError={(e) => {
                            e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#ebf2f8]" />
                      )}
                    </div>

                    <div className={UNIFORM_BODY}>
                      <EditableText
                        field={c.titleF}
                        defaultValue={data[c.titleF]}
                        className={`${UNIFORM_TITLE} block`}
                      />

                      <EditableText
                        field={c.descF}
                        defaultValue={data[c.descF]}
                        className={`${UNIFORM_TEXT} mt-4 block`}
                        multiline
                      />

                      <motion.button
                        whileHover={{ backgroundColor: '#004B8D' }}
                        className={UNIFORM_BUTTON}
                      >
                        EXPLORE COURSE
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </div>
      </section>

      {/* 3. BLOGS */}
            <section id="blog" className="py-2 px-4 sm:px-6 lg:px-16 bg-[#ebf2f8]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="mb-4 group"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                <div className="group">
                <EditableText
                  field="blog_heading"
                  defaultValue={data.blog_heading || 'My Blogs'}
                  className={`${GLOBAL_HEADING} text-[#111111] block transition-colors duration-300`}
                />
                <div className="w-24 h-1 bg-[#004B8D] rounded-full mt-4 mx-auto group-hover:bg-[#F5C400] group-hover:w-32 transition-all duration-300" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-3 mb-2"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInLeft}
          >
          
            
            <div className="h-px flex-1 bg-gray-200" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={staggerContainer}
          >
            {recentBlogs.slice(0, 6).map((blog, index) => (
              <motion.div
                key={blog.id || index}
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
                className={UNIFORM_CARD}
              >
                <div className={UNIFORM_IMAGE_WRAP}>
                  <img
                    src={blog.imageUrl || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop'}
                    alt={blog.title}
                    className={UNIFORM_IMAGE}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/600x400/e6e8ff/2A35CC?text=Article';
                    }}
                  />
                </div>

                <div className={UNIFORM_BODY}>
                  {blog.date && (
                    <div className={UNIFORM_META}>
                      <FiCalendar size={14} className="text-[#004B8D]" />
                      <p>{formatDate(blog.date)}</p>
                    </div>
                  )}

                  <h4 className={UNIFORM_TITLE}>{blog.title}</h4>

                  <p className={`${UNIFORM_TEXT} mt-4`}>
                    {blog.excerpt}
                  </p>

                  <div className={UNIFORM_FOOTER}>
                    <Link
                      to={blog.slug ? `/blog/${blog.slug}` : '#'}
                      className="inline-flex items-center gap-2 text-[#004B8D] font-['Inter'] font-semibold text-sm sm:text-base"
                    >
                      Read Article
                      <FiArrowRight size={16} />
                    </Link>

                    <span className="text-xs sm:text-sm font-['Inter'] font-semibold tracking-[0.2em] text-gray-400 uppercase">
                      Preview
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-6"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
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

      {/* 4. TESTIMONIALS */}
      <section className="full-screen-section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            className="text-center mb-12 group"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-10 bg-[#004B8D]" />
              <FiStar className="text-[#004B8D]" size={14} />
              <div className="h-px w-10 bg-[#004B8D]" />
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#111111] mb-2">
              What People Say
            </h2>
            <div className="w-24 h-1 bg-[#004B8D] rounded-full mx-auto group-hover:bg-[#F5C400] group-hover:w-32 transition-all duration-300" />
          </motion.div>

        {(() => {
          const allItems = testimonials && testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS;
          const totalPages = Math.ceil(allItems.length / 3);
          const currentPage = testimonialPage % totalPages;
          const currentItems = allItems.slice(currentPage * 3, currentPage * 3 + 3);

          return (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {currentItems.map((t, i) => (
                  <div
                    key={`${currentPage}-${i}`}
                    className="w-full max-w-[470px] mx-auto bg-white rounded-[32px] overflow-hidden border border-gray-200 shadow-sm flex flex-col h-full min-h-[380px] p-6"
                  >
                    <div className="flex-1">
                      <p className="text-base font-['Inter'] text-gray-700 leading-relaxed">
                        "{t.quote}"
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-200">
                      <p className="text-sm font-['Inter'] font-semibold text-[#004B8D]">
                        — {t.author}
                      </p>
                      <p className="text-sm font-['Inter'] text-gray-400 mt-1">
                        {t.role}
                        {t.organization ? `, ${t.organization}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setTestimonialPage(i)}
                      style={{ transition: 'all 0.3s' }}
                      className={`h-2 rounded-full ${i === currentPage ? 'w-6 bg-[#004B8D]' : 'w-2 bg-gray-300'}`}
                      aria-label={`Go to page ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })()}
        </div>
      </section>

   {/* 5. TRAININGS DELIVERED */}
<section id="trainings" className="full-screen-section bg-[#ebf2f8] min-h-screen">
  <style>{`
    @keyframes logos-scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .logos-track {
      display: flex;
      align-items: center;
      width: max-content;
      animation: logos-scroll 30s linear infinite;
    }
    .logos-track:hover {
      animation-play-state: paused;
    }
  `}</style>
  <motion.div
    className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-12 group"
    initial="hidden"
    whileInView="visible"
    viewport={viewportOptions}
    variants={fadeInUp}
  >
    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#111111] mb-4 transition-colors duration-300">
      Trainings Delivered For
    </h2>
    <div className="w-24 h-1 bg-[#004B8D] rounded-full mx-auto mb-6 group-hover:bg-[#F5C400] group-hover:w-32 transition-all duration-300" />
    <p className="text-base sm:text-lg text-gray-600 font-['Inter'] max-w-3xl mx-auto">
      From leading academic institutions to global corporations, Prof. Gupta has delivered transformative training programs.
    </p>
  </motion.div>
  {(() => {
    const logoItems =
      trainingLogos && trainingLogos.length > 0
        ? trainingLogos
        : [
            { id: 'f1', name: 'IIM Ahmedabad', logoUrl: '' },
            { id: 'f2', name: 'Coursera', logoUrl: '' },
            { id: 'f3', name: 'Delhi Public Schools', logoUrl: '' },
            { id: 'f4', name: 'Rushil Decor', logoUrl: '' },
            { id: 'f5', name: 'University of Northern Iowa', logoUrl: '' },
            { id: 'f6', name: 'University of Mumbai', logoUrl: '' },
            { id: 'f7', name: 'ISRO', logoUrl: '' },
            { id: 'f8', name: 'Larsen & Toubro', logoUrl: '' }
          ];
    const doubled = [...logoItems, ...logoItems];
    return (
      <div className="overflow-hidden w-screen -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="logos-track px-4 sm:px-6 lg:px-8">
          {doubled.map((logo, i) => (
            <div
              key={`logo-${i}`}
              className="flex-shrink-0 flex items-center justify-center h-24 lg:h-32 px-10 py-5 mx-4 bg-white rounded-lg shadow-md border border-gray-200"
              style={{ minWidth: '200px' }}
            >
              {logo.logoUrl ? (
                <>
                  <img
                    src={logo.logoUrl}
                    alt={logo.name}
                    className="max-h-full w-auto object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <span className="font-['Inter'] font-bold text-gray-700 text-center hidden text-sm">
                    {logo.name}
                  </span>
                </>
              ) : (
                <span className="font-['Inter'] font-bold text-gray-700 text-center text-sm lg:text-lg whitespace-nowrap">
                  {logo.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  })()}
</section>
      {/* 6. BOOKS */}
      <section id="books" className="full-screen-section bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            className="text-center mb-12 group"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <EditableText
              field="books_heading"
              defaultValue={data.books_heading}
              className={`${GLOBAL_HEADING} text-[#111111] block mb-3`}
            />
            <div className="w-24 h-1 bg-[#004B8D] rounded-full mx-auto group-hover:bg-[#F5C400] group-hover:w-32 transition-all duration-300" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={staggerContainer}
          >
            {homeBooksList.length > 0 ? (
              homeBooksList.map((book) => (
                <motion.div
                  key={book.id}
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className={UNIFORM_CARD}
                >
                  {/* FIXED: use BOOK_IMAGE_WRAP for proper portrait aspect ratio */}
                  <div className={BOOK_IMAGE_WRAP}>
                    <img
                      src={book.coverUrl || 'https://via.placeholder.com/600x800/e6e8ff/2A35CC?text=Book'}
                      alt={book.title}
                      className={BOOK_IMAGE}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x800/e6e8ff/2A35CC?text=Book';
                      }}
                    />
                  </div>

                  <div className={UNIFORM_BODY}>
                    <h3 className={UNIFORM_TITLE}>{book.title}</h3>

                    <p className="text-sm font-['Inter'] text-gray-500 mt-3 min-h-[48px]">
                      {book.authors || ''}
                    </p>

                    <p className="text-sm font-['Inter'] text-[#004B8D] font-semibold mt-2 min-h-[24px]">
                      {book.year ? `${book.year}${book.publisher ? ` · ${book.publisher}` : ''}` : ''}
                    </p>

                    <motion.a
                      href={book.amazonLink || 'https://www.amazon.in'}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03, backgroundColor: '#004B8D' }}
                      whileTap={{ scale: 0.97 }}
                      className={UNIFORM_BUTTON}
                    >
                      Buy on Amazon
                      <FiArrowRight size={14} />
                    </motion.a>
                  </div>
                </motion.div>
              ))
            ) : (
              staticBooksList.map((book, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                  className={UNIFORM_CARD}
                >
                  {/* FIXED: use BOOK_IMAGE_WRAP for proper portrait aspect ratio */}
                  <div className={BOOK_IMAGE_WRAP}>
                    <img
                      src={data[book.imgf] || book.fb}
                      alt="Book cover"
                      className={BOOK_IMAGE}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x800/e6e8ff/2A35CC?text=Book';
                      }}
                    />
                  </div>

                  <div className={UNIFORM_BODY}>
                    <EditableText
                      field={book.tf}
                      defaultValue={data[book.tf]}
                      className={`${UNIFORM_TITLE} block`}
                    />

                    <EditableText
                      field={book.df}
                      defaultValue={data[book.df]}
                      className="text-sm font-['Inter'] text-gray-500 leading-relaxed block mt-4 min-h-[72px]"
                      multiline={true}
                    />

                    <motion.a
                      href={data[book.linkf] || 'https://www.amazon.in'}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03, backgroundColor: '#004B8D' }}
                      whileTap={{ scale: 0.97 }}
                      className={UNIFORM_BUTTON}
                    >
                      Buy on Amazon
                      <FiArrowRight size={14} />
                    </motion.a>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          <motion.div
            className="text-center mt-8"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
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

      {/* 7. SPEAKING */}
      <section id="contact" className="grid lg:grid-cols-2 min-h-[600px]">
        <motion.div
          className="bg-[#ebf2f8] p-6 sm:p-12 lg:p-20 flex flex-col justify-center items-start order-2 lg:order-1 relative overflow-hidden border-l-4 border-[#004B8D]"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          variants={fadeInLeft}
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#004B8D]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="w-20 h-1 bg-[#004B8D] mb-6 rounded-full" />

          <EditableText
            field="speaking_heading"
            defaultValue={data.speaking_heading}
            className={`${GLOBAL_HEADING} text-[#111111] mb-6 leading-tight block relative z-10`}
          />

          <EditableText
            field="speaking_description"
            defaultValue={data.speaking_description}
            className={`${GLOBAL_BODY} text-gray-700 mb-10 max-w-lg leading-relaxed block relative z-10`}
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
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          variants={fadeInRight}
        >
          <img
            src={data.contact_map_image || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=800&fit=crop'}
            alt="Prof. Gupta speaking at an event"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/1200x800/1a1a1a/ffffff?text=Speaking+Event';
            }}
          />
        </motion.div>
      </section>

      {/* 8. NEWSLETTER */}
      <section id="newsletter" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-16 bg-[#ffffff]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInLeft}
          >
            <div className="w-12 h-1 bg-[#004B8D] mb-5 rounded-full" />
            <EditableText
              field="newsletter_heading"
              defaultValue={data.newsletter_heading}
              className={`${GLOBAL_HEADING} text-[#111111] leading-tight block`}
            />
          </motion.div>

          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInRight}
          >
            <EditableText
              field="newsletter_description"
              defaultValue={data.newsletter_description}
              className={`${GLOBAL_BODY} text-gray-700 leading-relaxed block`}
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
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Subscribing...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </motion.button>
              </div>

              {newsletterStatus.message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-md flex items-start gap-3 ${
                    newsletterStatus.type === 'success'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {newsletterStatus.type === 'success' && (
                    <FiCheck className="text-green-600 text-xl flex-shrink-0 mt-0.5" />
                  )}
                  <p
                    className={`text-sm font-['Inter'] ${
                      newsletterStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
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