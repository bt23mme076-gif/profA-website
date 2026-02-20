import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, collection, addDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { FiSave, FiPlus, FiTrash2, FiEdit, FiX, FiBookOpen, FiYoutube, FiFileText, FiDownload, FiStar, FiImage, FiUpload } from 'react-icons/fi';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

// Add mobile responsive styles
const mobileStyles = `
  @media (max-width: 768px) {
    .admin-tabs {
      flex-wrap: nowrap !important;
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
    }
    
    .admin-tab {
      flex-shrink: 0 !important;
      padding: 0.75rem 1rem !important;
      font-size: 0.875rem !important;
    }
    
    .admin-header {
      padding: 1.5rem 0 !important;
    }
    
    .admin-header h1 {
      font-size: 1.5rem !important;
    }
    
    .admin-header-content, .admin-content-wrapper {
      padding: 0 1rem !important;
    }
    
    .admin-button-group {
      flex-direction: column !important;
      width: 100% !important;
    }
    
    .admin-button-group button {
      width: 100% !important;
      justify-content: center !important;
    }
    
    .admin-card {
      padding: 1rem !important;
    }
    
    .admin-form-row {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .admin-form-row > div:first-child {
      width: 100% !important;
    }
    
    .logo-preview-container {
      width: 100% !important;
      min-width: 100% !important;
      max-width: 100% !important;
      height: 120px !important;
      margin-bottom: 1rem !important;
    }
    
    .logo-card-content {
      width: 100% !important;
    }
    
    .logo-url-text {
      display: none !important;
    }
    
    .logo-info-wrapper {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 0.75rem !important;
    }
    
    .admin-editor-actions {
      flex-direction: column !important;
      gap: 0.5rem !important;
    }
    
    .admin-editor-actions button {
      width: 100% !important;
    }
    
    .admin-content-section {
      padding: 1rem !important;
    }
  }
  
  @media (max-width: 480px) {
    .admin-header h1 {
      font-size: 1.25rem !important;
    }
    
    .admin-tab {
      font-size: 0.8rem !important;
      padding: 0.6rem 0.8rem !important;
    }
  }
`;

// Initial data for bulk import
const INITIAL_TESTIMONIALS = [
  {
    quote: "I have to admit that I wasn't sure what would be involved with your course, but I consider myself very blessed to have been a part of it. The historical aspect of Mahabharata was fascinating by itself, and I enjoyed the way you incorporated the epic with current leadership practices. Thank you very much for this unique opportunity!",
    author: "Colene Sassmann",
    role: "Class Participant 2023, MBA course",
    organization: "University of Northern Iowa",
    order: 0,
    published: true
  },
  {
    quote: "Prof. Vishal, observing you from the sidelines, I learnt many things. Chief amongst them, your dhairya, humility and a steadfast bold vision. Your course and its reflections on the ego & self as a leader made a deep impression, reminded me of my MBA at Berkeley and our leadership principles. Specifically, 'Confidence Without Attitude'.",
    author: "Rupal Nayar",
    role: "Director of Industry & University Partnerships, APAC",
    organization: "Coursera",
    order: 1,
    published: true
  },
  {
    quote: "We thank you for conducting the session for the Principals of Delhi Public Schools. The session was rewarding and much appreciated by the participants of the programme.",
    author: "Vanita Sehgal",
    role: "Executive Director, HRDC",
    organization: "DPSS",
    order: 2,
    published: true
  },
  {
    quote: "Thank you for such wonderful mentor/coach/guide/teacher. I am really feeling happy to be your student. The way you put up the topic is so interesting, I am loving it.",
    author: "Vijay Vyas",
    role: "Group Head, HR",
    organization: "Rushil Decor Limited",
    order: 3,
    published: true
  },
  {
    quote: "From the theory sessions, to the exercises, to the PLPS, and to the final examination, your course design was great and above all this, your teaching style with the conviction in the subject was exemplary. Right from the word go, I found myself deeply attached to this course, and it was only because of your teaching. Many thanks Sir!",
    author: "Akshay Jain",
    role: "PGPX participant of 2018-19 batch",
    organization: "IIM Ahmedabad",
    order: 4,
    published: true
  },
  {
    quote: "Your classes were a real value addition in FDP course. Thank you for teaching us so patiently. Besides, Multivariate and R, I also learn't how to teach systematically to make students understand in a much better way. You made a complicated course quite easy for us.",
    author: "Irfana Rashid",
    role: "FDP 2017 Participant",
    organization: "IIM Ahmedabad",
    order: 5,
    published: true
  },
  {
    quote: "Just wanted to thank you for the lecture today. It was, probably, the most important lecture that I ever attended.",
    author: "Kaustubh Korde",
    role: "PGPX 2018 Participant",
    organization: "IIM Ahmedabad",
    order: 6,
    published: true
  },
  {
    quote: "I pay my humble gratitude to you for all that I learned from you while at IIM Ahmedabad. Your depth in the subject and classroom delivery is unparallel. I feel lucky to be a part of your classroom. Apart from your teaching, which is notwithstanding class apart, you are also a very humble human being which has to be reckoned with.",
    author: "Abhigyan Bhattacharjee",
    role: "FDP 2018 Participant",
    organization: "IIM Ahmedabad",
    order: 7,
    published: true
  },
  {
    quote: "In this December 2025 I joined the Leadership Skills course on Coursera, it has helped me a lot to channel my emotions as a 20 year old. After watching the lessons I have gained a lot of clarity and rationality. I really look forward to you as my Guru Dronacharya in the Kurukshetra of my life. Thank You Sir for giving directions to my dreams and aspirations.",
    author: "Bhumika Patnaik",
    role: "Leadership Skills course student",
    organization: "",
    order: 8,
    published: true
  },
  {
    quote: "It was a pleasure attending the classes that you taught. The amount of energy you bring into the class and also the smile that is always present while teaching makes the sessions special. Some of the statements that you said were like a reset button, an epiphany, that made many to reconsider their actions.",
    author: "Nimish Lalwani",
    role: "PGP (MBA) Student",
    organization: "IIM Ahmedabad",
    order: 9,
    published: true
  },
  {
    quote: "Today's session was one of the best session I have experienced since I have joined IIMA. There have been very few instances in my life where I have been overwhelmed by the emotions so much that they had permanently changed my perception of life in a positive sense. This was one of it. These are the moments, not the salary or networking, that make you feel happy and satisfied about the decision of coming to IIMA and motivates you to become a better version of yourself.",
    author: "Harsh Dewra",
    role: "PGP (MBA) Student",
    organization: "IIMA",
    order: 10,
    published: true
  },
  {
    quote: "Prof. Vishal is a true teacher because of traits like kind, humble, patient with knowledge at par...glad to be a part of such a well organized FDP.....",
    author: "Dr. Rajanibala J. Shah",
    role: "L J Institute of Management Studies",
    organization: "",
    order: 11,
    published: true
  },
  {
    quote: "My most sincere gratitude to Prof Vishal Gupta for sparing time and selflessly sharing his vast knowledge for the benefit of young faculty and researchers!",
    author: "Kanika Khurana",
    role: "University of Mumbai",
    organization: "",
    order: 12,
    published: true
  }
];

