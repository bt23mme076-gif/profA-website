import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiSettings, FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAdmin, logout } = useAuth();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when resizing to desktop
  useEffect(() => {
    if (windowWidth >= 1024 && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [windowWidth, mobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen && windowWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen, windowWidth]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navLinks = [
    { name: 'About me', path: '/about' },
    { name: 'Research', path: '/research' },
    { name: 'Books', hash: '#books' },
    { name: 'Courses', path: '/courses' },
    { name: 'Trainings', path: '/trainings' },
    { name: 'Digital Avatar', hash: '#contact' },
    { name: 'Newsletter', hash: '#newsletter' },
  ];

  const scrollToSection = (hash) => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavClick = (link) => {
    setMobileMenuOpen(false); // Close mobile menu on nav click
    if (link.path) {
      // Navigate to a different page
      navigate(link.path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link.hash) {
      // Scroll to section on current page or navigate home first
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => scrollToSection(link.hash), 100);
      } else {
        scrollToSection(link.hash);
      }
    }
  };

  return (
    <>
      {/* Navbar - Responsive Full-Width Style */}
      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50, 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{ 
          width: '100%',
          padding: windowWidth < 768 ? '0 1.25rem' : '0 4rem', 
          height: windowWidth < 768 ? '65px' : '80px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          {/* Logo/Brand - Responsive */}
          <Link to="/" onClick={() => { scrollToSection(null); setMobileMenuOpen(false); }} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: windowWidth < 768 ? '0.65rem' : '1rem', flex: 1 }}>
            {/* IIM-A Logo */}
            <img 
              src="/64b7e6d08d07b_iim,_ahmedabad_logo.svg (1).png" 
              alt="IIM Ahmedabad Logo" 
              style={{ 
                height: windowWidth < 480 ? '36px' : windowWidth < 768 ? '42px' : '55px', 
                width: 'auto',
                objectFit: 'contain',
                flexShrink: 0
              }}
            />
            {/* Text - Clean mobile arrangement */}
            <div>
              <h1 style={{ 
                fontSize: windowWidth < 480 ? '0.95rem' : windowWidth < 768 ? '1.1rem' : '1.5rem', 
                fontFamily: '"Playfair Display", "Georgia", serif', 
                fontWeight: 700, 
                color: '#1a1a1a',
                letterSpacing: '-0.03em',
                margin: 0,
                lineHeight: 1.1,
                textShadow: '0 1px 2px rgba(0,0,0,0.05)',
                whiteSpace: windowWidth < 768 ? 'nowrap' : 'normal'
              }}>
                {windowWidth < 480 ? 'Prof. Vishal Gupta' : 'PROF. VISHAL GUPTA'}
              </h1>
              {windowWidth >= 480 && (
                <p style={{
                  fontSize: windowWidth < 768 ? '0.65rem' : '0.7rem',
                  fontFamily: '"Inter", -apple-system, sans-serif',
                  color: '#888888',
                  margin: '3px 0 0 0',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}>
                  IIM Ahmedabad
                </p>
              )}
            </div>
          </Link>

          {/* Hamburger Menu Button - Mobile Only */}
          {windowWidth < 1024 && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: windowWidth < 480 ? '0.4rem' : '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1a1a1a',
                zIndex: 60,
                marginLeft: '0.5rem',
                transition: 'transform 0.2s ease'
              }}
              aria-label="Toggle menu"
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {mobileMenuOpen ? <FiX size={windowWidth < 480 ? 26 : 28} /> : <FiMenu size={windowWidth < 480 ? 26 : 28} />}
            </button>
          )}

          {/* Desktop Navigation - Hidden on Mobile */}
          {windowWidth >= 1024 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link)}
                  onMouseEnter={() => setHoveredLink(link.name)}
                  onMouseLeave={() => setHoveredLink(null)}
                  style={{ 
                    fontSize: '0.875rem', 
                    fontFamily: '"Inter", -apple-system, sans-serif', 
                    fontWeight: 500, 
                    color: hoveredLink === link.name ? '#1a1a1a' : '#555555',
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                    transition: 'all 0.2s ease',
                    padding: 0,
                    position: 'relative',
                    paddingBottom: '2px'
                  }}
                >
                  {link.name}
                  {hoveredLink === link.name && (
                    <span style={{
                      position: 'absolute',
                      bottom: '-2px',
                      left: 0,
                      right: 0,
                      height: '2px',
                      backgroundColor: '#1a1a1a',
                      transition: 'all 0.2s ease'
                    }} />
                  )}
                </button>
              ))}
              
              {/* Admin Controls */}
              {isAdmin ? (
                <>
                  {/* Dashboard Button */}
                  <button
                    onClick={() => navigate('/admin/dashboard')}
                    style={{ 
                      padding: '0.7rem 1.6rem', 
                      backgroundColor: '#ffcc00', 
                      color: '#1a1a1a', 
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                      fontFamily: '"Inter", -apple-system, sans-serif',
                      transition: 'all 0.25s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f5b800';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#ffcc00';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                    }}
                  >
                    <FiSettings size={14} />
                    DASHBOARD
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    style={{ 
                      padding: '0.7rem 1.6rem', 
                      backgroundColor: '#1a1a1a', 
                      color: '#ffffff', 
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                      fontFamily: '"Inter", -apple-system, sans-serif',
                      transition: 'all 0.25s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#dc2626';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#1a1a1a';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                    }}
                  >
                    <FiLogOut size={14} />
                    LOGOUT
                  </button>
                </>
              ) : (
                <>
                  {/* Newsletter Button */}
                  <button
                    onClick={() => {
                      if (location.pathname !== '/') {
                        navigate('/');
                        setTimeout(() => scrollToSection('#newsletter'), 100);
                      } else {
                        scrollToSection('#newsletter');
                      }
                    }}
                    style={{ 
                      padding: '0.7rem 1.6rem', 
                      backgroundColor: '#1a1a1a', 
                      color: '#ffffff', 
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                      fontFamily: '"Inter", -apple-system, sans-serif',
                      transition: 'all 0.25s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#000000';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#1a1a1a';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                    }}
                  >
                    JOIN NEWSLETTER
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Overlay */}
        {windowWidth < 1024 && mobileMenuOpen && (
          <>
            {/* Overlay Background */}
            <div 
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                zIndex: 39,
                animation: 'fadeIn 0.2s ease-out'
              }}
            />
            
            {/* Menu Content */}
            <div style={{
              position: 'fixed',
              top: windowWidth < 768 ? '65px' : '80px',
              left: 0,
              right: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              padding: windowWidth < 480 ? '1.5rem 1.25rem' : '2rem 1.5rem',
              paddingBottom: '4rem',
              height: `calc(100vh - ${windowWidth < 768 ? '65px' : '80px'})`,
              maxHeight: `calc(100vh - ${windowWidth < 768 ? '65px' : '80px'})`,
              overflowY: 'auto',
              overflowX: 'hidden',
              WebkitOverflowScrolling: 'touch',
              animation: 'slideDown 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
              zIndex: 40,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -2px 20px rgba(0,0,0,0.1)'
            }}>
            {/* Mobile Navigation Links */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.15rem', 
              marginBottom: '2rem',
              flex: '0 0 auto'
            }}>
              {navLinks.map((link, index) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link)}
                  style={{
                    fontSize: windowWidth < 480 ? '1.05rem' : '1.15rem',
                    fontFamily: '"Inter", -apple-system, sans-serif',
                    fontWeight: 500,
                    color: '#1a1a1a',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: windowWidth < 480 ? '1rem 0.75rem' : '1.1rem 1rem',
                    textAlign: 'left',
                    borderBottom: index < navLinks.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                    transition: 'background-color 0.15s ease',
                    borderRadius: '6px',
                    marginBottom: '0.1rem'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {link.name}
                </button>
              ))}
            </div>

            {/* Mobile Admin/Action Buttons */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: windowWidth < 480 ? '0.8rem' : '1rem', 
              paddingTop: '1rem', 
              borderTop: '1px solid rgba(0,0,0,0.08)',
              flex: '0 0 auto'
            }}>
              {isAdmin ? (
                <>
                  <button
                    onClick={() => { navigate('/admin/dashboard'); setMobileMenuOpen(false); }}
                    style={{
                      padding: windowWidth < 480 ? '1rem' : '1.1rem',
                      backgroundColor: '#ffcc00',
                      color: '#1a1a1a',
                      fontWeight: 600,
                      fontSize: windowWidth < 480 ? '0.9rem' : '0.95rem',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                      fontFamily: '"Inter", -apple-system, sans-serif',
                      boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                      userSelect: 'none',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.97)';
                      e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.15)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.12)';
                    }}
                  >
                    <FiSettings size={16} />
                    DASHBOARD
                  </button>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    style={{
                      padding: windowWidth < 480 ? '1rem' : '1.1rem',
                      backgroundColor: '#1a1a1a',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: windowWidth < 480 ? '0.9rem' : '0.95rem',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                      fontFamily: '"Inter", -apple-system, sans-serif',
                      boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                      userSelect: 'none',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.97)';
                      e.currentTarget.style.backgroundColor = '#dc2626';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.backgroundColor = '#1a1a1a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.backgroundColor = '#1a1a1a';
                    }}
                  >
                    <FiLogOut size={16} />
                    LOGOUT
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (location.pathname !== '/') {
                      navigate('/');
                      setTimeout(() => scrollToSection('#newsletter'), 100);
                    } else {
                      scrollToSection('#newsletter');
                    }
                  }}
                  style={{
                    padding: windowWidth < 480 ? '1rem' : '1.1rem',
                    backgroundColor: '#1a1a1a',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: windowWidth < 480 ? '0.9rem' : '0.95rem',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    fontFamily: '"Inter", -apple-system, sans-serif',
                    boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.97)';
                    e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.15)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.12)';
                  }}
                >
                  JOIN NEWSLETTER
                </button>
              )}
            </div>
          </div>
          </>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div style={{ height: windowWidth < 768 ? '65px' : '80px' }} />
      
      {/* Add animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0.85;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}