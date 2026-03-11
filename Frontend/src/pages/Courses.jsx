import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiYoutube, FiBook, FiUsers, FiTrendingUp, FiBarChart2, FiFileText, FiExternalLink, FiPlay, FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import EditableText from '../components/EditableText';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, updateDoc, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Courses() {
  const { isAdmin } = useAuth() || {};
  const { data: pageData } = useFirestoreDoc('content', 'courses', {
    page_heading: 'Courses',
    page_subtitle: 'Welcome to my learning hub for students, researchers, and practitioners. Explore courses on life skills, leadership, and research methods.',
    mgmt_heading: 'Management Courses',
    featured_heading: 'Featured Courses',
    featured_subtitle: 'Comprehensive online courses combining science, practice, and ancient wisdom',
    happiness_title: 'HAPPINESS: Science, Practice and Ancient Indian Wisdom',
    happiness_desc: 'Explore how to become a happy being—successful and at peace. This unique course combines evidence from science, practical well-being techniques, and lessons from Indian wisdom storehouses: the Upanishads, the Gita, and the Yoga Sutras.',
    happiness_b1: 'Evidence from science',
    happiness_b2: 'Simple well-being techniques',
    happiness_b3: 'Ancient Indian wisdom',
    leadership_title: 'Leadership Skills',
    leadership_desc: 'A beginner course for professionals from diverse backgrounds. Strengthen your capacity to lead across boundaries, with or without authority, and manage the inevitable stresses and challenges of leading a team. Drawing from business, philosophy, sports, and psychology.',
    leadership_b1: 'Lead across boundaries',
    leadership_b2: 'Lead with or without authority',
    leadership_b3: 'Manage leadership stresses',
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
  const [homeOverrides, setHomeOverrides] = useState({});
  const [showAddResearch, setShowAddResearch] = useState(false);

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
  // Note: Admins might want to see all, but for consistency we fetch published ones.
  // To fetch all for admin, you could conditionally build the query array.
  const { data: courses, loading: coursesLoading } = useFirestoreCollection('courses', [
    where('published', '==', true)
  ], true);

  // Fetch dynamic research courses
  const { data: researchCourses, loading: researchLoading } = useFirestoreCollection('researchCourses', [], true);

  // Helper function to extract YouTube video ID from various URL formats
  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  // Admin functions for managing dynamic courses
  const addCourse = async (newCourse) => {
    try {
      await addDoc(collection(db, 'courses'), {
        ...newCourse,
        published: true, // Auto-publish for simplicity, or add a toggle in the form
        createdAt: new Date()
      });
      setShowAddCourse(false);
      alert('Course added successfully!');
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course');
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

  const toggleShowOnHome = async (course) => {
    const newVal = !(homeOverrides[course.id] ?? course.showOnHome);
    setHomeOverrides(prev => ({ ...prev, [course.id]: newVal }));
    try {
      await updateDoc(doc(db, 'courses', course.id), { showOnHome: newVal });
    } catch (error) {
      setHomeOverrides(prev => ({ ...prev, [course.id]: !newVal }));
      alert('Failed to update');
    }
  };

  // Shared Course card mimicking the Research.jsx card styling
  const CourseCard = ({ icon: Icon, title, description, link, linkText = "Access Course", badge, borderColor = "border-[#004B8D]", children }) => (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOptions}
      variants={fadeInUp}
      className={`bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 ${borderColor} relative group`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-xl ${borderColor === 'border-[#f97316]' ? 'bg-[#fff7ed]' : 'bg-[#dce8f5]'}`}>
          <Icon className={`w-6 h-6 ${borderColor === 'border-[#f97316]' ? 'text-[#f97316]' : 'text-[#004B8D]'}`} />
        </div>
        <div className="flex-1">
          {badge && (
            <span className="inline-block px-3 py-1 bg-gray-100 text-xs font-['Inter'] font-semibold text-[#1a1a1a] rounded-full mb-2">
              {badge}
            </span>
          )}
          <div className="text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-2">
            {title}
          </div>
        </div>
      </div>
      <div className="text-gray-700 font-['Inter'] leading-relaxed mb-6">
        {description}
      </div>
      {children}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-6 py-3 text-white font-['Inter'] font-semibold rounded-lg transition-all shadow-md hover:shadow-lg group ${borderColor === 'border-[#f97316]' ? 'bg-[#fb923c] hover:bg-[#f97316]' : 'bg-[#004B8D] hover:bg-[#003870]'}`}
        >
          {linkText}
          <FiExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      )}
    </motion.div>
  );

  const ResearchLecture = ({ title, description, driveLink, youtubeLink, driveField, youtubeField }) => (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOptions}
      variants={fadeInUp}
      className="bg-gradient-to-br from-[#fff7ed] to-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow border-l-4 border-[#f97316] flex flex-col"
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#004B8D] hover:bg-[#003870] text-white font-['Inter'] text-sm font-semibold rounded-lg transition-all shadow-md"
          >
            <FiExternalLink size={14} /> Access Course Material
          </a>
        )}
        {youtubeLink && (
          <a
            href={youtubeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#fb923c] hover:bg-[#f97316] text-white font-['Inter'] text-sm font-semibold rounded-lg transition-all shadow-md"
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
      <section className="bg-gradient-to-br from-[#dce8f5] to-[#fff7ed] py-20 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center"
          >
            <div className="w-20 h-1 bg-[#f97316] mb-8 rounded-full mx-auto"></div>
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
                <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4">
                  <EditableText
                    collection="content"
                    docId="courses"
                    field="mgmt_heading"
                    defaultValue={pageData?.mgmt_heading || 'Management Courses'}
                    className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
                  />
                </h2>
                <div className="w-24 h-1 bg-[#004B8D] rounded-full"></div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowAddCourse(true)}
                  className="flex items-center gap-2 bg-[#004B8D] hover:bg-[#003870] text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md"
                >
                  <FiPlus /> Add Course
                </button>
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
              {/* Featured Coursera Courses */}
              <CourseCard
                icon={FiBook}
                title={<EditableText collection="content" docId="courses" field="happiness_title" defaultValue={pageData?.happiness_title || 'HAPPINESS: Science, Practice and Ancient Indian Wisdom'} />}
                description={<EditableText collection="content" docId="courses" field="happiness_desc" defaultValue={pageData?.happiness_desc || 'Explore how to become a happy being—successful and at peace. This unique course combines evidence from science, practical well-being techniques, and lessons from Indian wisdom storehouses: the Upanishads, the Gita, and the Yoga Sutras.'} multiline />}
                link="https://www.coursera.org/learn/happiness"
                linkText="Enroll on Coursera"
                badge="COURSERA"
                borderColor="border-[#f97316]"
              >
                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-['Inter'] text-gray-700">
                    <FiBook className="w-4 h-4 text-[#f97316]" />
                    <EditableText collection="content" docId="courses" field="happiness_b1" defaultValue={pageData?.happiness_b1 || 'Evidence from science'} />
                  </div>
                  <div className="flex items-center gap-2 text-sm font-['Inter'] text-gray-700">
                    <FiBook className="w-4 h-4 text-[#f97316]" />
                    <EditableText collection="content" docId="courses" field="happiness_b2" defaultValue={pageData?.happiness_b2 || 'Simple well-being techniques'} />
                  </div>
                  <div className="flex items-center gap-2 text-sm font-['Inter'] text-gray-700">
                    <FiBook className="w-4 h-4 text-[#f97316]" />
                    <EditableText collection="content" docId="courses" field="happiness_b3" defaultValue={pageData?.happiness_b3 || 'Ancient Indian wisdom'} />
                  </div>
                </div>
              </CourseCard>

              <CourseCard
                icon={FiUsers}
                title={<EditableText collection="content" docId="courses" field="leadership_title" defaultValue={pageData?.leadership_title || 'Leadership Skills'} />}
                description={<EditableText collection="content" docId="courses" field="leadership_desc" defaultValue={pageData?.leadership_desc || 'A beginner course for professionals from diverse backgrounds. Strengthen your capacity to lead across boundaries, with or without authority, and manage the inevitable stresses and challenges of leading a team. Drawing from business, philosophy, sports, and psychology.'} multiline />}
                link="https://www.coursera.org/learn/leadershipskills"
                linkText="Enroll on Coursera"
                badge="COURSERA"
                borderColor="border-[#004B8D]"
              >
                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-['Inter'] text-gray-700">
                    <FiUsers className="w-4 h-4 text-[#004B8D]" />
                    <EditableText collection="content" docId="courses" field="leadership_b1" defaultValue={pageData?.leadership_b1 || 'Lead across boundaries'} />
                  </div>
                  <div className="flex items-center gap-2 text-sm font-['Inter'] text-gray-700">
                    <FiUsers className="w-4 h-4 text-[#004B8D]" />
                    <EditableText collection="content" docId="courses" field="leadership_b2" defaultValue={pageData?.leadership_b2 || 'Lead with or without authority'} />
                  </div>
                  <div className="flex items-center gap-2 text-sm font-['Inter'] text-gray-700">
                    <FiUsers className="w-4 h-4 text-[#004B8D]" />
                    <EditableText collection="content" docId="courses" field="leadership_b3" defaultValue={pageData?.leadership_b3 || 'Manage leadership stresses'} />
                  </div>
                </div>
              </CourseCard>

              {/* Dynamic Firestore courses */}
              {courses && courses.map((course, index) => {
                const videoId = course.youtubeUrl ? extractVideoId(course.youtubeUrl) : null;
                const thumbnailUrl = course.thumbnail || 
                  (videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null);
                
                return (
                  <motion.div
                    key={course.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOptions}
                    variants={fadeInUp}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-[#004B8D] relative group flex flex-col"
                  >
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          title={homeOverrides[course.id] ?? course.showOnHome ? 'Remove from Home page' : 'Show on Home page'}
                          onClick={() => toggleShowOnHome(course)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                            (homeOverrides[course.id] ?? course.showOnHome)
                              ? 'bg-[#004B8D] text-white shadow'
                              : 'bg-gray-100 text-gray-600 hover:bg-[#dce8f5] hover:text-[#004B8D]'
                          }`}
                        >
                          🏠 {(homeOverrides[course.id] ?? course.showOnHome) ? 'On Home' : '+ Home'}
                        </button>
                        <button
                          onClick={() => setEditingCourse(course)}
                          className="p-2 bg-[#004B8D] hover:bg-[#003870] text-white rounded-lg shadow"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteCourse(course.id)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    )}
                    
                    {course.courseraUrl && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-xs font-['Inter'] font-semibold text-[#1a1a1a] rounded-full mb-2">
                        COURSERA
                      </span>
                    )}
                    <h3 className="text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-3 pr-16">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 font-['Inter'] mb-6 flex-grow">
                      {course.description}
                    </p>
                    
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
                              <div className="w-12 h-12 bg-[#004B8D] bg-opacity-90 rounded-full flex items-center justify-center group-hover/video:scale-110 transition-transform shadow-lg">
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
                          className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#fb923c] hover:bg-[#f97316] text-white font-['Inter'] font-semibold rounded-lg transition-all shadow-md"
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
                          className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#004B8D] hover:bg-[#003870] text-white font-['Inter'] font-semibold rounded-lg transition-all shadow-md"
                        >
                          Watch on YouTube
                          <FiExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </motion.div>
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
              <div>
                <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4">
                  <EditableText
                    collection="content"
                    docId="courses"
                    field="research_heading"
                    defaultValue={pageData?.research_heading || 'Research Methods'}
                    className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
                  />
                </h2>
                <div className="w-24 h-1 bg-[#004B8D] rounded-full mb-4"></div>
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
              </div>
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
                    className="inline-flex items-center gap-2 bg-[#fb923c] hover:bg-[#f97316] text-white px-6 py-3 rounded-lg font-['Inter'] font-semibold transition-all shadow-md"
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
              className="bg-[#faf8f5] p-8 rounded-xl shadow-md border-l-4 border-[#f97316]"
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
                    className="inline-flex items-center gap-2 bg-[#fb923c] hover:bg-[#f97316] text-white px-6 py-3 rounded-lg font-['Inter'] font-semibold transition-all shadow-md"
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
              <div className="mt-10">
                <h3 className="text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6">Additional Research Topics</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {researchCourses.map((rc) => (
                    <div key={rc.id} className="relative">
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
      <div>
        <label className="block text-sm font-semibold mb-2 text-gray-700">Custom Thumbnail URL (optional)</label>
        <input
          type="url"
          value={formData.thumbnail}
          onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D] outline-none transition-shadow"
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
        >
          <FiSave className="inline mr-2" /> Save Course
        </button>
      </div>
    </form>
  );
}