const INITIAL_TRAINING_PARTNERS = [
  { name: "Ambuja Cements", logoUrl: "/Ambuja_Cements.svg.png", order: 0, published: true },
  { name: "BPCL", logoUrl: "/bpcl.jpg", order: 1, published: true },
  { name: "Defence Research and Development Organisation", logoUrl: "/Defence_Research_and_Development_Organisation.svg.png", order: 2, published: true },
  { name: "Hindalco", logoUrl: "/Hindalco_Logo.svg.png", order: 3, published: true },
  { name: "Hindustan Petroleum", logoUrl: "/Hindustan_Petroleum_Logo.svg", order: 4, published: true },
  { name: "Honeywell", logoUrl: "/Honeywell_logo.svg.png", order: 5, published: true },
  { name: "Indian Administrative Service", logoUrl: "/ias.jpg", order: 6, published: true },
  { name: "Indian Police Service", logoUrl: "/Indian_police_service_logo.jpeg", order: 7, published: true },
  { name: "Indian Revenue Service", logoUrl: "/Indian_Revenue_Service_Logo.png", order: 8, published: true },
  { name: "ISRO", logoUrl: "/Indian_Space_Research_Organisation_Logo.svg.png", order: 9, published: true },
  { name: "JLL", logoUrl: "/JLL_logo.svg.png", order: 10, published: true },
  { name: "Larsen & Toubro", logoUrl: "/Larsen&Toubro_logo.svg.png", order: 11, published: true },
  { name: "NHPC", logoUrl: "/NHPC_official_logo.svg.png", order: 12, published: true },
  { name: "Novartis", logoUrl: "/Novartis-Logo.svg.png", order: 13, published: true },
  { name: "Primarc", logoUrl: "/primarc.png", order: 14, published: true }
];

