import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import EditableText from '../components/EditableText';
import { FiArrowRight, FiBookOpen, FiStar, FiMail, FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { subscribeToNewsletter } from '../utils/newsletter';
import { where, orderBy, limit } from 'firebase/firestore';

export default function Home() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Testimonial slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Animation variants - Subtle fade effect (like drlauriesantos.com)
  const fadeInUp = {
    hidden: { opacity: 0.85, y: 8 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }
  };

  // Stagger container for multiple items
  const staggerContainer = {
    hidden: { opacity: 0.85 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.05
      }
    }
  };

  // Viewport options for scroll-triggered animations
  const viewportOptions = {
    once: true,
    margin: "0px 0px -50px 0px",
    amount: 0.2
  };
  
  // Helper function to extract YouTube video ID from various URL formats
  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };
  
  // Fetch data from Firestore 'content/home' document
  const { data, loading } = useFirestoreDoc('content', 'home', {
    // Default data structure matching your Firebase screenshot
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
    blog_heading: "Recent Reflections",
    blog1_title: "The Future of Strategic Leadership in Digital Age",
    blog1_excerpt: "Exploring how leaders can navigate uncertainty and drive transformation in rapidly evolving business landscapes.",
    blog1_image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    blog2_title: "Building Resilient Organizations Through Adaptive Strategy",
    blog2_excerpt: "Key insights on developing organizational capabilities that enable sustainable competitive advantage.",
    blog2_image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop",
    blog3_title: "The Psychology of Decision-Making in Executive Teams",
    blog3_excerpt: "Understanding cognitive biases and behavioral patterns that shape strategic choices at the highest level.",
    blog3_image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
    testimonial_quote: "Creating Happy Leaders",
    testimonial_author: "— Prof. Vishal Gupta, IIM Ahmedabad",
    books_heading: "Published Works",
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

  // Fetch published blogs (limit 3, ordered by date)
  const { data: blogs, loading: blogsLoading } = useFirestoreCollection('blogs', [
    where('published', '==', true),
    orderBy('date', 'desc'),
    limit(3)
  ]);

  // Fetch published courses
  const { data: courses, loading: coursesLoading } = useFirestoreCollection('courses', [
    where('published', '==', true),
    limit(6)
  ]);

  // Fetch published testimonials
  const { data: testimonialsRaw, loading: testimonialsLoading } = useFirestoreCollection('testimonials', [
    where('published', '==', true)
  ]);
  
  // Sort testimonials by order field in JavaScript
  const testimonials = testimonialsRaw?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

  // Fetch published training logos
  const { data: trainingLogosRaw, loading: logosLoading } = useFirestoreCollection('training_partners', [
    where('published', '==', true)
  ]);
  
  // Sort training logos by order field in JavaScript
  const trainingLogos = trainingLogosRaw?.sort((a, b) => (a.order || 0) - (b.order || 0)) || [];

  // Newsletter subscription handler
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNewsletterStatus({ message: '', type: '' });

    const result = await subscribeToNewsletter(newsletterEmail);
    
    setNewsletterStatus({
      message: result.message,
      type: result.success ? 'success' : 'error'
    });

    if (result.success) {
      setNewsletterEmail('');
      setTimeout(() => {
        setNewsletterStatus({ message: '', type: '' });
      }, 5000);
    }

    setIsSubmitting(false);
  };

  // Testimonial slider handlers - show 1 at a time
  const totalTestimonials = testimonials ? testimonials.length : 0;

  const nextSlide = () => {
    if (totalTestimonials > 0) {
      setCurrentSlide((prev) => (prev + 1) % totalTestimonials);
    }
  };

  const prevSlide = () => {
    if (totalTestimonials > 0) {
      setCurrentSlide((prev) => (prev - 1 + totalTestimonials) % totalTestimonials);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-play testimonials slider
  useEffect(() => {
    if (!isPaused && totalTestimonials > 0) {
      const interval = setInterval(() => {
        nextSlide();
      }, 8000); // Change slide every 8 seconds

      return () => clearInterval(interval);
    }
  }, [currentSlide, isPaused, totalTestimonials]);

  // Debug testimonials
  useEffect(() => {
    console.log('Testimonials data:', testimonials);
    console.log('Testimonials count:', testimonials?.length || 0);
  }, [testimonials]);

  // Show loading state
  if (loading || blogsLoading || coursesLoading || testimonialsLoading || logosLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-['Inter'] text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      
      {/* ========== 1. HERO SECTION ========== */}
      <section className="min-h-screen grid lg:grid-cols-2 items-center px-6 lg:px-16 py-8 sm:py-12 bg-[#faf8f5]">
        {/* Left: Large Text */}
        <div className="space-y-6 sm:space-y-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-1 bg-[#f97316] mb-6 rounded-full"></div>
            <EditableText
              field="hero_greeting"
              defaultValue={data.hero_greeting}
              className="text-lg font-['Inter'] text-gray-600 mb-4 block"
            />
            <EditableText
              field="hero_name"
              defaultValue={data.hero_name}
              className="text-4xl sm:text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#3B46FF] leading-tight mb-4 sm:mb-6 block"
            />
            <EditableText
              field="hero_subtitle"
              defaultValue={data.hero_subtitle}
              className="text-lg sm:text-xl lg:text-2xl font-['Playfair_Display'] text-[#3B46FF] font-semibold mb-6 sm:mb-8 block"
            />
            <EditableText
              field="hero_description"
              defaultValue={data.hero_description}
              className="text-lg font-['Inter'] text-gray-600 leading-relaxed block"
              multiline={true}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <button className="bg-[#3B46FF] hover:bg-[#2A35CC] px-8 py-4 font-['Inter'] font-bold text-white text-base rounded-md transition-all shadow-lg hover:shadow-xl hover:scale-105">
              Learn More
            </button>
          </motion.div>
        </div>

        {/* Right: Professional Portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative mt-12 lg:mt-0"
        >
          <div className="aspect-[3/4] max-w-lg mx-auto lg:ml-auto rounded-2xl overflow-hidden shadow-2xl bg-gray-200 border-4 border-[#f97316]">
            <img 
              src={data.hero_image || "/prof-gupta.jpg"}
              alt="Prof. Vishal Gupta" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/800x1000/cccccc/333333?text=Prof.+Vishal+Gupta";
              }}
            />
          </div>
        </motion.div>
      </section>

      {/* ========== 2. COURSES SECTION ========== */}
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
              className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4 block"
            />
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={staggerContainer}
          >
            {/* Show dynamic courses if available, otherwise show static content */}
            {courses && courses.length > 0 ? (
              courses.slice(0, 2).map((course, index) => {
                const videoId = course.youtubeUrl ? extractVideoId(course.youtubeUrl) : null;
                // Use custom thumbnail if available, otherwise YouTube thumbnail
                const thumbnailUrl = course.thumbnail || 
                  (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);
                
                return (
                <motion.div 
                  key={course.id}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-[#f97316] via-[#ffc299] to-[#fff7ed] rounded-[32px] p-8 flex flex-col text-center shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-[#f97316]"
                >
                  <h3 className="text-3xl lg:text-4xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4 leading-tight">
                    {course.title}
                  </h3>
                  <p className="text-base font-['Inter'] text-gray-700 mb-6 leading-relaxed">
                    {course.description}
                  </p>
                  {thumbnailUrl && (
                    <div className="w-full mb-6">
                      <a 
                        href={course.youtubeUrl || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block relative group"
                      >
                        <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden shadow-md">
                          <img 
                            src={thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              // Fallback to lower quality if custom thumbnail fails
                              if (videoId && !course.thumbnail) {
                                e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                              }
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors shadow-lg">
                              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </a>
                    </div>
                  )}
                  <button className="mt-auto px-6 py-3 bg-[#3B46FF] hover:bg-[#2A35CC] text-white font-['Inter'] font-bold rounded-lg transition-all shadow-md hover:shadow-lg">
                    EXPLORE COURSE
                  </button>
                </motion.div>
                );
              })
            ) : (
              <>
                {/* Course Block 1 - Fallback */}
                <motion.div 
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-[#f97316] via-[#ffc299] to-[#fff7ed] rounded-[32px] p-8 flex flex-col text-center shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-[#f97316]"
                >
                  <EditableText
                    field="course1_title"
                    defaultValue={data.course1_title}
                    className="text-3xl lg:text-4xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4 leading-tight block"
                  />
                  <EditableText
                    field="course1_description"
                    defaultValue={data.course1_description}
                    className="text-base font-['Inter'] text-gray-700 mb-6 leading-relaxed block"
                    multiline={true}
                  />
                  {data.course1_youtube && (() => {
                    const videoId = extractVideoId(data.course1_youtube);
                    return videoId ? (
                      <div className="w-full mb-6">
                        <a 
                          href={`https://www.youtube.com/watch?v=${videoId}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block relative group"
                        >
                          <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden shadow-md">
                            <img 
                              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                              alt={data.course1_title}
                              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors shadow-lg">
                                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    ) : null;
                  })()}
                  <button className="mt-auto px-6 py-3 bg-[#3B46FF] hover:bg-[#2A35CC] text-white font-['Inter'] font-bold rounded-lg transition-all shadow-md hover:shadow-lg">
                    EXPLORE COURSE
                  </button>
                </motion.div>

                {/* Course Block 2 - Fallback */}
                <motion.div 
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-[#f97316] via-[#ffc299] to-[#fff7ed] rounded-[32px] p-8 flex flex-col text-center shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-[#f97316]"
                >
                  <EditableText
                    field="course2_title"
                    defaultValue={data.course2_title}
                    className="text-3xl lg:text-4xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4 leading-tight block"
                  />
                  <EditableText
                    field="course2_description"
                    defaultValue={data.course2_description}
                    className="text-base font-['Inter'] text-gray-700 mb-6 leading-relaxed block"
                    multiline={true}
                  />
                  {data.course2_youtube && (() => {
                    const videoId = extractVideoId(data.course2_youtube);
                    return videoId ? (
                      <div className="w-full mb-6">
                        <a 
                          href={`https://www.youtube.com/watch?v=${videoId}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block relative group"
                        >
                          <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden shadow-md">
                            <img 
                              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                              alt={data.course2_title}
                              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors shadow-lg">
                                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    ) : null;
                  })()}
                  <button className="mt-auto px-6 py-3 bg-[#3B46FF] hover:bg-[#2A35CC] text-white font-['Inter'] font-bold rounded-lg transition-all shadow-md hover:shadow-lg">
                    EXPLORE COURSE
                  </button>
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* ========== 3. RECENT BLOG / REFLECTIONS ========== */}
      <section id="blog" className="py-16 px-6 lg:px-16 bg-[#fff7ed]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <EditableText
              field="blog_heading"
              defaultValue={data.blog_heading}
              className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#1a1a1a] text-center mb-16 block"
            />
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={staggerContainer}
          >
            {/* Show dynamic blogs if available, otherwise show static content */}
            {blogs && blogs.length > 0 ? (
              blogs.map((blog, index) => (
                <motion.div 
                  key={blog.id} 
                  variants={fadeInUp}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/3] bg-gray-200 mb-5 overflow-hidden rounded-sm shadow-md">
                    <img 
                      src={blog.imageUrl || `https://images.unsplash.com/photo-${['1552664730-d307ca884978', '1517245386807-bb43f82c33c4', '1454165804606-c3d57bc86b40'][index % 3]}?w=800&h=600&fit=crop`}
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                      onError={(e) => e.target.src = `https://via.placeholder.com/800x600/1a1a1a/ffffff?text=Article+${index + 1}`}
                    />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-3 leading-tight group-hover:text-gray-700 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-sm font-['Inter'] text-gray-600 mb-3 leading-relaxed">
                    {blog.excerpt}
                  </p>
                  <p className="text-xs font-['Inter'] font-bold text-gray-400 tracking-wide">
                    {new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                  </p>
                </motion.div>
              ))
            ) : (
              <>
                {/* Blog Card 1 - Fallback */}
                <motion.div 
                  variants={fadeInUp}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/3] bg-gray-200 mb-5 overflow-hidden rounded-sm shadow-md">
                    <img 
                      src={data.blog1_image || "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"} 
                      alt="Blog post" 
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                      onError={(e) => e.target.src = "https://via.placeholder.com/800x600/1a1a1a/ffffff?text=Article+1"} 
                    />
                  </div>
                  <EditableText
                    field="blog1_title"
                    defaultValue={data.blog1_title}
                    className="text-xl lg:text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-3 leading-tight group-hover:text-gray-700 transition-colors block"
                  />
                  <EditableText
                    field="blog1_excerpt"
                    defaultValue={data.blog1_excerpt}
                    className="text-sm font-['Inter'] text-gray-600 mb-3 leading-relaxed block"
                    multiline={true}
                  />
                  <p className="text-xs font-['Inter'] font-bold text-gray-400 tracking-wide">FEBRUARY 8, 2026</p>
                </motion.div>

                {/* Blog Card 2 - Fallback */}
                <motion.div 
                  variants={fadeInUp}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/3] bg-gray-200 mb-5 overflow-hidden rounded-sm shadow-md">
                    <img 
                      src={data.blog2_image || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop"} 
                      alt="Blog post" 
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                      onError={(e) => e.target.src = "https://via.placeholder.com/800x600/1a1a1a/ffffff?text=Article+2"} 
                    />
                  </div>
                  <EditableText
                    field="blog2_title"
                    defaultValue={data.blog2_title}
                    className="text-xl lg:text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-3 leading-tight group-hover:text-gray-700 transition-colors block"
                  />
                  <EditableText
                    field="blog2_excerpt"
                    defaultValue={data.blog2_excerpt}
                    className="text-sm font-['Inter'] text-gray-600 mb-3 leading-relaxed block"
                    multiline={true}
                  />
                  <p className="text-xs font-['Inter'] font-bold text-gray-400 tracking-wide">JANUARY 28, 2026</p>
                </motion.div>

                {/* Blog Card 3 - Fallback */}
                <motion.div 
                  variants={fadeInUp}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[4/3] bg-gray-200 mb-5 overflow-hidden rounded-sm shadow-md">
                    <img 
                      src={data.blog3_image || "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop"} 
                      alt="Blog post" 
                      className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                      onError={(e) => e.target.src = "https://via.placeholder.com/800x600/1a1a1a/ffffff?text=Article+3"} 
                    />
                  </div>
                  <EditableText
                    field="blog3_title"
                    defaultValue={data.blog3_title}
                    className="text-xl lg:text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-3 leading-tight group-hover:text-gray-700 transition-colors block"
                  />
                  <EditableText
                    field="blog3_excerpt"
                    defaultValue={data.blog3_excerpt}
                    className="text-sm font-['Inter'] text-gray-600 mb-3 leading-relaxed block"
                    multiline={true}
                  />
                  <p className="text-xs font-['Inter'] font-bold text-gray-400 tracking-wide">JANUARY 15, 2026</p>
                </motion.div>
              </>
            )}
          </motion.div>

          <motion.div 
            className="text-center mt-14"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <button className="bg-[#3B46FF] hover:bg-[#2A35CC] px-12 py-4 font-['Inter'] font-bold text-white text-base rounded-md transition-all shadow-lg hover:shadow-xl hover:scale-105">
              My Research
            </button>
          </motion.div>
        </div>
      </section>

      {/* ========== 4. TESTIMONIALS SLIDER ========== */}
      <section className="py-16 bg-[#fb923c]">
        {/* Testimonial Slider - One at a time, centered */}
        <div 
          className="max-w-6xl mx-auto px-6 lg:px-20 relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Debug info */}
          {(!testimonials || testimonials.length === 0) && (
            <div className="text-center py-8">
              <p className="text-white font-bold">
                No testimonials found. Check console for details.
              </p>
              <p className="text-white/80 text-sm mt-2">
                Testimonials loading: {testimonialsLoading ? 'Yes' : 'No'} | 
                Count: {testimonials?.length || 0}
              </p>
            </div>
          )}
          
          {testimonials && testimonials.length > 0 ? (
            <>
              {/* Single Testimonial Display */}
              <div className="relative min-h-[400px] flex flex-col items-center justify-center py-12">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                  className="text-center px-4 lg:px-16"
                >
                  {/* Quote */}
                  <p className="text-2xl lg:text-4xl font-['Playfair_Display'] font-bold text-[#1a1a1a] leading-relaxed mb-10 max-w-4xl mx-auto">
                    "{testimonials[currentSlide]?.quote}"
                  </p>
                  
                  {/* Attribution */}
                  <div className="text-center">
                    <p className="text-lg lg:text-xl font-['Inter'] font-semibold text-[#1a1a1a] mb-2">
                      — {testimonials[currentSlide]?.author}
                    </p>
                    <p className="text-base lg:text-lg font-['Inter'] italic text-[#1a1a1a]/80">
                      {testimonials[currentSlide]?.role}
                      {testimonials[currentSlide]?.organization ? `, ${testimonials[currentSlide].organization}` : ''}
                    </p>
                  </div>
                </motion.div>

                {/* Desktop Navigation Buttons (Side) - Hidden on Mobile */}
                {testimonials.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#1a1a1a] p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 z-20"
                      aria-label="Previous testimonial"
                    >
                      <FiChevronLeft size={28} strokeWidth={3} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#1a1a1a] p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 z-20"
                      aria-label="Next testimonial"
                    >
                      <FiChevronRight size={28} strokeWidth={3} />
                    </button>
                  </>
                )}

                {/* Mobile Navigation Buttons (Bottom) - Hidden on Desktop */}
                {testimonials.length > 1 && (
                  <div className="flex lg:hidden gap-4 mt-8">
                    <button
                      onClick={prevSlide}
                      className="bg-white/90 hover:bg-white text-[#1a1a1a] p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110"
                      aria-label="Previous testimonial"
                    >
                      <FiChevronLeft size={24} strokeWidth={3} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="bg-white/90 hover:bg-white text-[#1a1a1a] p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110"
                      aria-label="Next testimonial"
                    >
                      <FiChevronRight size={24} strokeWidth={3} />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // Fallback - show 1 sample testimonial
            <div className="relative min-h-[400px] flex flex-col items-center justify-center py-12">
              <div className="text-center px-4 lg:px-16">
                {/* Quote */}
                <p className="text-2xl lg:text-4xl font-['Playfair_Display'] font-bold text-[#1a1a1a] leading-relaxed mb-10 max-w-4xl mx-auto">
                  "I have to admit that I wasn't sure what would be involved with your course, but I consider myself very blessed to have been a part of it. The historical aspect of Mahabharata was fascinating by itself, and I enjoyed the way you incorporated the epic with current leadership practices. Thank you very much for this unique opportunity!"
                </p>
                
                {/* Attribution */}
                <div className="text-center">
                  <p className="text-lg lg:text-xl font-['Inter'] font-semibold text-[#1a1a1a] mb-2">
                    — Colene Sassmann
                  </p>
                  <p className="text-base lg:text-lg font-['Inter'] italic text-[#1a1a1a]/80">
                    Class Participant 2023, MBA course, University of Northern Iowa
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========== 5. TRAININGS DELIVERED FOR ========== */}
      <section className="py-16 bg-[#fff7ed]">
        <motion.div 
          className="max-w-7xl mx-auto px-6"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          variants={fadeInUp}
        >
          <h2 className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#1a1a1a] text-center mb-6">
            Trainings Delivered For
          </h2>
          <p className="text-center text-gray-600 font-['Inter'] mb-12 max-w-3xl mx-auto">
            From leading academic institutions to global corporations, Prof. Gupta has delivered transformative training programs.
          </p>
        </motion.div>
        
        {/* Logos Grid Container */}
        <motion.div 
          className="max-w-7xl mx-auto px-6"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          variants={staggerContainer}
        >
          {/* Show dynamic logos if available, otherwise show static content */}
          {trainingLogos && trainingLogos.length > 0 ? (
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
              {trainingLogos.map((logo) => (
                <motion.div 
                  key={logo.id} 
                  variants={fadeInUp}
                  className="flex items-center justify-center h-16 lg:h-20"
                >
                  <img 
                    src={logo.logoUrl} 
                    alt={logo.name}
                    className="max-h-full w-auto object-contain transition-all duration-300 hover:scale-110"
                    style={{ maxWidth: '180px' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <span className="font-['Inter'] font-bold text-gray-700 text-center hidden">{logo.name}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
              {/* Static fallback logos */}
              <div className="flex items-center justify-center h-16 lg:h-20">
                <span className="font-['Inter'] font-bold text-gray-700 text-center text-xl">IIM Ahmedabad</span>
              </div>
              <div className="flex items-center justify-center h-16 lg:h-20">
                <span className="font-['Inter'] font-bold text-gray-700 text-center text-xl">Coursera</span>
              </div>
              <div className="flex items-center justify-center h-16 lg:h-20">
                <span className="font-['Inter'] font-bold text-gray-700 text-center text-xl">Delhi Public Schools</span>
              </div>
              <div className="flex items-center justify-center h-16 lg:h-20">
                <span className="font-['Inter'] font-bold text-gray-700 text-center text-xl">Rushil Decor</span>
              </div>
              <div className="flex items-center justify-center h-16 lg:h-20">
                <span className="font-['Inter'] font-bold text-gray-700 text-center text-xl">University of Northern Iowa</span>
              </div>
              <div className="flex items-center justify-center h-16 lg:h-20">
                <span className="font-['Inter'] font-bold text-gray-700 text-center text-xl">University of Mumbai</span>
              </div>
            </div>
          )}
        </motion.div>
      </section>

      {/* ========== 6. BOOKS SECTION ========== */}
      <section id="books" className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <EditableText
              field="books_heading"
              defaultValue={data.books_heading}
              className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#1a1a1a] text-center mb-12 block"
            />
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={staggerContainer}
          >
            {/* Book 1 */}
            <motion.div 
              variants={fadeInUp}
              className="group text-center"
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-yellow-50 to-white rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300 mb-6 border-2 border-yellow-300">
                <img 
                  src={data.book1_image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop"} 
                  alt="Book cover" 
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = "https://via.placeholder.com/600x800/ffcc00/1a1a1a?text=Book+1"}
                />
              </div>
              <EditableText
                field="book1_title"
                defaultValue={data.book1_title}
                className="text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-3 block"
              />
              <EditableText
                field="book1_description"
                defaultValue={data.book1_description}
                className="text-sm font-['Inter'] text-gray-600 mb-4 leading-relaxed block"
                multiline={true}
              />
              <a 
                href="#" 
                className="inline-block bg-[#3B46FF] hover:bg-[#2A35CC] text-white px-6 py-3 font-['Inter'] font-bold text-sm rounded-md transition-all shadow-md hover:shadow-lg"
              >
                Buy on Amazon
              </a>
            </motion.div>

            {/* Book 2 */}
            <motion.div 
              variants={fadeInUp}
              className="group text-center"
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-yellow-50 to-white rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300 mb-6 border-2 border-yellow-300">
                <img 
                  src={data.book2_image || "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop"} 
                  alt="Book cover" 
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = "https://via.placeholder.com/600x800/ffcc00/1a1a1a?text=Book+2"}
                />
              </div>
              <EditableText
                field="book2_title"
                defaultValue={data.book2_title}
                className="text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-3 block"
              />
              <EditableText
                field="book2_description"
                defaultValue={data.book2_description}
                className="text-sm font-['Inter'] text-gray-600 mb-4 leading-relaxed block"
                multiline={true}
              />
              <a 
                href="#" 
                className="inline-block bg-[#3B46FF] hover:bg-[#2A35CC] text-white px-6 py-3 font-['Inter'] font-bold text-sm rounded-md transition-all shadow-md hover:shadow-lg"
              >
                Buy on Amazon
              </a>
            </motion.div>

            {/* Book 3 */}
            <motion.div 
              variants={fadeInUp}
              className="group text-center"
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-yellow-50 to-white rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300 mb-6 border-2 border-yellow-300">
                <img 
                  src={data.book3_image || "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop"} 
                  alt="Book cover" 
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.src = "https://via.placeholder.com/600x800/ffcc00/1a1a1a?text=Book+3"}
                />
              </div>
              <EditableText
                field="book3_title"
                defaultValue={data.book3_title}
                className="text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-3 block"
              />
              <EditableText
                field="book3_description"
                defaultValue={data.book3_description}
                className="text-sm font-['Inter'] text-gray-600 mb-4 leading-relaxed block"
                multiline={true}
              />
              <a 
                href="#" 
                className="inline-block bg-[#3B46FF] hover:bg-[#2A35CC] text-white px-6 py-3 font-['Inter'] font-bold text-sm rounded-md transition-all shadow-md hover:shadow-lg"
              >
                Buy on Amazon
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========== 7. Digital Avatar (SPEAKING ENGAGEMENTS) ========== */}
      <section id="contact" className="grid lg:grid-cols-2 min-h-[600px]">
        <motion.div 
          className="bg-[#fb923c] p-12 lg:p-20 flex flex-col justify-center items-start order-2 lg:order-1"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          variants={fadeInUp}
        >
          <EditableText
            field="speaking_heading"
            defaultValue={data.speaking_heading}
            className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6 leading-tight block"
          />
          <EditableText
            field="speaking_description"
            defaultValue={data.speaking_description}
            className="text-lg font-['Inter'] text-gray-900 mb-10 max-w-lg leading-relaxed block"
            multiline={true}
          />
          <a 
            href="https://vishalgupta.kavisha.ai/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-white hover:bg-[#1a1a1a] hover:text-white px-10 py-4 font-['Inter'] font-bold text-base rounded-md shadow-lg hover:shadow-xl transition-all"
          >
            Digital Avatar
          </a>
        </motion.div>
        
        <motion.div 
          className="min-h-[400px] lg:min-h-full order-1 lg:order-2 bg-gray-200"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          variants={fadeInUp}
        >
          <img 
            src={data.contact_map_image ||"https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&h=800&fit=crop" }
            alt="Prof. Gupta speaking at an event" 
            className="w-full h-full object-cover"
            onError={(e) => e.target.src = "https://via.placeholder.com/1200x800/1a1a1a/ffffff?text=Speaking+Event"} 
          />
        </motion.div>
      </section>

      {/* ========== 8. NEWSLETTER ========== */}
      <section id="newsletter" className="py-16 px-6 lg:px-16 bg-[#fff7ed]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <EditableText
              field="newsletter_heading"
              defaultValue={data.newsletter_heading}
              className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#1a1a1a] leading-tight block"
            />
          </motion.div>
          
          <motion.div 
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
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
                  className="flex-1 px-5 py-4 border-2 border-gray-300 rounded-md font-['Inter'] focus:outline-none focus:border-[#fb923c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#3B46FF] hover:bg-[#2A35CC] px-10 py-4 font-['Inter'] font-bold text-white text-base rounded-md transition-all shadow-md hover:shadow-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#1a1a1a] border-t-transparent rounded-full animate-spin"></div>
                      Subscribing...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </div>
              
              {/* Success/Error Message */}
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
                  <p className={`text-sm font-['Inter'] ${
                    newsletterStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
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