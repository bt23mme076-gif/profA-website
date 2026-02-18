import { motion } from 'framer-motion';
import { FiYoutube, FiBook, FiUsers, FiTrendingUp, FiBarChart2, FiFileText, FiExternalLink, FiPlay } from 'react-icons/fi';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { where } from 'firebase/firestore';

export default function Courses() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  // Fetch published courses from Firestore
  const { data: courses, loading: coursesLoading } = useFirestoreCollection('courses', [
    where('published', '==', true)
  ]);

  // Helper function to extract YouTube video ID from various URL formats
  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  const CourseCard = ({ icon: Icon, title, description, link, linkText = "Access Course", badge, children }) => (
    <motion.div
      {...fadeIn}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all border border-gray-100"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-gradient-to-br from-[#ffcc00] to-[#f5b800] rounded-xl">
          <Icon className="w-6 h-6 text-[#1a1a1a]" />
        </div>
        <div className="flex-1">
          {badge && (
            <span className="inline-block px-3 py-1 bg-[#fafaf8] text-xs font-['Inter'] font-semibold text-[#1a1a1a] rounded-full mb-2">
              {badge}
            </span>
          )}
          <h3 className="text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-2">
            {title}
          </h3>
        </div>
      </div>
      
      <p className="text-gray-700 font-['Inter'] leading-relaxed mb-6">
        {description}
      </p>
      
      {children}
      
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white font-['Inter'] font-semibold rounded-lg hover:bg-[#ffcc00] hover:text-[#1a1a1a] transition-all group"
        >
          {linkText}
          <FiExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      )}
    </motion.div>
  );

  const ResearchLecture = ({ title, description, driveLink }) => (
    <motion.div
      {...fadeIn}
      className="bg-gradient-to-br from-[#fafaf8] to-[#f5f5f0] rounded-xl p-6 border border-gray-200"
    >
      <h4 className="text-xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-3">
        {title}
      </h4>
      <p className="text-gray-700 font-['Inter'] text-sm leading-relaxed mb-4">
        {description}
      </p>
      {driveLink && (
        <a
          href={driveLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-['Inter'] font-semibold text-[#1a1a1a] hover:text-[#ffcc00] transition-colors"
        >
          Download Materials
          <FiExternalLink className="w-4 h-4" />
        </a>
      )}
    </motion.div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-16 bg-gradient-to-b from-[#fafaf8] to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-block px-4 py-2 bg-[#ffcc00] bg-opacity-20 rounded-full mb-6">
              <span className="text-sm font-['Inter'] font-semibold text-[#1a1a1a] tracking-wide">
                LEARNING & DEVELOPMENT
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6 leading-tight">
              Courses
            </h1>
            <p className="text-xl lg:text-2xl font-['Inter'] text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Welcome to my learning hub for students, researchers, and practitioners. Explore courses on life skills, leadership, and research methods for your personal and professional journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* YouTube Channel */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <CourseCard
            icon={FiYoutube}
            title="YouTube Channel"
            description="A comprehensive resource for students, researchers, and practitioners. This channel features videos on life skills, leadership development, and research methodologies to support your personal and professional growth."
            link="https://www.youtube.com/@ProfVishalGupta"
            linkText="Visit Channel"
            badge="FREE RESOURCE"
          >
            <div className="mb-6 rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="315"
                src="https://www.youtube.com/embed/videoseries?list=UULFProfVishalGupta"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full"
              />
            </div>
          </CourseCard>
        </div>
      </section>

      {/* Dynamic Courses from Admin */}
      {coursesLoading ? (
        <section className="py-16 px-6 lg:px-16 bg-[#fafaf8]">
          <div className="max-w-6xl mx-auto text-center">
            <div className="w-16 h-16 border-4 border-[#ffcc00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-['Inter'] text-gray-600">Loading courses...</p>
          </div>
        </section>
      ) : courses && courses.length > 0 ? (
        <section className="py-16 px-6 lg:px-16 bg-[#fafaf8]">
          <div className="max-w-6xl mx-auto">
            <motion.div
              {...fadeIn}
              className="text-center mb-12"
            >
              <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4">
                Management Courses
              </h2>
              <p className="text-lg font-['Inter'] text-gray-600 max-w-2xl mx-auto">
                Explore our curated collection of management and leadership courses
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => {
                const videoId = course.youtubeUrl ? extractVideoId(course.youtubeUrl) : null;
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-100"
                  >
                    <h3 className="text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-3">
                      {course.title}
                    </h3>
                    <p className="text-gray-700 font-['Inter'] leading-relaxed mb-4">
                      {course.description}
                    </p>
                    
                    {videoId && (
                      <div className="mb-4">
                        <a 
                          href={`https://www.youtube.com/watch?v=${videoId}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block relative group"
                        >
                          <div className="aspect-video w-full bg-gray-200 rounded-lg overflow-hidden shadow-md">
                            <img 
                              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-colors shadow-lg">
                                <FiPlay className="w-6 h-6 text-white ml-1" />
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    )}

                    {course.youtubeUrl && (
                      <a
                        href={course.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-white font-['Inter'] font-semibold rounded-lg hover:bg-[#ffcc00] hover:text-[#1a1a1a] transition-all text-sm"
                      >
                        Watch Course
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* Featured Courses Section */}
      <section className="py-16 px-6 lg:px-16 bg-[#fafaf8]">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            {...fadeIn}
            className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4 text-center"
          >
            Featured Courses
          </motion.h2>
          <motion.p
            {...fadeIn}
            className="text-lg font-['Inter'] text-gray-600 text-center mb-12 max-w-2xl mx-auto"
          >
            Comprehensive online courses combining science, practice, and ancient wisdom
          </motion.p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Happiness Course */}
            <CourseCard
              icon={FiBook}
              title="HAPPINESS: Science, Practice and Ancient Indian Wisdom"
              description="Explore how to become a happy being—successful and at peace. This unique course combines evidence from science, practical well-being techniques, and lessons from Indian wisdom storehouses: the Upanishads, the Gita, and the Yoga Sutras."
              link="https://www.coursera.org/learn/happiness"
              linkText="Enroll on Coursera"
              badge="COURSERA"
            >
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-2 text-sm font-['Inter'] text-gray-700">
                  <FiBook className="w-4 h-4 text-[#ffcc00]" />
                  <span>Evidence from science</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-['Inter'] text-gray-700">
                  <FiBook className="w-4 h-4 text-[#ffcc00]" />
                  <span>Simple well-being techniques</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-['Inter'] text-gray-700">
                  <FiBook className="w-4 h-4 text-[#ffcc00]" />
                  <span>Ancient Indian wisdom</span>
                </div>
              </div>
            </CourseCard>

            {/* Leadership Skills Course */}
            <CourseCard
              icon={FiUsers}
              title="Leadership Skills"
              description="A beginner course for professionals from diverse backgrounds. Strengthen your capacity to lead across boundaries, with or without authority, and manage the inevitable stresses and challenges of leading a team. Drawing from business, philosophy, sports, and psychology."
              link="https://www.coursera.org/learn/leadershipskills"
              linkText="Enroll on Coursera"
              badge="COURSERA"
            >
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-2 text-sm font-['Inter'] text-gray-700">
                  <FiUsers className="w-4 h-4 text-[#ffcc00]" />
                  <span>Lead across boundaries</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-['Inter'] text-gray-700">
                  <FiUsers className="w-4 h-4 text-[#ffcc00]" />
                  <span>Lead with or without authority</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-['Inter'] text-gray-700">
                  <FiUsers className="w-4 h-4 text-[#ffcc00]" />
                  <span>Manage leadership stresses</span>
                </div>
              </div>
            </CourseCard>
          </div>
        </div>
      </section>

      {/* Research Methods Section */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4">
              Research Methods
            </h2>
            <p className="text-lg font-['Inter'] text-gray-600 max-w-2xl mx-auto">
              Comprehensive lecture series on advanced research methodologies for scholars and practitioners
            </p>
          </motion.div>

          <div className="space-y-12">
            {/* Multilevel Modeling */}
            <div>
              <motion.div {...fadeIn} className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#ffcc00] bg-opacity-20 rounded-lg">
                    <FiTrendingUp className="w-5 h-5 text-[#1a1a1a]" />
                  </div>
                  <h3 className="text-3xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
                    Multilevel Modeling
                  </h3>
                </div>
                <p className="text-gray-700 font-['Inter'] leading-relaxed mb-4">
                  Multilevel models (also known as hierarchical linear models, linear mixed-effect model, mixed models, nested data models, or random-effects models) are statistical models of parameters that vary at more than one level. These models are particularly appropriate for research designs where data for participants are organized at more than one level (e.g., employees nested under team leaders).
                </p>
                <a
                  href="https://drive.google.com/drive/folders/1GTHqiJX1sEjSuVlhBmR_Z5DETrUwIHGd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#1a1a1a] font-['Inter'] font-semibold hover:text-[#ffcc00] transition-colors"
                >
                  Access Course Materials
                  <FiExternalLink className="w-4 h-4" />
                </a>
              </motion.div>
            </div>

            {/* Covariance-Based SEM */}
            <div>
              <motion.div {...fadeIn} className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-[#ffcc00] bg-opacity-20 rounded-lg">
                    <FiBarChart2 className="w-5 h-5 text-[#1a1a1a]" />
                  </div>
                  <h3 className="text-3xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
                    Covariance-Based SEM
                  </h3>
                </div>
                <p className="text-gray-700 font-['Inter'] leading-relaxed mb-4">
                  Structural Equation Modeling (SEM) is a statistical methodology widely used in social sciences research. SEM allows researchers to test complex models with multiple pathways, model latent variables with multiple indicators, investigate mediation and moderation systematically, and adjust for measurement error in predictor variables. This series provides a general introduction to CB-SEM using AMOS software.
                </p>
                <p className="text-gray-600 font-['Inter'] text-sm italic mb-4">
                  Note: Material link to be updated
                </p>
              </motion.div>
            </div>

            {/* Grid of Research Topics */}
            <div className="grid md:grid-cols-2 gap-6">
              <ResearchLecture
                title="Psychometrics"
                description="Introduction to central concepts of measurement covering test construction, item analysis, reliability, validity, and measurement error. Includes hands-on sessions with SPSS and AMOS."
                driveLink="https://drive.google.com/drive/folders/"
              />

              <ResearchLecture
                title="Conditional Process Analysis"
                description="A comprehensive three-video series explaining mediation, moderation, and conditional process analysis with practical dataset examples."
                driveLink="https://drive.google.com/file/d/1Ih2WCnyC64mESIKByOIOYAmkCioAGiTO/view?usp=sharing"
              />

              <ResearchLecture
                title="Manuscript Writing & Publishing"
                description="A 16-session series covering elements of manuscript writing and strategies for high-quality academic publishing. Includes instruction files and supplementary readings."
                driveLink="https://drive.google.com/drive/folders/"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 lg:px-16 bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeIn}>
            <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-white mb-6">
              Ready to Start Learning?
            </h2>
            <p className="text-xl font-['Inter'] text-gray-300 mb-8">
              Explore our courses and begin your journey toward personal and professional excellence.
            </p>
            <a
              href="https://www.youtube.com/@ProfVishalGupta"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#ffcc00] text-[#1a1a1a] font-['Inter'] font-bold rounded-lg hover:bg-white transition-all text-lg"
            >
              <FiYoutube className="w-5 h-5" />
              Subscribe to YouTube Channel
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
