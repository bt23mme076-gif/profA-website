import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import Trainings from './pages/Trainings';
import Research from './pages/Research';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Books from './pages/book';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/trainings" element={<Trainings />} />
          <Route path="/research" element={<Research />} />
          <Route path="/admin" element={<AdminLogin />} />
           <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/book" element={<Books />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;