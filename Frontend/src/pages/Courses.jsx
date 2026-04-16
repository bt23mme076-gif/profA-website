import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { FiYoutube, FiBook, FiUsers, FiTrendingUp, FiBarChart2, FiFileText, FiExternalLink, FiPlay, FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiChevronUp, FiChevronDown, FiBookOpen } from 'react-icons/fi';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import EditableText from '../components/EditableText';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, updateDoc, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

/* ─── Font Injection (Matching Books Page) ───────────────────────────── */
if (typeof document !== 'undefined') {
  const _coursesLink = document.createElement('link');
  _coursesLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap';
  _coursesLink.rel = 'stylesheet';
  document.head.appendChild(_coursesLink);
}

export default function Courses() {
  const { isAdmin } = useAuth() || {};
  const { data: pageData } = useFirestoreDoc('content', 'courses', {
    page_heading: 'Courses',
    page_subtitle: 'Welcome to my learning hub for students, researchers, and practitioners. Explore courses on life skills, leadership, and research methods.',
    mgmt_heading: 'Management Courses',
    featured_heading: 'Featured Courses',
    featured_subtitle: 'Comprehensive online courses combining science, practice, and ancient wisdom',
    research_heading: 'Research Methods',
    research_subtitle: 'Comprehensive lecture series on advanced research methodologies for scholars and practitioners',
    multilevel_title: 'Multilevel Modeling',
    multilevel_desc: 'Multilevel models (also known as hierarchical linear models, linear mixed-effect model, mixed models, nested data models, or random-effects models) are statistical models of parameters that vary at more than one level. These models are particularly appropriate for research designs where data for participants are organized at more than one level (e.g., employees nested under team leaders).',
    sem_title: 'Covariance-Based SEM',
    sem_desc: 'Structural Equation Modeling (SEM) is a statistical methodology widely used in social sciences research. SEM allows researchers to test complex models with multiple pathways, model latent variables with multiple indicators, investigate mediation and moderation systematically, and adjust for measurement error in predictor variables. This series provides a general introduction to CB-SEM using AMOS software.',
    psychometrics_title: 'Psychometrics',
    psychometrics_desc: 'Introduction to central concepts of measurement covering test construction, item analysis, reliability, validity, and measurement error. Includes hands-on sessions with SPSS and AMOS.',
    conditional_title: 'Conditional Process Analysis',
    conditional_desc: 'A comprehensive three-video series explaining mediation, moderation, and conditional process analysis with practical dataset examples.',
    manuscript_title: 'Manuscript Writing & Publishing',
    manuscript_desc: 'A 16-session series covering elements of manuscript writing and strategies for high-quality academic publishing. Includes instruction files and supplementary readings.',
    multilevel_drive: 'https://drive.google.com/drive/folders/1GTHqiJX1sEjSuVlhBmR_Z5DETrUwIHGd',
    multilevel_youtube: '',
    sem_drive: '',
    sem_youtube: '',
    psychometrics_drive: 'https://drive.google.com/drive/folders/',
    psychometrics_youtube: '',
    conditional_drive: 'https://drive.google.com/file/d/1Ih2WCnyC64mESIKByOIOYAmkCioAGiTO/view?usp=sharing',
    conditional_youtube: '',
    manuscript_drive: 'https://drive.google.com/drive/folders/',
    manuscript_youtube: '',
    cta_heading: 'Ready to Start Learning?',
    cta_subtitle: 'Explore our courses and begin your journey toward personal and professional excellence.',
  });
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showAddResearch, setShowAddResearch] = useState(false);
  const [editingResearch, setEditingResearch] = useState(null);
  const [showResearchLinks, setShowResearchLinks] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const viewportOptions = {
    once: true,
    margin: "0px 0px -50px 0px",
    amount: 0.1
  };

  // Fetch published courses from Firestore
  const { data: courses, loading: coursesLoading } = useFirestoreCollection('courses', [
    where('published', '==', true)
  ], true);

  const sortedCourses = courses ? [...courses].slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : [];

  // Fetch dynamic research courses
  const { data: researchCourses, loading: researchLoading } = useFirestoreCollection('researchCourses', [], true);

  const managementCoursesCount = sortedCourses.length;
  const researchMethodsCoursesCount = (researchCourses?.length || 0) + 5; // 5 are static

  const allCourseYears = [
    ...sortedCourses.map(c => c.year || new Date(c.createdAt?.toDate()).getFullYear()),
    ...(researchCourses || []).map(c => c.year || new Date(c.createdAt?.toDate()).getFullYear())
  ].filter(Boolean);

  const minYear = allCourseYears.length ? Math.min(...allCourseYears) : '...';
  const maxYear = allCourseYears.length ? Math.max(...allCourseYears) : '...';
  const yearRange = minYear === maxYear ? minYear : `${minYear}–${maxYear}`;

  // Helper function to extract YouTube video ID from various URL formats
  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // Admin functions for managing dynamic courses
  const addCourse = async (newCourse) => {
    try {
      const maxOrder = courses && courses.length ? Math.max(...courses.map(c => (c.order ?? 0))) : 0;
      await addDoc(collection(db, 'courses'), {
        ...newCourse,
        published: true,
        createdAt: new Date(),
        order: maxOrder + 1
      });
      setShowAddCourse(false);
      alert('Course added successfully!');
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course');
    }
  };

  // Ensure every course has an order when entering reorder mode
  useEffect(() => {
    if (!reorderMode || !isAdmin || !courses) return;
    const missing = courses.filter(c => typeof c.order !== 'number');
    if (missing.length === 0) return;
    (async () => {
      try {
        const sorted = [...courses].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        for (let i = 0; i < sorted.length; i++) {
          const c = sorted[i];
          if (typeof c.order !== 'number') {
            await updateDoc(doc(db, 'courses', c.id), { order: i + 1 });
          }
        }
      } catch (e) {
        console.error('Failed to ensure order fields:', e);
      }
    })();
  }, [reorderMode, isAdmin, courses]);

  const moveCourse = async (courseId, direction) => {
    if (!courses) return;
    const sorted = [...courses].slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const idx = sorted.findIndex(c => c.id === courseId);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    const aOrder = a.order ?? idx + 1;
    const bOrder = b.order ?? swapIdx + 1;
    try {
      await updateDoc(doc(db, 'courses', a.id), { order: bOrder });
      await updateDoc(doc(db, 'courses', b.id), { order: aOrder });
    } catch (e) {
      console.error('Failed to swap course order:', e);
      alert('Failed to reorder courses.');
    }
  };

  const addResearchCourse = async (newCourse) => {
    try {
      await addDoc(collection(db, 'researchCourses'), {
        ...newCourse,
        createdAt: new Date()
      });
      setShowAddResearch(false);
      alert('Research course added successfully!');
    } catch (error) {
      console.error('Error adding research course:', error);
      alert('Failed to add research course');
    }
  };

  const deleteResearchCourse = async (id) => {
    if (!window.confirm('Delete this research course?')) return;
    try {
      await deleteDoc(doc(db, 'researchCourses', id));
    } catch (error) {
      console.error('Error deleting research course:', error);
      alert('Failed to delete research course');
    }
  };

  const updateCourse = async (updatedCourse) => {
    try {
      const { id, ...updateData } = updatedCourse;
      await updateDoc(doc(db, 'courses', id), updateData);
      setEditingCourse(null);
      alert('Course updated successfully!');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course');
    }
  };

  const deleteCourse = async (courseId) => {
    if (!confirm('Delete this course?')) return;
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      alert('Course deleted successfully!');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  // Shared Course card mimicking the Research.jsx card styling
  const CourseCard = ({ icon: Icon, title, description, link, linkText = "Access Course", badge, borderColor = "border-[#004B8D]", children, alt = false }) => {
    const headerBg = alt ? 'bg-[#004B8C]' : 'bg-[#004B8D]';
    const headerIconBg = alt ? 'bg-[#fff7ed]' : 'bg-[#dce8f5]';
    const headerIconColor = alt ? 'text-[#004B8C]' : 'text-[#004B8D]';
    const cardBg = 'bg-white';

    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={viewportOptions}
        variants={fadeInUp}
        className={`${cardBg} rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 ${borderColor} relative group overflow-hidden`}
      >
        <div className={`${headerBg} p-6`}>
          <div className="flex items-start gap-4">
            <div className={`${headerIconBg} p-3 rounded-xl`}>
              {Icon && <Icon className={`w-6 h-6 ${headerIconColor}`} />}
            </div>
            <div className="flex-1">
              {badge && (
                <span className="inline-block px-3 py-1 bg-transparent text-xs font-['Inter'] font-semibold text-white rounded-full mb-2">
                  {badge}
                </span>
              )}
              <div className="text-2xl font-['Playfair_Display'] font-bold text-white mb-0">
                {title}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="text-gray-700 font-['Inter'] leading-relaxed mb-6">
            {description}
          </div>
          {children}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-6 py-3 text-white font-['Inter'] font-semibold rounded-lg transition-all shadow-md hover:shadow-lg ${alt ? 'bg-[#004B8C] hover:bg-[#f5b800] text-black' : 'bg-[#004B8D] hover:bg-[#003870]'}`}
            >
              {linkText}
              <FiExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          )}
        </div>
      </motion.div>
    );
  };

  const ResearchLecture = ({ title, description, driveLink, youtubeLink, driveField, youtubeField }) => (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOptions}
      variants={fadeInUp}
      className="bg-gradient-to-br from-[#fff7ed] to-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow border-l-4 border-[#004B8C] flex flex-col"
    >
      <div className="text-xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-3">
        {title}
      </div>
      <div className="font-['Inter'] text-gray-600 mb-5 flex-1">
        {description}
      </div>
      <div className="flex flex-wrap gap-3 mb-3">
        {driveLink && (
          <a
            href={driveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#004B8D] text-white font-['Inter'] text-sm font-semibold rounded-lg transition-all shadow-md hover:bg-transparent hover:text-[#004B8D] hover:-translate-y-px border-2 border-transparent hover:border-[#004B8D]"
          >
            <FiExternalLink size={14} /> Access Course Material
          </a>
        )}
        {youtubeLink && (
          <a
            href={youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-['Inter'] text-sm font-semibold rounded-lg transition-all shadow-md hover:bg-transparent hover:text-yellow-500 hover:-translate-y-px border-2 border-transparent hover:border-yellow-5-yellow-5-yellow-500"
          >
            <FiYoutube size={14} /> Access Course Videos
          </a>
        )}
      </div>
      {driveField && youtubeField && (
        <ResearchLinksEditor
          driveField={driveField}
          youtubeField={youtubeField}
          driveValue={driveLink}
          youtubeValue={youtubeLink}
        />
      )}
    </motion.div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#dce8f5] to-[#fff7ed] pt-20 pb-8 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center"
          >
            <div className="w-20 h-1 bg-[#004B8C] mb-8 rounded-full mx-auto"></div>
            <h1 className="text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6">
              <EditableText
                collection="content"
                docId="courses"
                field="page_heading"
                defaultValue={pageData?.page_heading || 'Courses'}
                className="text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
              />
            </h1>
            <p className="text-xl lg:text-2xl font-['Inter'] text-gray-600 max-w-3xl mx-auto">
              <EditableText
                collection="content"
                docId="courses"
                field="page_subtitle"
                defaultValue={pageData?.page_subtitle || 'Welcome to my learning hub for students, researchers, and practitioners. Explore courses on life skills, leadership, and research methods.'}
                className="text-xl lg:text-2xl font-['Inter'] text-gray-600"
                multiline
              />
            </p>

            {/* KPI Stat Cards (Matching Books and Research Page Design) */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 mb-2">
              <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'white',
                borderRadius: '10px',
                padding: '10px 22px',
                boxShadow: '0 4px 20px rgba(0,75,141,.1)',
                border: '1px solid rgba(0,75,141,.08)',
                minWidth: '160px'
              }}>
                <strong style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#004B8D'
                }}>
                  <EditableText
                    collection="content"
                    docId="courses"
                    field="kpi_1_value"
                    defaultValue={pageData?.kpi_1_value || `${managementCoursesCount}`}
                    className="font-['Playfair_Display'] text-[1.8rem] font-bold text-[#004B8D]"
                  />
                </strong>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '.72rem',
                  fontWeight: 500,
                  color: '#9ca3af',
                  letterSpacing: '.09em',
                  textTransform: 'uppercase',
                  marginTop: '2px'
                }}>
                  <EditableText
                    collection="content"
                    docId="courses"
                    field="kpi_1_label"
                    defaultValue={pageData?.kpi_1_label || 'Management Courses'}
                    className="font-['Inter'] text-[.72rem] font-medium text-[#9ca3af] uppercase tracking-[.09em]"
                  />
                </span>
              </div>

              <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'white',
                borderRadius: '10px',
                padding: '10px 22px',
                boxShadow: '0 4px 20px rgba(0,75,141,.1)',
                border: '1px solid rgba(0,75,141,.08)',
                minWidth: '160px'
              }}>
                <strong style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#004B8D'
                }}>
                  <EditableText
                    collection="content"
                    docId="courses"
                    field="kpi_2_value"
                    defaultValue={pageData?.kpi_2_value || `${yearRange}`}
                    className="font-['Playfair_Display'] text-[1.8rem] font-bold text-[#004B8D]"
                  />
                </strong>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '.72rem',
                  fontWeight: 500,
                  color: '#9ca3af',
                  letterSpacing: '.09em',
                  textTransform: 'uppercase',
                  marginTop: '2px'
                }}>
                  <EditableText
                    collection="content"
                    docId="courses"
                    field="kpi_2_label"
                    defaultValue={pageData?.kpi_2_label || 'Publication Range'}
                    className="font-['Inter'] text-[.72rem] font-medium text-[#9ca3af] uppercase tracking-[.09em]"
                  />
                </span>
              </div>

              <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'white',
                borderRadius: '10px',
                padding: '10px 22px',
                boxShadow: '0 4px 20px rgba(0,75,141,.1)',
                border: '1px solid rgba(0,75,141,.08)',
                minWidth: '160px'
              }}>
                <strong style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#004B8D'
                }}>
                  <EditableText
                    collection="content"
                    docId="courses"
                    field="kpi_3_value"
                    defaultValue={pageData?.kpi_3_value || `${researchMethodsCoursesCount}`}
                    className="font-['Playfair_Display'] text-[1.8rem] font-bold text-[#004B8D]"
                  />
                </strong>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '.72rem',
                  fontWeight: 500,
                  color: '#9ca3af',
                  letterSpacing: '.09em',
                  textTransform: 'uppercase',
                  marginTop: '2px'
                }}>
                  <EditableText
                    collection="content"
                    docId="courses"
                    field="kpi_3_label"
                    defaultValue={pageData?.kpi_3_label || 'Research Methods'}
                    className="font-['Inter'] text-[.72rem] font-medium text-[#9ca3af] uppercase tracking-[.09em]"
                  />
                </span>
              </div>

              <div style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'white',
                borderRadius: '10px',
                padding: '10px 22px',
                boxShadow: '0 4px 20px rgba(0,75,141,.1)',
                border: '1px solid rgba(0,75,141,.08)',
                minWidth: '160px'
              }}>
                <strong style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#004B8D'
                }}>
                  <EditableText
                    collection="content"
                    docId="courses"
                    field="kpi_4_value"
                    defaultValue={pageData?.kpi_4_value || '250K+'}
                    className="font-['Playfair_Display'] text-[1.8rem] font-bold text-[#004B8D]"
                  />
                </strong>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '.72rem',
                  fontWeight: 500,
                  color: '#9ca3af',
                  letterSpacing: '.09em',
                  textTransform: 'uppercase',
                  marginTop: '2px'
                }}>
                  <EditableText
                    collection="content"
                    docId="courses"
                    field="kpi_4_label"
                    defaultValue={pageData?.kpi_4_label || 'Active Learners'}
                    className="font-['Inter'] text-[.72rem] font-medium text-[#9ca3af] uppercase tracking-[.09em]"
                  />
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Dynamic Courses Section with Admin Functionality */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
            className="mb-12"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="group">
                  <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4 transition-colors duration-300">
                    <EditableText
                      collection="content"
                      docId="courses"
                      field="mgmt_heading"
                      defaultValue={pageData?.mgmt_heading || 'Management Courses'}
                      className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
                    />
                  </h2>
                  <div className="w-24 h-1 bg-[#004B8D] rounded-full group-hover:bg-[#004B8C] group-hover:w-32 transition-all duration-300"></div>
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddCourse(true)}
                    className="flex items-center gap-2 bg-[#004B8D] hover:bg-[#003870] text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md"
                  >
                    <FiPlus /> Add Course
                  </button>
                  <button
                    onClick={() => setReorderMode((s) => !s)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${reorderMode ? 'bg-[#004B8C] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    title="Toggle reorder mode"
                  >
                    {reorderMode ? 'Reorder: ON' : 'Reorder'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {showAddCourse && isAdmin && (
            <div className="mb-8 p-6 bg-white rounded-xl border-2 border-[#004B8D] shadow-lg">
              <CourseForm
                onSave={addCourse}
                onCancel={() => setShowAddCourse(false)}
              />
            </div>
          )}

          {coursesLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#004B8D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-['Inter'] text-gray-600">Loading courses...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* All courses now come from Firestore - fully editable */}
              {sortedCourses && sortedCourses.map((course, index) => {
                const videoId = course.youtubeUrl ? extractVideoId(course.youtubeUrl) : null;
                const thumbnailUrl = course.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);
                const isAlt = index % 2 === 1;
                const borderColor = isAlt ? 'border-[#004B8C]' : 'border-[#004B8D]';
                const playBg = isAlt ? 'bg-[#004B8C] bg-opacity-90' : 'bg-[#004B8D] bg-opacity-90';
                const ytButtonClass = isAlt ? 'bg-[#004B8C] hover:bg-[#f5b800] text-black' : 'bg-[#004B8D] hover:bg-[#003870] text-white';

                return (
                  <div key={course.id} className="relative">
                    <CourseCard
                      key={course.id}
                      icon={FiFileText}
                      title={course.title}
                      description={course.description}
                      badge={course.courseraUrl ? 'COURSERA' : null}
                      borderColor={borderColor}
                      alt={isAlt}
                    >
                      {thumbnailUrl && (
                        <div className="mb-6">
                          <a
                            href={course.youtubeUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block relative group/video"
                          >
                            <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden shadow-md">
                              <img
                                src={thumbnailUrl}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover/video:opacity-90 transition-opacity"
                                onError={(e) => {
                                  if (videoId && !course.thumbnail) {
                                    e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                  } else {
                                    e.target.src = 'https://placehold.co/640x360/1a1a1a/ffffff?text=Course+Image';
                                  }
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`w-12 h-12 ${playBg} rounded-full flex items-center justify-center group-hover/video:scale-110 transition-transform shadow-lg`}>
                                  <FiPlay className="w-6 h-6 text-white ml-1" />
                                </div>
                              </div>
                            </div>
                          </a>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 mt-auto">
                        {course.courseraUrl && (
                          <a
                            href={course.courseraUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#f5b800] hover:bg-[#004B8C] text-black font-['Inter'] font-semibold rounded-lg transition-all shadow-md"
                          >
                            Enroll on Coursera
                            <FiExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {course.courseLink && (
                          <a
                            href={course.courseLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#004B8D] hover:bg-[#003870] text-white font-['Inter'] font-semibold rounded-lg transition-all shadow-md"
                          >
                            Explore Course
                            <FiExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {!course.courseraUrl && !course.courseLink && course.youtubeUrl && (
                          <a
                            href={course.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center justify-center gap-2 w-full px-4 py-3 ${ytButtonClass} text-white font-['Inter'] font-semibold rounded-lg transition-all shadow-md`}
                          >
                            Watch on YouTube
                            <FiExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </CourseCard>

                    {isAdmin && (
                      <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                        {reorderMode && (
                          <>
                            <button
                              onClick={() => moveCourse(course.id, 'up')}
                              className="p-2 bg-white border rounded-md shadow-sm hover:bg-gray-50"
                              title="Move up"
                            >
                              <FiChevronUp />
                            </button>
                            <button
                              onClick={() => moveCourse(course.id, 'down')}
                              className="p-2 bg-white border rounded-md shadow-sm hover:bg-gray-50"
                              title="Move down"
                            >
                              <FiChevronDown />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setEditingCourse(course)}
                          className="p-2 bg-blue-50 text-blue-600 border rounded-md shadow-sm hover:bg-blue-100"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="p-2 bg-red-50 text-red-600 border rounded-md shadow-sm hover:bg-red-100"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {editingCourse && isAdmin && (
            <div className="mt-8 p-6 bg-white rounded-xl border-2 border-[#004B8D] shadow-lg relative z-20">
              <CourseForm
                course={editingCourse}
                onSave={updateCourse}
                onCancel={() => setEditingCourse(null)}
              />
            </div>
          )}
        </div>
      </section>

      {/* Research Methods Section */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
            className="mb-12"
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="group">
                <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4 transition-colors duration-300">
                  <EditableText
                    collection="content"
                    docId="courses"
                    field="research_heading"
                    defaultValue={pageData?.research_heading || 'Research Methods'}
                    className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
                  />
                </h2>
                <div className="w-24 h-1 bg-[#004B8D] rounded-full mb-4 group-hover:bg-[#004B8D] group-hover:w-32 transition-all duration-300"></div>
              </div>
              <p className="text-lg font-['Inter'] text-gray-600 max-w-2xl">
                <EditableText
                  collection="content"
                  docId="courses"
                  field="research_subtitle"
                  defaultValue={pageData?.research_subtitle || 'Comprehensive lecture series on advanced research methodologies for scholars and practitioners'}
                  className="text-lg font-['Inter'] text-gray-600"
                  multiline
                />
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowAddResearch(true)}
                  className="flex items-center gap-2 bg-[#004B8D] hover:bg-[#003870] text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md"
                >
                  <FiPlus /> Add Research Course
                </button>
              )}
            </div>
          </motion.div>

          {showAddResearch && isAdmin && (
            <div className="mb-10 p-6 bg-white rounded-xl border-2 border-[#004B8D] shadow-lg">
              <ResearchCourseForm
                onSave={addResearchCourse}
                onCancel={() => setShowAddResearch(false)}
              />
            </div>
          )}

          <div className="space-y-12">
            {/* Multilevel Modeling */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOptions}
              variants={fadeInUp}
              className="bg-[#faf8f5] p-8 rounded-xl shadow-md border-l-4 border-[#004B8D]"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#dce8f5] rounded-xl">
                  <FiTrendingUp className="w-6 h-6 text-[#004B8D]" />
                </div>
                <h3 className="text-3xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
                  <EditableText
                    collection="content"
                    docId="courses"
                    field="multilevel_title"
                    defaultValue={pageData?.multilevel_title || 'Multilevel Modeling'}
                  />
                </h3>
              </div>
              <p className="text-gray-700 font-['Inter'] leading-relaxed mb-6">
                <EditableText
                  collection="content"
                  docId="courses"
                  field="multilevel_desc"
                  defaultValue={pageData?.multilevel_desc || 'Multilevel models (also known as hierarchical linear models, linear mixed-effect model, mixed models, nested data models, or random-effects models) are statistical models of parameters that vary at more than one level. These models are particularly appropriate for research designs where data for participants are organized at more than one level (e.g., employees nested under team leaders).'}
                  multiline
                />
              </p>
              <div className="flex flex-wrap gap-3">
                {(pageData?.multilevel_drive || 'https://drive.google.com/drive/folders/1GTHqiJX1sEjSuVlhBmR_Z5DETrUwIHGd') && (
                  <a
                    href={pageData?.multilevel_drive || 'https://drive.google.com/drive/folders/1GTHqiJX1sEjSuVlhBmR_Z5DETrUwIHGd'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#004B8D] hover:bg-[#003870] text-white px-6 py-3 rounded-lg font-['Inter'] font-semibold transition-all shadow-md"
                  >
                    <FiExternalLink className="w-4 h-4" /> Access Course Material
                  </a>
                )}
                {pageData?.multilevel_youtube && (
                  <a
                    href={pageData.multilevel_youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#f5b800] hover:bg-[#f5b800] text-black px-6 py-3 rounded-lg font-['Inter'] font-semibold transition-all shadow-md"
                  >
                    <FiYoutube className="w-4 h-4" /> Access Course Videos
                  </a>
                )}
              </div>
              <ResearchLinksEditor
                driveField="multilevel_drive"
                youtubeField="multilevel_youtube"
                driveValue={pageData?.multilevel_drive || 'https://drive.google.com/drive/folders/1GTHqiJX1sEjSuVlhBmR_Z5DETrUwIHGd'}
                youtubeValue={pageData?.multilevel_youtube || ''}
              />
            </motion.div>

            {/* Covariance-Based SEM */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOptions}
              variants={fadeInUp}
              className="bg-[#faf8f5] p-8 rounded-xl shadow-md border-l-4 border-[#F5B800]"     
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[#fff7ed] rounded-xl">
                  <FiBarChart2 className="w-6 h-6 text-[#f97316]" />
                </div>
                <h3 className="text-3xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
                  <EditableText
                    collection="content"
                    docId="courses"
                    field="sem_title"
                    defaultValue={pageData?.sem_title || 'Covariance-Based SEM'}
                  />
                </h3>
              </div>
              <p className="text-gray-700 font-['Inter'] leading-relaxed mb-4">
                <EditableText
                  collection="content"
                  docId="courses"
                  field="sem_desc"
                  defaultValue={pageData?.sem_desc || 'Structural Equation Modeling (SEM) is a statistical methodology widely used in social sciences research. SEM allows researchers to test complex models with multiple pathways, model latent variables with multiple indicators, investigate mediation and moderation systematically, and adjust for measurement error in predictor variables. This series provides a general introduction to CB-SEM using AMOS software.'}
                  multiline
                />
              </p>
              <div className="flex flex-wrap gap-3">
                {pageData?.sem_drive && (
                  <a
                    href={pageData.sem_drive}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#004B8D] hover:bg-[#003870] text-white px-6 py-3 rounded-lg font-['Inter'] font-semibold transition-all shadow-md"
                  >
                    <FiExternalLink className="w-4 h-4" /> Access Course Material
                  </a>
                )}
                {pageData?.sem_youtube && (
                  <a
                    href={pageData.sem_youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#f5b800] hover:bg-[#f5b800] text-black px-6 py-3 rounded-lg font-['Inter'] font-semibold transition-all shadow-md"
                  >
                    <FiYoutube className="w-4 h-4" /> Access Course Videos
                  </a>
                )}
                {!pageData?.sem_drive && !pageData?.sem_youtube && (
                  <p className="text-gray-500 font-['Inter'] text-sm italic">Note: Links to be updated</p>
                )}
              </div>
              <ResearchLinksEditor
                driveField="sem_drive"
                youtubeField="sem_youtube"
                driveValue={pageData?.sem_drive || ''}
                youtubeValue={pageData?.sem_youtube || ''}
              />
            </motion.div>

            {/* Grid of Research Topics */}
            <div className="grid md:grid-cols-2 gap-6">
              <ResearchLecture
                title={<EditableText collection="content" docId="courses" field="psychometrics_title" defaultValue={pageData?.psychometrics_title || 'Psychometrics'} />}
                description={<EditableText collection="content" docId="courses" field="psychometrics_desc" defaultValue={pageData?.psychometrics_desc || 'Introduction to central concepts of measurement covering test construction, item analysis, reliability, validity, and measurement error. Includes hands-on sessions with SPSS and AMOS.'} multiline />}
                driveLink={pageData?.psychometrics_drive || 'https://drive.google.com/drive/folders/'}
                youtubeLink={pageData?.psychometrics_youtube || ''}
                driveField="psychometrics_drive"
                youtubeField="psychometrics_youtube"
              />
              <ResearchLecture
                title={<EditableText collection="content" docId="courses" field="conditional_title" defaultValue={pageData?.conditional_title || 'Conditional Process Analysis'} />}
                description={<EditableText collection="content" docId="courses" field="conditional_desc" defaultValue={pageData?.conditional_desc || 'A comprehensive three-video series explaining mediation, moderation, and conditional process analysis with practical dataset examples.'} multiline />}
                driveLink={pageData?.conditional_drive || 'https://drive.google.com/file/d/1Ih2WCnyC64mESIKByOIOYAmkCioAGiTO/view?usp=sharing'}
                youtubeLink={pageData?.conditional_youtube || ''}
                driveField="conditional_drive"
                youtubeField="conditional_youtube"
              />
              <ResearchLecture
                title={<EditableText collection="content" docId="courses" field="manuscript_title" defaultValue={pageData?.manuscript_title || 'Manuscript Writing & Publishing'} />}
                description={<EditableText collection="content" docId="courses" field="manuscript_desc" defaultValue={pageData?.manuscript_desc || 'A 16-session series covering elements of manuscript writing and strategies for high-quality academic publishing. Includes instruction files and supplementary readings.'} multiline />}
                driveLink={pageData?.manuscript_drive || 'https://drive.google.com/drive/folders/'}
                youtubeLink={pageData?.manuscript_youtube || ''}
                driveField="manuscript_drive"
                youtubeField="manuscript_youtube"
              />
            </div>

            {/* Dynamic Research Courses from Firestore */}
            {researchLoading && (
              <div className="text-center py-6">
                <div className="w-8 h-8 border-4 border-[#004B8D] border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            )}
            {!researchLoading && researchCourses && researchCourses.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-col gap-6">
                  {researchCourses.map((rc) => (
                    <div key={rc.id} className="relative w-full">
                      <ResearchLecture
                        title={rc.title}
                        description={rc.description}
                        driveLink={rc.driveLink}
                        youtubeLink={rc.youtubeLink}
                      />
                      {isAdmin && (
                        <button
                          onClick={() => deleteResearchCourse(rc.id)}
                          className="absolute top-3 right-3 p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 lg:px-16 bg-[#dce8f5]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6">
              <EditableText
                collection="content"
                docId="courses"
                field="cta_heading"
                defaultValue={pageData?.cta_heading || 'Ready to Start Learning?'}
                className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
              />
            </h2>
            <p className="text-xl font-['Inter'] text-gray-700 mb-8">
              <EditableText
                collection="content"
                docId="courses"
                field="cta_subtitle"
                defaultValue={pageData?.cta_subtitle || 'Explore our courses and begin your journey toward personal and professional excellence.'}
                className="text-xl font-['Inter'] text-gray-700"
                multiline
              />
            </p>
            <a
              href="https://www.youtube.com/@ProfVishalGupta"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#004B8D] hover:bg-[#003870] text-white font-['Inter'] font-bold rounded-lg transition-all shadow-xl hover:shadow-2xl text-lg"
            >
              <FiYoutube className="w-6 h-6" />
              Subscribe to YouTube Channel
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Research Course Form — for adding new dynamic research courses
function ResearchCourseForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ title: '', description: '', driveLink: '', youtubeLink: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { alert('Title is required'); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const field = (key, label, placeholder, type = 'text') => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#004B8D] outline-none resize-none"
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#004B8D] outline-none"
        />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-['Playfair_Display'] font-bold text-[#1a1a1a]">Add Research Course</h3>
      {field('title', 'Title *', 'e.g. Factor Analysis')}
      {field('description', 'Description', 'Brief description of the course...', 'textarea')}
      {field('driveLink', 'Drive / Material URL', 'https://drive.google.com/...', 'url')}
      {field('youtubeLink', 'YouTube URL', 'https://www.youtube.com/...', 'url')}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#004B8D] hover:bg-[#003870] text-white font-semibold rounded-lg transition-all shadow-md disabled:opacity-60"
        >
          <FiSave size={15} /> {saving ? 'Saving...' : 'Add Course'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-all"
        >
          <FiX size={15} /> Cancel
        </button>
      </div>
    </form>
  );
}

// Research Links Editor — admin-only inline editor for Drive & YouTube URLs
function ResearchLinksEditor({ driveField, youtubeField, driveValue, youtubeValue }) {
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [drive, setDrive] = useState(driveValue || '');
  const [youtube, setYoutube] = useState(youtubeValue || '');
  const [saving, setSaving] = useState(false);

  if (!isAdmin) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'content', 'courses'), {
        [driveField]: drive,
        [youtubeField]: youtube,
      });
      setEditing(false);
    } catch (e) {
      alert('Failed to save links. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs font-semibold rounded-lg transition-colors"
      >
        <FiEdit2 size={11} /> Edit Links
      </button>
    );
  }

  return (
    <div className="mt-3 p-4 bg-white border border-[#004B8D]/20 rounded-lg flex flex-col gap-3">
      <p className="text-xs font-bold text-[#004B8D] uppercase tracking-wide">Edit Links</p>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Drive / Material URL</label>
        <input
          type="url"
          value={drive}
          onChange={e => setDrive(e.target.value)}
          placeholder="https://drive.google.com/..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#004B8D] outline-none"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">YouTube URL</label>
        <input
          type="url"
          value={youtube}
          onChange={e => setYoutube(e.target.value)}
          placeholder="https://www.youtube.com/..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#004B8D] outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1 px-4 py-2 bg-[#004B8D] hover:bg-[#003870] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
        >
          <FiSave size={12} /> {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={() => { setDrive(driveValue || ''); setYoutube(youtubeValue || ''); setEditing(false); }}
          className="inline-flex items-center gap-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
        >
          <FiX size={12} /> Cancel
        </button>
      </div>
    </div>
  );
}

// Course Form Component for Admin
function CourseForm({ course, onSave, onCancel }) {
  const [formData, setFormData] = useState(course || {
    title: '',
    description: '',
    courseraUrl: '',
    courseLink: '',
    youtubeUrl: '',
    thumbnail: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef();

  const handleDrop = async (e) => {
    e.preventDefault();
    setUploadError('');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'courses');
      setFormData((prev) => ({ ...prev, thumbnail: url }));
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    }
    setUploading(false);
  };

  const handleFileChange = async (e) => {
    setUploadError('');
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file, 'courses');
      setFormData((prev) => ({ ...prev, thumbnail: url }));
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    }
    setUploading(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-2xl font-bold mb-4 text-[#1a1a1a]">
        {course ? 'Edit Course' : 'Add New Course'}
      </h3>
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">Course Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D] outline-none transition-shadow"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D] outline-none transition-shadow"
          rows={4}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Coursera URL <span className="text-gray-400 font-normal">(shows "Enroll on Coursera" button + badge)</span>
        </label>
        <input
          type="url"
          value={formData.courseraUrl || ''}
          onChange={(e) => setFormData({ ...formData, courseraUrl: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D] outline-none transition-shadow"
          placeholder="https://www.coursera.org/learn/..."
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">Other Link <span className="text-gray-400 font-normal">(website, Drive, etc.)</span></label>
        <input
          type="url"
          value={formData.courseLink || ''}
          onChange={(e) => setFormData({ ...formData, courseLink: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D] outline-none transition-shadow"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">YouTube URL <span className="text-gray-400 font-normal">(for video preview)</span></label>
        <input
          type="url"
          value={formData.youtubeUrl}
          onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D] outline-none transition-shadow"
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>
      {/* Drag-and-drop thumbnail upload */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">Course Thumbnail</label>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 mb-2 transition-colors ${uploading ? 'border-gray-400 bg-gray-50' : 'border-[#004B8D] bg-white'} cursor-pointer`}
          style={{ minHeight: 120 }}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          {formData.thumbnail ? (
            <img src={formData.thumbnail} alt="Thumbnail preview" className="max-h-32 mb-2 rounded shadow" />
          ) : (
            <span className="text-gray-400">Drag & drop image here, or click to select</span>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        {uploading && <div className="text-xs text-blue-600">Uploading...</div>}
        {uploadError && <div className="text-xs text-red-600">{uploadError}</div>}
        <div className="text-xs text-gray-500">Or use a direct image URL below (optional, overrides drag-drop)</div>
        <input
          type="url"
          value={formData.thumbnail}
          onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg mt-1 focus:ring-2 focus:ring-[#004B8D] outline-none"
          placeholder="Will fallback to YouTube thumbnail if empty"
        />
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="showOnHome"
          checked={!!formData.showOnHome}
          onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
          className="w-4 h-4 accent-[#004B8D]"
        />
        <label htmlFor="showOnHome" className="text-sm font-semibold text-gray-700">
          Show on Home page
        </label>
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
        >
          <FiX className="inline mr-2" /> Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-[#004B8D] hover:bg-[#003870] text-white rounded-lg font-semibold transition-colors shadow-md"
          disabled={uploading}
        >
          <FiSave className="inline mr-2" /> Save Course
        </button>
      </div>
    </form>
  );
}