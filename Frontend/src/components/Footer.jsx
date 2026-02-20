import { Link } from 'react-router-dom';
import { FiLinkedin, FiTwitter, FiMail, FiYoutube, FiInstagram, FiFacebook } from 'react-icons/fi';
import { SiTiktok } from 'react-icons/si';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a1a] text-white pt-8 pb-6 md:pt-16 md:pb-12 px-6 lg:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Main Grid: Responsive 1 column on mobile, 3 on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12">
          
          {/* Column 1: Logo & Copyright (Centered on Mobile) */}
          <div className="flex flex-col items-center md:items-start space-y-2 md:space-y-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-lg">
                <span className="text-3xl">😊</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight" style={{ color: '#ffffff' }}>
                Prof. Vishal Gupta
              </h3>
            </div>
            <div className="text-gray-400 text-sm md:text-base space-y-2">
              <p className="flex items-center justify-center md:justify-start gap-2">
                <FiMail className="w-4 h-4" />
                <a href="mailto:vishal@iima.ac.in" className="hover:text-white transition-colors">
                  vishal@iima.ac.in
                </a>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+917971524935" className="hover:text-white transition-colors">
                  +91-79-7152-4935
                </a>
              </p>
            </div>
            <div className="text-gray-500 text-sm md:text-base font-medium space-y-1">
              <p>© {currentYear} Prof. Vishal Gupta.</p>
              <p>All rights reserved.</p>
            </div>
          </div>

          {/* Column 2: Navigation Links (2 Columns always, but centered on mobile) */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 py-3 md:py-0 border-y md:border-none border-white/5">
            <ul className="space-y-2 text-center md:text-left">
              <li><a href="/#home" className="text-base md:text-lg hover:underline opacity-80 hover:opacity-100 transition-all">Home</a></li>
              <li><Link to="/about" className="text-base md:text-lg hover:underline opacity-80 hover:opacity-100 transition-all">About</Link></li>
              <li><a href="/#courses" className="text-base md:text-lg hover:underline opacity-80 hover:opacity-100 transition-all">Courses</a></li>
              <li><Link to="/trainings" className="text-base md:text-lg hover:underline opacity-80 hover:opacity-100 transition-all">Trainings</Link></li>
            </ul>
            <ul className="space-y-2 text-center md:text-left">
              <li><Link to="/research" className="text-base md:text-lg hover:underline opacity-80 hover:opacity-100 transition-all">Research</Link></li>
              <li><a href="https://vishalgupta.kavisha.ai/" target="_blank" rel="noopener noreferrer" className="text-base md:text-lg hover:underline opacity-80 hover:opacity-100 transition-all">Digital Avatar</a></li>
              <li><a href="/#books" className="text-base md:text-lg hover:underline opacity-80 hover:opacity-100 transition-all">Books</a></li>
            </ul>
          </div>

          {/* Column 3: Socials & Newsletter (Centered on Mobile) */}
          <div className="flex flex-col items-center md:items-start space-y-3 md:space-y-6 pt-2 md:pt-0">
            {/* Social Icons Row */}
            <div className="flex gap-4 justify-center md:justify-start flex-wrap">
              {[
                { icon: <FiYoutube />, href: "https://www.youtube.com/@ProfVishalGupta" },
                { icon: <FiFacebook />, href: "https://facebook.com/@profvishalgupta" },
                { icon: <FiTwitter />, href: "https://twitter.com/@profvishalgupta" },
                { icon: <FiInstagram />, href: "https://instagram.com/@profvishalgupta" },
                { icon: <FiLinkedin />, href: "https://www.linkedin.com/in/gvishal/" }
              ].map((social, idx) => (
                <a key={idx} href={social.href} target="_blank" rel="noopener noreferrer" 
                   className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all">
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Newsletter Section */}
            <div className="space-y-2 md:space-y-4 text-center md:text-left w-full">
              <h4 className="font-bold uppercase tracking-[0.2em] text-[10px] text-gray-500">Newsletter</h4>
              <a href="/#newsletter" className="inline-block text-lg md:text-xl border-b border-white pb-1 hover:text-gray-400 hover:border-gray-400 transition-all font-medium">
                Subscribe for the latest
              </a>
            </div>
            
            <Link to="/admin" className="text-[10px] uppercase tracking-widest text-gray-700 hover:text-white transition-all">
              Admin Access
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}