export default function AdminDashboard() {
  const { isAdmin, currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [homeContent, setHomeContent] = useState({});
  const [blogs, setBlogs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [trainingLogos, setTrainingLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Home content image upload states
  const [homeImageUploading, setHomeImageUploading] = useState({});
  const [homeImageProgress, setHomeImageProgress] = useState({});

  // Redirect if not admin
  useEffect(() => {
    console.log('Admin Dashboard - isAdmin:', isAdmin, 'currentUser:', currentUser?.email);
    if (!isAdmin && currentUser !== null) {
      console.log('Redirecting to home - not admin');
      navigate('/admin');
    }
  }, [isAdmin, currentUser, navigate]);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('Fetching admin dashboard data...');
      
      // Fetch home content
      const homeDoc = await getDoc(doc(db, 'content', 'home'));
      if (homeDoc.exists()) {
        setHomeContent(homeDoc.data());
        console.log('Home content loaded');
      } else {
        console.log('No home content found');
        setHomeContent({});
      }

      // Fetch blogs
      const blogsSnapshot = await getDocs(collection(db, 'blogs'));
      const blogsData = blogsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBlogs(blogsData);
      console.log('Blogs loaded:', blogsData.length);

      // Fetch courses
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);
      console.log('Courses loaded:', coursesData.length);

      // Fetch testimonials
      const testimonialsSnapshot = await getDocs(collection(db, 'testimonials'));
      const testimonialsData = testimonialsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTestimonials(testimonialsData);
      console.log('Testimonials loaded:', testimonialsData.length);

      // Fetch training logos
      const logosSnapshot = await getDocs(collection(db, 'training_partners'));
      const logosData = logosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrainingLogos(logosData);
      console.log('Training logos loaded:', logosData.length);

      setLoading(false);
      console.log('All data loaded successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ text: `Error loading data: ${error.message}`, type: 'error' });
      setLoading(false);
    }
  };

  // Save home content
  const saveHomeContent = async () => {
    try {
      setSaving(true);
      await updateDoc(doc(db, 'content', 'home'), homeContent);
      setMessage({ text: 'Home content saved successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error saving home content:', error);
      setMessage({ text: 'Error saving content', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Upload image for home content
  const handleHomeImageUpload = async (file, fieldName) => {
    if (!file) return;
    
    try {
      setHomeImageUploading({ ...homeImageUploading, [fieldName]: true });
      setHomeImageProgress({ ...homeImageProgress, [fieldName]: 'Uploading...' });
      
      const imageUrl = await uploadToCloudinary(file, 'home');
      
      setHomeContent({ ...homeContent, [fieldName]: imageUrl });
      setHomeImageProgress({ ...homeImageProgress, [fieldName]: 'Upload successful!' });
      setTimeout(() => {
        setHomeImageProgress({ ...homeImageProgress, [fieldName]: '' });
      }, 2000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setHomeImageProgress({ ...homeImageProgress, [fieldName]: 'Upload failed. Please try again.' });
    } finally {
      setHomeImageUploading({ ...homeImageUploading, [fieldName]: false });
    }
  };

  // Add new blog
  const addBlog = async () => {
    try {
      const newBlog = {
        title: 'New Blog Post',
        excerpt: 'Blog excerpt...',
        content: 'Blog content here...',
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
        author: currentUser.displayName || 'Prof. Vishal Gupta',
        date: new Date().toISOString(),
        published: false
      };
      const docRef = await addDoc(collection(db, 'blogs'), newBlog);
      setBlogs([...blogs, { id: docRef.id, ...newBlog }]);
      setMessage({ text: 'Blog added!', type: 'success' });
    } catch (error) {
      console.error('Error adding blog:', error);
      setMessage({ text: 'Error adding blog', type: 'error' });
    }
  };

  // Update blog
  const updateBlog = async (blogId, updatedData) => {
    try {
      await updateDoc(doc(db, 'blogs', blogId), updatedData);
      setBlogs(blogs.map(blog => blog.id === blogId ? { ...blog, ...updatedData } : blog));
      setMessage({ text: 'Blog updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error updating blog:', error);
      setMessage({ text: 'Error updating blog', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // Delete blog
  const deleteBlog = async (blogId) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
      await deleteDoc(doc(db, 'blogs', blogId));
      setBlogs(blogs.filter(blog => blog.id !== blogId));
      setMessage({ text: 'Blog deleted successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error deleting blog:', error);
      setMessage({ text: 'Error deleting blog', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // Add new course
  const addCourse = async () => {
    try {
      const newCourse = {
        title: 'New Course',
        description: 'Course description...',
        youtubeUrl: 'https://www.youtube.com/embed/VIDEO_ID',
        thumbnail: '', // Optional custom thumbnail
        duration: '8 weeks',
        level: 'Intermediate',
        published: false
      };
      const docRef = await addDoc(collection(db, 'courses'), newCourse);
      setCourses([...courses, { id: docRef.id, ...newCourse }]);
      setMessage({ text: 'Course added!', type: 'success' });
    } catch (error) {
      console.error('Error adding course:', error);
      setMessage({ text: 'Error adding course', type: 'error' });
    }
  };

  // Update course
  const updateCourse = async (courseId, updatedData) => {
    try {
      await updateDoc(doc(db, 'courses', courseId), updatedData);
      setCourses(courses.map(course => course.id === courseId ? { ...course, ...updatedData } : course));
      setMessage({ text: 'Course updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error updating course:', error);
      setMessage({ text: 'Error updating course', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // Delete course
  const deleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      setCourses(courses.filter(course => course.id !== courseId));
      setMessage({ text: 'Course deleted successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error deleting course:', error);
      setMessage({ text: 'Error deleting course', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // Add new testimonial
  const addTestimonial = async () => {
    try {
      const newTestimonial = {
        quote: 'Enter testimonial quote here...',
        author: 'Author Name',
        role: 'Role/Position',
        organization: 'Organization',
        order: testimonials.length,
        published: false
      };
      const docRef = await addDoc(collection(db, 'testimonials'), newTestimonial);
      setTestimonials([...testimonials, { id: docRef.id, ...newTestimonial }]);
      setMessage({ text: 'Testimonial added!', type: 'success' });
    } catch (error) {
      console.error('Error adding testimonial:', error);
      setMessage({ text: 'Error adding testimonial', type: 'error' });
    }
  };

  // Update testimonial
  const updateTestimonial = async (testimonialId, updatedData) => {
    try {
      await updateDoc(doc(db, 'testimonials', testimonialId), updatedData);
      setTestimonials(testimonials.map(t => t.id === testimonialId ? { ...t, ...updatedData } : t));
      setMessage({ text: 'Testimonial updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error updating testimonial:', error);
      setMessage({ text: 'Error updating testimonial', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // Delete testimonial
  const deleteTestimonial = async (testimonialId) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await deleteDoc(doc(db, 'testimonials', testimonialId));
      setTestimonials(testimonials.filter(t => t.id !== testimonialId));
      setMessage({ text: 'Testimonial deleted successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      setMessage({ text: 'Error deleting testimonial', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // Add new training logo
  const addTrainingLogo = async () => {
    try {
      const newLogo = {
        name: 'Company Name',
        logoUrl: '', // Empty - admin will upload their own logo
        order: trainingLogos.length,
        published: false // Default to unpublished until logo is added
      };
      const docRef = await addDoc(collection(db, 'training_partners'), newLogo);
      setTrainingLogos([...trainingLogos, { id: docRef.id, ...newLogo }]);
      setMessage({ text: 'Training partner added! Please upload logo and update name.', type: 'success' });
    } catch (error) {
      console.error('Error adding training partner:', error);
      setMessage({ text: 'Error adding training partner', type: 'error' });
    }
  };

  // Update training logo
  const updateTrainingLogo = async (logoId, updatedData) => {
    try {
      await updateDoc(doc(db, 'training_partners', logoId), updatedData);
      setTrainingLogos(trainingLogos.map(logo => logo.id === logoId ? { ...logo, ...updatedData } : logo));
      setMessage({ text: 'Training partner updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error updating training partner:', error);
      setMessage({ text: 'Error updating training partner', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // Delete training logo
  const deleteTrainingLogo = async (logoId) => {
    if (!confirm('Are you sure you want to delete this training partner?')) return;
    try {
      await deleteDoc(doc(db, 'training_partners', logoId));
      setTrainingLogos(trainingLogos.filter(logo => logo.id !== logoId));
      setMessage({ text: 'Training partner deleted successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error('Error deleting training partner:', error);
      setMessage({ text: 'Error deleting training partner', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // Bulk import testimonials
  const importTestimonials = async () => {
    if (!confirm(`This will add ${INITIAL_TESTIMONIALS.length} testimonials to your database. Continue?`)) return;
    try {
      setSaving(true);
      let count = 0;
      for (const testimonial of INITIAL_TESTIMONIALS) {
        await addDoc(collection(db, 'testimonials'), testimonial);
        count++;
      }
      setMessage({ text: `Successfully imported ${count} testimonials!`, type: 'success' });
      await fetchAllData(); // Refresh data
    } catch (error) {
      console.error('Error importing testimonials:', error);
      setMessage({ text: 'Error importing testimonials', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Bulk import training partners
  const importTrainingPartners = async () => {
    if (!confirm(`This will add ${INITIAL_TRAINING_PARTNERS.length} training partners to your database. Continue?`)) return;
    try {
      setSaving(true);
      let count = 0;
      for (const partner of INITIAL_TRAINING_PARTNERS) {
        await addDoc(collection(db, 'training_partners'), partner);
        count++;
      }
      setMessage({ text: `Successfully imported ${count} training partners!`, type: 'success' });
      await fetchAllData(); // Refresh data
    } catch (error) {
      console.error('Error importing training partners:', error);
      setMessage({ text: 'Error importing training partners', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Don't show anything if not admin
  if (!isAdmin && currentUser !== null) {
    return null;
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '1.5rem', color: '#666', marginBottom: '1rem' }}>Loading Dashboard...</div>
          <div style={{ fontSize: '0.9rem', color: '#999' }}>Fetching data from Firestore</div>
          {currentUser && (
            <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
              Logged in as: {currentUser.email}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{mobileStyles}</style>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingTop: '72px' }}>
        {/* Header */}
        <div className="admin-header" style={{ backgroundColor: '#1a1a1a', color: 'white', padding: '2rem 0' }}>
          <div className="admin-header-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Admin Dashboard</h1>
            <p style={{ color: '#999' }}>Welcome, {currentUser?.email}</p>
          </div>
        </div>

      {/* Message Banner */}
      {message.text && (
        <div style={{
          backgroundColor: message.type === 'success' ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '1rem 2rem',
          textAlign: 'center'
        }}>
          {message.text}
        </div>
      )}

      <div className="admin-content-wrapper" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Tabs */}
        <div className="admin-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e5e5' }}>
          <button
            className="admin-tab"
            onClick={() => setActiveTab('home')}
            style={{
              padding: '1rem 2rem',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'home' ? '3px solid #1a1a1a' : 'none',
              fontWeight: activeTab === 'home' ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FiFileText /> <span>Home Content</span>
          </button>
          <button
            className="admin-tab"
            onClick={() => setActiveTab('blogs')}
            style={{
              padding: '1rem 2rem',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'blogs' ? '3px solid #1a1a1a' : 'none',
              fontWeight: activeTab === 'blogs' ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FiBookOpen /> <span>Blogs</span>
          </button>
          <button
            className="admin-tab"
            onClick={() => setActiveTab('courses')}
            style={{
              padding: '1rem 2rem',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'courses' ? '3px solid #1a1a1a' : 'none',
              fontWeight: activeTab === 'courses' ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FiYoutube /> <span>Courses</span>
          </button>
          <button
            className="admin-tab"
            onClick={() => setActiveTab('testimonials')}
            style={{
              padding: '1rem 2rem',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'testimonials' ? '3px solid #1a1a1a' : 'none',
              fontWeight: activeTab === 'testimonials' ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FiStar /> <span>Testimonials</span>
          </button>
          <button
            className="admin-tab"
            onClick={() => setActiveTab('logos')}
            style={{
              padding: '1rem 2rem',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'logos' ? '3px solid #1a1a1a' : 'none',
              fontWeight: activeTab === 'logos' ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FiImage /> <span>Training Logos</span>
          </button>
        </div>

        {/* Home Content Tab */}
        {activeTab === 'home' && (
          <div className="admin-card admin-content-section" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Edit Home Page Content</h2>
            
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Hero Section */}
              <div style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Hero Section</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Greeting</label>
                    <input
                      type="text"
                      value={homeContent.hero_greeting || ''}
                      onChange={(e) => setHomeContent({ ...homeContent, hero_greeting: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Name</label>
                    <input
                      type="text"
                      value={homeContent.hero_name || ''}
                      onChange={(e) => setHomeContent({ ...homeContent, hero_name: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Subtitle</label>
                    <input
                      type="text"
                      value={homeContent.hero_subtitle || ''}
                      onChange={(e) => setHomeContent({ ...homeContent, hero_subtitle: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                    <textarea
                      value={homeContent.hero_description || ''}
                      onChange={(e) => setHomeContent({ ...homeContent, hero_description: e.target.value })}
                      rows={4}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                      <FiImage style={{ display: 'inline', marginRight: '0.5rem' }} />
                      Hero Image
                    </label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <label
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: homeImageUploading.hero_image ? '#9ca3af' : '#2A35CC',
                          color: 'white',
                          borderRadius: '4px',
                          cursor: homeImageUploading.hero_image ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <FiUpload />
                        {homeImageUploading.hero_image ? 'Uploading...' : 'Upload Image'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files[0] && handleHomeImageUpload(e.target.files[0], 'hero_image')}
                          disabled={homeImageUploading.hero_image}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {homeImageProgress.hero_image && (
                        <span style={{ 
                          padding: '0.5rem', 
                          color: homeImageProgress.hero_image.includes('failed') ? '#ef4444' : '#10b981',
                          fontSize: '0.9rem'
                        }}>
                          {homeImageProgress.hero_image}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={homeContent.hero_image || ''}
                      onChange={(e) => setHomeContent({ ...homeContent, hero_image: e.target.value })}
                      placeholder="Or paste image URL"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    {homeContent.hero_image && (
                      <img 
                        src={homeContent.hero_image} 
                        alt="Hero preview" 
                        style={{ marginTop: '0.5rem', maxWidth: '200px', height: 'auto', borderRadius: '4px' }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Blog Images Section */}
              <div style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Blog Section (Static Fallback)</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Section Heading</label>
                    <input
                      type="text"
                      value={homeContent.blog_heading || ''}
                      onChange={(e) => setHomeContent({ ...homeContent, blog_heading: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  {[1, 2, 3].map(num => (
                    <div key={num} style={{ display: 'grid', gap: '0.5rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                      <h4 style={{ fontWeight: 600 }}>Blog {num}</h4>
                      <input
                        type="text"
                        placeholder="Title"
                        value={homeContent[`blog${num}_title`] || ''}
                        onChange={(e) => setHomeContent({ ...homeContent, [`blog${num}_title`]: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                      <input
                        type="text"
                        placeholder="Excerpt"
                        value={homeContent[`blog${num}_excerpt`] || ''}
                        onChange={(e) => setHomeContent({ ...homeContent, [`blog${num}_excerpt`]: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <label
                            style={{
                              padding: '0.4rem 0.8rem',
                              backgroundColor: homeImageUploading[`blog${num}_image`] ? '#9ca3af' : '#2A35CC',
                              color: 'white',
                              borderRadius: '4px',
                              cursor: homeImageUploading[`blog${num}_image`] ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            <FiUpload size={14} />
                            {homeImageUploading[`blog${num}_image`] ? 'Uploading...' : 'Upload'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files[0] && handleHomeImageUpload(e.target.files[0], `blog${num}_image`)}
                              disabled={homeImageUploading[`blog${num}_image`]}
                              style={{ display: 'none' }}
                            />
                          </label>
                          {homeImageProgress[`blog${num}_image`] && (
                            <span style={{ 
                              color: homeImageProgress[`blog${num}_image`].includes('failed') ? '#ef4444' : '#10b981',
                              fontSize: '0.8rem'
                            }}>
                              {homeImageProgress[`blog${num}_image`]}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Or paste image URL"
                          value={homeContent[`blog${num}_image`] || ''}
                          onChange={(e) => setHomeContent({ ...homeContent, [`blog${num}_image`]: e.target.value })}
                          style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                      </div>
                      {homeContent[`blog${num}_image`] && (
                        <img 
                          src={homeContent[`blog${num}_image`]} 
                          alt={`Blog ${num} preview`}
                          style={{ marginTop: '0.5rem', maxWidth: '150px', height: 'auto', borderRadius: '4px' }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Courses Section (Static Fallback) */}
              <div style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Courses Section (Static Fallback)</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Section Heading</label>
                    <input
                      type="text"
                      value={homeContent.courses_heading || ''}
                      onChange={(e) => setHomeContent({ ...homeContent, courses_heading: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  {[1, 2].map(num => (
                    <div key={num} style={{ display: 'grid', gap: '0.5rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                      <h4 style={{ fontWeight: 600 }}>Course {num}</h4>
                      <input
                        type="text"
                        placeholder="Title"
                        value={homeContent[`course${num}_title`] || ''}
                        onChange={(e) => setHomeContent({ ...homeContent, [`course${num}_title`]: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                      <textarea
                        placeholder="Description"
                        value={homeContent[`course${num}_description`] || ''}
                        onChange={(e) => setHomeContent({ ...homeContent, [`course${num}_description`]: e.target.value })}
                        rows={2}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                      <input
                        type="text"
                        placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)"
                        value={homeContent[`course${num}_youtube`] || ''}
                        onChange={(e) => setHomeContent({ ...homeContent, [`course${num}_youtube`]: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                      {homeContent[`course${num}_youtube`] && (
                        <div style={{ marginTop: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                            <iframe
                              src={homeContent[`course${num}_youtube`].includes('embed') 
                                ? homeContent[`course${num}_youtube`] 
                                : `https://www.youtube.com/embed/${extractVideoId(homeContent[`course${num}_youtube`])}`
                              }
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Books Section */}
              <div style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Books Section</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Section Heading</label>
                    <input
                      type="text"
                      value={homeContent.books_heading || ''}
                      onChange={(e) => setHomeContent({ ...homeContent, books_heading: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  {[1, 2, 3].map(num => (
                    <div key={num} style={{ display: 'grid', gap: '0.5rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                      <h4 style={{ fontWeight: 600 }}>Book {num}</h4>
                      <input
                        type="text"
                        placeholder="Title"
                        value={homeContent[`book${num}_title`] || ''}
                        onChange={(e) => setHomeContent({ ...homeContent, [`book${num}_title`]: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={homeContent[`book${num}_description`] || ''}
                        onChange={(e) => setHomeContent({ ...homeContent, [`book${num}_description`]: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={homeContent[`book${num}_image`] || ''}
                        onChange={(e) => setHomeContent({ ...homeContent, [`book${num}_image`]: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                      {homeContent[`book${num}_image`] && (
                        <img 
                          src={homeContent[`book${num}_image`]} 
                          alt={`Book ${num} preview`}
                          style={{ marginTop: '0.5rem', maxWidth: '120px', height: 'auto', borderRadius: '4px' }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact/Map Section */}
              <div style={{ borderBottom: '1px solid #e5e5e5', paddingBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Contact Section</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Contact Map/Image URL</label>
                    <input
                      type="text"
                      value={homeContent.contact_map_image || ''}
                      onChange={(e) => setHomeContent({ ...homeContent, contact_map_image: e.target.value })}
                      placeholder="https://example.com/map-image.jpg"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                    {homeContent.contact_map_image && (
                      <img 
                        src={homeContent.contact_map_image} 
                        alt="Contact map preview"
                        style={{ marginTop: '0.5rem', maxWidth: '200px', height: 'auto', borderRadius: '4px' }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Newsletter Section */}
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Newsletter Section</h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Heading</label>
                    <input
                      type="text"
                      value={homeContent.newsletter_heading || ''}
                      onChange={(e) => setHomeContent({ ...homeContent, newsletter_heading: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
                    <textarea
                      value={homeContent.newsletter_description || ''}
                      onChange={(e) => setHomeContent({ ...homeContent, newsletter_description: e.target.value })}
                      rows={3}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={saveHomeContent}
              disabled={saving}
              style={{
                marginTop: '2rem',
                padding: '0.75rem 2rem',
                backgroundColor: '#1a1a1a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Blogs Tab */}
        {activeTab === 'blogs' && (
          <div className="admin-card admin-content-section" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div className="admin-button-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Manage Blogs</h2>
              <button
                onClick={addBlog}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1a1a1a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FiPlus /> Add Blog
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {blogs.map(blog => (
                <BlogEditor
                  key={blog.id}
                  blog={blog}
                  onUpdate={(data) => updateBlog(blog.id, data)}
                  onDelete={() => deleteBlog(blog.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="admin-card admin-content-section" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div className="admin-button-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Manage Courses</h2>
              <button
                onClick={addCourse}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1a1a1a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FiPlus /> Add Course
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {courses.map(course => (
                <CourseEditor
                  key={course.id}
                  course={course}
                  onUpdate={(data) => updateCourse(course.id, data)}
                  onDelete={() => deleteCourse(course.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <div className="admin-card admin-content-section" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div className="admin-button-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Manage Testimonials</h2>
              <div className="admin-button-group" style={{ display: 'flex', gap: '1rem' }}>
                {testimonials.length === 0 && (
                  <button
                    onClick={importTestimonials}
                    disabled={saving}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 600
                    }}
                  >
                    <FiDownload /> {saving ? 'Importing...' : 'Import Initial Data (13 items)'}
                  </button>
                )}
                <button
                  onClick={addTestimonial}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#1a1a1a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <FiPlus /> Add Testimonial
                </button>
              </div>
            </div>

            {testimonials.length === 0 && (
              <div style={{ padding: '2rem', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#166534', marginBottom: '0.5rem' }}>
                  No testimonials yet!
                </h3>
                <p style={{ color: '#15803d', marginBottom: '1rem' }}>
                  Click "Import Initial Data" to add all 13 testimonials at once, or add them manually one by one.
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {testimonials.sort((a, b) => a.order - b.order).map(testimonial => (
                <TestimonialEditor
                  key={testimonial.id}
                  testimonial={testimonial}
                  onUpdate={(data) => updateTestimonial(testimonial.id, data)}
                  onDelete={() => deleteTestimonial(testimonial.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Training Logos Tab */}
        {activeTab === 'logos' && (
          <div className="admin-card admin-content-section" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div className="admin-button-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Manage Training Partners</h2>
              <div className="admin-button-group" style={{ display: 'flex', gap: '1rem' }}>
                {trainingLogos.length === 0 && (
                  <button
                    onClick={importTrainingPartners}
                    disabled={saving}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 600
                    }}
                  >
                    <FiDownload /> {saving ? 'Importing...' : 'Import Initial Data (15 logos)'}
                  </button>
                )}
                <button
                  onClick={addTrainingLogo}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#1a1a1a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <FiPlus /> Add Training Partner
                </button>
              </div>
            </div>

            {trainingLogos.length === 0 && (
              <div style={{ padding: '2rem', backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#166534', marginBottom: '0.5rem' }}>
                  No training partners yet!
                </h3>
                <p style={{ color: '#15803d', marginBottom: '1rem' }}>
                  Click "Import Initial Data" to add all 15 company logos at once, or add them manually one by one.
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {trainingLogos.sort((a, b) => a.order - b.order).map(logo => (
                <TrainingLogoEditor
                  key={logo.id}
                  logo={logo}
                  onUpdate={(data) => updateTrainingLogo(logo.id, data)}
                  onDelete={() => deleteTrainingLogo(logo.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}

// Blog Editor Component
function BlogEditor({ blog, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editedBlog, setEditedBlog] = useState(blog);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Sync local state with prop changes
  useEffect(() => {
    setEditedBlog(blog);
  }, [blog]);

  const handleSave = () => {
    onUpdate(editedBlog);
    setEditing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress('Uploading image...');
      
      const imageUrl = await uploadToCloudinary(file, 'blogs');
      
      setEditedBlog({ ...editedBlog, imageUrl: imageUrl });
      setUploadProgress('Image uploaded successfully! ✓');
      
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress('Upload failed: ' + error.message);
      setTimeout(() => setUploadProgress(''), 5000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-card" style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '1.5rem' }}>
      {editing ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <input
            type="text"
            value={editedBlog.title}
            onChange={(e) => setEditedBlog({ ...editedBlog, title: e.target.value })}
            style={{ fontSize: '1.2rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="Blog Title"
          />
          <textarea
            value={editedBlog.excerpt}
            onChange={(e) => setEditedBlog({ ...editedBlog, excerpt: e.target.value })}
            rows={2}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="Excerpt"
          />
          <textarea
            value={editedBlog.content}
            onChange={(e) => setEditedBlog({ ...editedBlog, content: e.target.value })}
            rows={6}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="Full Content"
          />
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              <FiImage style={{ display: 'inline', marginRight: '0.5rem' }} />
              Blog Image
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <label
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: uploading ? '#9ca3af' : '#2A35CC',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FiUpload />
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
              {uploadProgress && (
                <span style={{ 
                  padding: '0.5rem', 
                  color: uploadProgress.includes('failed') ? '#ef4444' : '#10b981',
                  fontSize: '0.9rem'
                }}>
                  {uploadProgress}
                </span>
              )}
            </div>
            <input
              type="text"
              value={editedBlog.imageUrl || ''}
              onChange={(e) => setEditedBlog({ ...editedBlog, imageUrl: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.5rem' }}
              placeholder="Or paste image URL"
            />
            {editedBlog.imageUrl && (
              <div style={{ marginTop: '1rem' }}>
                <img 
                  src={editedBlog.imageUrl} 
                  alt="Blog preview"
                  style={{ maxWidth: '300px', height: 'auto', borderRadius: '8px', border: '2px solid #e5e5e5' }}
                  onError={(e) => e.target.style.display = 'none'}
                />
                <button
                  onClick={() => setEditedBlog({ ...editedBlog, imageUrl: '' })}
                  style={{ 
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'block'
                  }}
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={editedBlog.published}
                onChange={(e) => setEditedBlog({ ...editedBlog, published: e.target.checked })}
              />
              Published
            </label>
          </div>
          <div className="admin-editor-actions" style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleSave}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiSave /> Save
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiX /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="admin-form-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>{blog.title}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>{blog.excerpt}</p>
              <span style={{ 
                display: 'inline-block', 
                marginTop: '0.5rem', 
                padding: '0.25rem 0.75rem', 
                backgroundColor: blog.published ? '#10b981' : '#6b7280',
                color: 'white',
                borderRadius: '999px',
                fontSize: '0.75rem'
              }}>                {blog.published ? 'Published' : 'Draft'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setEditing(true)}
                style={{ padding: '0.5rem', backgroundColor: '#2A35CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                <FiEdit />
              </button>
              <button
                onClick={onDelete}
                style={{ padding: '0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Course Editor Component
function CourseEditor({ course, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editedCourse, setEditedCourse] = useState(course);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Sync local state with prop changes
  useEffect(() => {
    setEditedCourse(course);
  }, [course]);

  const handleSave = () => {
    onUpdate(editedCourse);
    setEditing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress('Uploading image...');
      
      const imageUrl = await uploadToCloudinary(file, 'courses');
      
      setEditedCourse({ ...editedCourse, thumbnail: imageUrl });
      setUploadProgress('Image uploaded successfully! ✓');
      
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress('Upload failed: ' + error.message);
      setTimeout(() => setUploadProgress(''), 5000);
    } finally {
      setUploading(false);
    }
  };

  const extractVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="admin-card" style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '1.5rem' }}>
      {editing ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <input
            type="text"
            value={editedCourse.title}
            onChange={(e) => setEditedCourse({ ...editedCourse, title: e.target.value })}
            style={{ fontSize: '1.2rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="Course Title"
          />
          <textarea
            value={editedCourse.description}
            onChange={(e) => setEditedCourse({ ...editedCourse, description: e.target.value })}
            rows={3}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="Course Description"
          />
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              YouTube URL (full URL or embed URL)
            </label>
            <input
              type="text"
              value={editedCourse.youtubeUrl}
              onChange={(e) => setEditedCourse({ ...editedCourse, youtubeUrl: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID or https://www.youtube.com/embed/VIDEO_ID"
            />
          </div>
          
          {/* Image Upload Field */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              <FiImage style={{ display: 'inline', marginRight: '0.5rem' }} />
              Course Thumbnail Image (Optional)
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <label
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: uploading ? '#9ca3af' : '#2A35CC',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FiUpload />
                {uploading ? 'Uploading...' : 'Choose Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
              {uploadProgress && (
                <span style={{ 
                  padding: '0.5rem', 
                  color: uploadProgress.includes('failed') ? '#ef4444' : '#10b981',
                  fontSize: '0.9rem'
                }}>
                  {uploadProgress}
                </span>
              )}
            </div>
            {editedCourse.thumbnail && (
              <div style={{ marginTop: '1rem' }}>
                <img
                  src={editedCourse.thumbnail}
                  alt="Course thumbnail preview"
                  style={{ 
                    maxWidth: '300px', 
                    maxHeight: '200px', 
                    borderRadius: '8px',
                    border: '2px solid #e5e5e5',
                    objectFit: 'cover'
                  }}
                />
                <button
                  onClick={() => setEditedCourse({ ...editedCourse, thumbnail: '' })}
                  style={{ 
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Remove Image
                </button>
              </div>
            )}
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>
              Recommended: 1280x720px, max 5MB. If not provided, YouTube thumbnail will be used.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input
              type="text"
              value={editedCourse.duration}
              onChange={(e) => setEditedCourse({ ...editedCourse, duration: e.target.value })}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              placeholder="Duration (e.g., 8 weeks)"
            />
            <input
              type="text"
              value={editedCourse.level}
              onChange={(e) => setEditedCourse({ ...editedCourse, level: e.target.value })}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              placeholder="Level (e.g., Intermediate)"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={editedCourse.published}
                onChange={(e) => setEditedCourse({ ...editedCourse, published: e.target.checked })}
              />
              Published
            </label>
          </div>
          <div className="admin-editor-actions" style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleSave}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiSave /> Save
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiX /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="admin-form-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>{course.title}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{course.description}</p>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#666' }}>
                <span>Duration: {course.duration}</span>
                <span>Level: {course.level}</span>
              </div>
              <span style={{ 
                display: 'inline-block', 
                marginTop: '0.5rem', 
                padding: '0.25rem 0.75rem', 
                backgroundColor: course.published ? '#10b981' : '#6b7280',
                color: 'white',
                borderRadius: '999px',
                fontSize: '0.75rem'
              }}>                {course.published ? 'Published' : 'Draft'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setEditing(true)}
                style={{ padding: '0.5rem', backgroundColor: '#2A35CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                <FiEdit />
              </button>
              <button
                onClick={onDelete}
                style={{ padding: '0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
          {course.youtubeUrl && (
            <div style={{ marginTop: '1rem' }}>
              <iframe
                width="100%"
                height="200"
                src={course.youtubeUrl.includes('embed') ? course.youtubeUrl : `https://www.youtube.com/embed/${extractVideoId(course.youtubeUrl)}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: '8px' }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Testimonial Editor Component
function TestimonialEditor({ testimonial, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editedTestimonial, setEditedTestimonial] = useState(testimonial);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Sync local state with prop changes
  useEffect(() => {
    setEditedTestimonial(testimonial);
  }, [testimonial]);

  const handleSave = () => {
    onUpdate(editedTestimonial);
    setEditing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress('Uploading photo...');
      
      const imageUrl = await uploadToCloudinary(file, 'testimonials');
      
      setEditedTestimonial({ ...editedTestimonial, photoUrl: imageUrl });
      setUploadProgress('Photo uploaded successfully! ✓');
      
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress('Upload failed: ' + error.message);
      setTimeout(() => setUploadProgress(''), 5000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-card" style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '1.5rem' }}>
      {editing ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <textarea
            value={editedTestimonial.quote}
            onChange={(e) => setEditedTestimonial({ ...editedTestimonial, quote: e.target.value })}
            rows={4}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' }}
            placeholder="Testimonial quote..."
          />
          <input
            type="text"
            value={editedTestimonial.author}
            onChange={(e) => setEditedTestimonial({ ...editedTestimonial, author: e.target.value })}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="Author Name"
          />
          <input
            type="text"
            value={editedTestimonial.role}
            onChange={(e) => setEditedTestimonial({ ...editedTestimonial, role: e.target.value })}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="Role/Position"
          />
          <input
            type="text"
            value={editedTestimonial.organization || ''}
            onChange={(e) => setEditedTestimonial({ ...editedTestimonial, organization: e.target.value })}
            style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="Organization (optional)"
          />
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              <FiImage style={{ display: 'inline', marginRight: '0.5rem' }} />
              Author Photo (Optional)
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <label
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: uploading ? '#9ca3af' : '#2A35CC',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FiUpload />
                {uploading ? 'Uploading...' : 'Upload Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
              {uploadProgress && (
                <span style={{ 
                  padding: '0.5rem', 
                  color: uploadProgress.includes('failed') ? '#ef4444' : '#10b981',
                  fontSize: '0.9rem'
                }}>
                  {uploadProgress}
                </span>
              )}
            </div>
            {editedTestimonial.photoUrl && (
              <div style={{ marginTop: '1rem' }}>
                <img 
                  src={editedTestimonial.photoUrl} 
                  alt="Author photo"
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #e5e5e5' }}
                  onError={(e) => e.target.style.display = 'none'}
                />
                <button
                  onClick={() => setEditedTestimonial({ ...editedTestimonial, photoUrl: '' })}
                  style={{ 
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'block'
                  }}
                >
                  Remove Photo
                </button>
              </div>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Display Order</label>
            <input
              type="number"
              value={editedTestimonial.order}
              onChange={(e) => setEditedTestimonial({ ...editedTestimonial, order: parseInt(e.target.value) || 0 })}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', width: '150px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={editedTestimonial.published}
                onChange={(e) => setEditedTestimonial({ ...editedTestimonial, published: e.target.checked })}
              />
              Published
            </label>
          </div>
          <div className="admin-editor-actions" style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleSave}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiSave /> Save
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiX /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="admin-form-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '1rem', fontStyle: 'italic', color: '#333', marginBottom: '1rem', lineHeight: '1.6' }}>
                "{testimonial.quote}"
              </p>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>— {testimonial.author}</p>
                <p style={{ marginBottom: '0.25rem' }}>{testimonial.role}</p>
                {testimonial.organization && <p>{testimonial.organization}</p>}
              </div>
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: testimonial.published ? '#10b981' : '#6b7280',
                  color: 'white',
                  borderRadius: '999px',
                  fontSize: '0.75rem'
                }}>
                  {testimonial.published ? 'Published' : 'Draft'}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#999' }}>Order: {testimonial.order}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setEditing(true)}
                style={{ padding: '0.5rem', backgroundColor: '#2A35CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                <FiEdit />
              </button>
              <button
                onClick={onDelete}
                style={{ padding: '0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Training Logo Editor Component
function TrainingLogoEditor({ logo, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editedLogo, setEditedLogo] = useState(logo);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Sync local state with prop changes
  useEffect(() => {
    setEditedLogo(logo);
  }, [logo]);

  const handleSave = () => {
    onUpdate(editedLogo);
    setEditing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress('Uploading logo...');
      
      const imageUrl = await uploadToCloudinary(file, 'logos');
      
      setEditedLogo({ ...editedLogo, logoUrl: imageUrl });
      setUploadProgress('Logo uploaded successfully! ✓');
      
      setTimeout(() => setUploadProgress(''), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress('Upload failed: ' + error.message);
      setTimeout(() => setUploadProgress(''), 5000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-card" style={{ 
      border: '1px solid #e5e5e5', 
      borderRadius: '8px', 
      padding: '1.5rem',
      backgroundColor: '#fff',
      transition: 'box-shadow 0.2s',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }}>
      {editing ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <input
            type="text"
            value={editedLogo.name}
            onChange={(e) => setEditedLogo({ ...editedLogo, name: e.target.value })}
            style={{ fontSize: '1rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            placeholder="Company/Organization Name"
          />
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              <FiImage style={{ display: 'inline', marginRight: '0.5rem' }} />
              Company Logo
            </label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <label
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: uploading ? '#9ca3af' : '#2A35CC',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <FiUpload />
                {uploading ? 'Uploading...' : 'Upload Logo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
              {uploadProgress && (
                <span style={{ 
                  padding: '0.5rem', 
                  color: uploadProgress.includes('failed') ? '#ef4444' : '#10b981',
                  fontSize: '0.9rem'
                }}>
                  {uploadProgress}
                </span>
              )}
            </div>
            <input
              type="text"
              value={editedLogo.logoUrl}
              onChange={(e) => setEditedLogo({ ...editedLogo, logoUrl: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', marginTop: '0.5rem' }}
              placeholder="Or paste logo URL"
            />
            {editedLogo.logoUrl ? (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px', display: 'flex', justifyContent: 'center', minHeight: '120px', alignItems: 'center' }}>
                  <img 
                    src={editedLogo.logoUrl} 
                    alt={editedLogo.name}
                    style={{ maxWidth: '250px', maxHeight: '100px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <p style={{ display: 'none', color: '#ef4444', fontSize: '0.85rem' }}>Logo failed to load. Check the URL.</p>
                </div>
                <button
                  onClick={() => setEditedLogo({ ...editedLogo, logoUrl: '' })}
                  style={{ 
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Remove Logo
                </button>
              </div>
            ) : (
              <div style={{ 
                marginTop: '1rem', 
                padding: '2rem', 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px', 
                border: '2px dashed #d1d5db',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <FiImage size={40} color="#9ca3af" />
                <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>No logo uploaded yet</p>
                <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>Upload an image or paste a URL above</p>
              </div>
            )}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Display Order</label>
            <input
              type="number"
              value={editedLogo.order}
              onChange={(e) => setEditedLogo({ ...editedLogo, order: parseInt(e.target.value) || 0 })}
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', width: '150px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={editedLogo.published}
                onChange={(e) => setEditedLogo({ ...editedLogo, published: e.target.checked })}
              />
              Published
            </label>
          </div>
          <div className="admin-editor-actions" style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleSave}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiSave /> Save
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiX /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="admin-form-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
            <div className="logo-info-wrapper" style={{ display: 'flex', alignItems: 'start', gap: '1rem', flex: 1 }}>
              <div className="logo-preview-container" style={{ 
                minWidth: '180px', 
                width: '180px',
                height: '100px', 
                backgroundColor: '#ffffff', 
                border: '2px solid #e5e5e5',
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                padding: '1rem',
                flexShrink: 0,
                position: 'relative'
              }}>
                {logo.logoUrl ? (
                  <img 
                    src={logo.logoUrl} 
                    alt={logo.name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: '#999',
                    fontSize: '0.75rem'
                  }}>
                    <FiImage size={24} color="#ccc" />
                    <span style={{ marginTop: '0.5rem' }}>No Logo</span>
                  </div>
                )}
              </div>
              <div className="logo-card-content" style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{logo.name}</h3>
                <p className="logo-url-text" style={{ 
                  fontSize: '0.75rem', 
                  color: '#999', 
                  marginBottom: '0.75rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>{logo.logoUrl}</p>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    padding: '0.25rem 0.75rem', 
                    backgroundColor: logo.published ? '#10b981' : '#6b7280',
                    color: 'white',
                    borderRadius: '999px',
                    fontSize: '0.75rem'
                  }}>
                    {logo.published ? 'Published' : 'Draft'}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#999' }}>Order: {logo.order}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <button
                onClick={() => setEditing(true)}
                style={{ padding: '0.5rem', backgroundColor: '#2A35CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                <FiEdit />
              </button>
              <button
                onClick={onDelete}
                style={{ padding: '0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

