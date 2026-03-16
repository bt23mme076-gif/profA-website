import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FiLogOut, FiSettings, FiMenu, FiX, FiEdit2, FiCheck, FiMoreVertical } from 'react-icons/fi';

// Default navbar content (fallback when Firestore has no data yet)
const DEFAULT_NAV_LINKS = [
  { id: 'research', name: 'Research', path: '/research' },
  { id: 'books', name: 'Books', path: '/book' },
  { id: 'consulting', name: 'Consulting', path: '/about' },
  { id: 'recognitions', name: 'Recognitions', path: '/about' },
  { id: 'opinions', name: 'Blogs', path: '/blog' },
  { id: 'courses', name: 'Courses', path: '/courses' },
  { id: 'contact', name: 'Contact', hash: '#contact' },
];

export default function Navbar() {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAdmin, logout } = useAuth();

  const isHomePage = location.pathname === '/';
  const showDark = isHomePage && !scrolled;

  // --- Editable navbar state ---
  const [navLinks, setNavLinks] = useState(DEFAULT_NAV_LINKS);
  const [professorName, setProfessorName] = useState('PROF. VISHAL GUPTA');
  const [subtitle, setSubtitle] = useState('IIM Ahmedabad');
  const [isSaving, setIsSaving] = useState(false);

  // Inline edit state
  const [editingField, setEditingField] = useState(null); // 'name' | 'subtitle' | linkId
  const [editValue, setEditValue] = useState('');
  // Drag state for nav links
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // --- Load from Firestore ---
  useEffect(() => {
    const loadNavbarContent = async () => {
      try {
        const docRef = doc(db, 'content', 'navbar');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.professorName) setProfessorName(data.professorName);
          if (data.subtitle) setSubtitle(data.subtitle);
          if (data.navLinks && Array.isArray(data.navLinks)) {
            let needsUpdate = false;
            const patchedLinks = data.navLinks.map(l => {
              // Ensure Opinions/Blogs link goes to /blog
              // Also ensure we handle cases where name might have been edited but ID remains
              if (l.id === 'opinions' && (l.path !== '/blog')) {
                needsUpdate = true;
                return { ...l, path: '/blog', hash: undefined };
              }
              return l;
            });
            setNavLinks(patchedLinks);
            
            // If migration applied, update Firestore immediately to persist the fix
            if (needsUpdate) {
              setDoc(docRef, { navLinks: patchedLinks }, { merge: true }).catch(err => 
                console.error('Failed to auto-migrate navbar links:', err)
              );
            }
          }
        }
      } catch (err) {
        console.error('Could not load navbar content:', err);
      }
    };
    loadNavbarContent();
  }, []);

  // --- Save to Firestore ---
  const saveNavbarContent = async (updates) => {
    setIsSaving(true);
    try {
      const docRef = doc(db, 'content', 'navbar');
      await setDoc(docRef, updates, { merge: true });
    } catch (err) {
      console.error('Failed to save navbar content:', err);
      alert('Save failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Inline edit helpers ---
  const startEdit = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const commitEdit = async () => {
    if (!editingField || editValue.trim() === '') { setEditingField(null); return; }
    if (editingField === 'name') {
      setProfessorName(editValue.trim());
      await saveNavbarContent({ professorName: editValue.trim() });
    } else if (editingField === 'subtitle') {
      setSubtitle(editValue.trim());
      await saveNavbarContent({ subtitle: editValue.trim() });
    } else {
      // editing a nav link label
      const updated = navLinks.map(l => l.id === editingField ? { ...l, name: editValue.trim() } : l);
      setNavLinks(updated);
      await saveNavbarContent({ navLinks: updated });
    }
    setEditingField(null);
  };

  const cancelEdit = () => {
    setEditingField(null);
  };

  // --- Drag to reorder nav links ---
  const onDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const onDrop = async (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) { setDragIndex(null); setDragOverIndex(null); return; }
    const reordered = [...navLinks];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    setNavLinks(reordered);
    setDragIndex(null);
    setDragOverIndex(null);
    await saveNavbarContent({ navLinks: reordered });
  };

  const onDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // --- Scroll detection ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Window resize ---
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

  // After navigating home with a pending hash, scroll once the section is in the DOM
  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      const hash = location.state.scrollTo;
      // Poll until the element exists (page may still be rendering)
      let attempts = 0;
      const interval = setInterval(() => {
        const el = document.querySelector(hash);
        if (el) {
          clearInterval(interval);
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Clear the state so a page refresh doesn't re-scroll
          navigate('/', { replace: true, state: {} });
        } else if (++attempts > 20) {
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [location]);

  const handleNavClick = (link) => {
    setMobileMenuOpen(false); // Close mobile menu on nav click
    
    // Explicit override for Blogs/Opinions to ensure correct routing
    if (link.id === 'opinions' || link.name === 'Blogs' || link.name === 'Opinions') {
      navigate('/blog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (link.path) {
      // Navigate to a different page
      navigate(link.path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link.hash) {
      // Scroll to section on current page or navigate home first
      if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: link.hash } });
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
        background: showDark ? 'linear-gradient(135deg, #1a2d52 0%, #1e3461 40%, #162647 100%)' : '#ffffff',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: showDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: showDark ? '0 2px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.08)',
        transition: 'background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease'
      }}>
        {/* Admin edit mode banner */}
        {isAdmin && (
          <div style={{
            background: 'linear-gradient(90deg, #ffcc00, #ffe066)',
            color: '#1a1a1a',
            fontSize: '0.68rem',
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textAlign: 'center',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <FiEdit2 size={11} />
            ADMIN EDIT MODE — click ✏ to edit text · drag ⠿ to reorder links
            {isSaving && <span style={{ opacity: 0.7 }}>· saving…</span>}
          </div>
        )}
        <div style={{ 
          width: '100%',
          maxWidth: '100vw',
          padding: windowWidth < 768 ? '0 1rem' : '0 4rem', 
          height: windowWidth < 768 ? '65px' : '80px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }}>
          {/* Brand Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>

            {/* Gold accent bar */}
            <div
              onClick={() => { navigate('/'); scrollToSection(null); setMobileMenuOpen(false); }}
              style={{
                width: '4px',
                height: windowWidth < 768 ? '36px' : '46px',
                background: 'linear-gradient(to bottom, #F5C400, #e09800)',
                borderRadius: '2px',
                flexShrink: 0,
                cursor: 'pointer'
              }}
            />

            {/* Text section - plain div, no Link, so edit inputs work perfectly */}
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              {/* Professor Name */}
              {isAdmin && editingField === 'name' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    autoFocus
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                    style={{
                      fontSize: windowWidth < 768 ? '0.9rem' : '1.2rem',
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontWeight: 700,
                      border: '2px solid #ffcc00',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      width: '180px',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={commitEdit}
                    style={{ background: '#ffcc00', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  ><FiCheck size={12} /></button>
                  <button
                    onClick={cancelEdit}
                    style={{ background: '#eee', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  ><FiX size={12} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <h1
                    onClick={() => {
                      navigate('/');
                      scrollToSection(null);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      fontSize: windowWidth < 480 ? '0.95rem' : windowWidth < 768 ? '1.1rem' : '1.65rem',
                      fontFamily: '"Playfair Display", "Georgia", serif',
                      fontWeight: 700,
                      color: showDark ? '#ffffff' : '#1a1a1a',
                      letterSpacing: windowWidth < 480 ? '0' : '0.02em',
                      margin: 0, lineHeight: 1.2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      cursor: 'pointer',
                      transition: 'color 0.3s ease'
                    }}
                  >
                    {professorName.startsWith('PROF. ')
                      ? <><span style={{ fontSize: '0.57em', letterSpacing: '0.14em', color: showDark ? '#F5C400' : '#b8800a', fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>PROF.</span>{' '}{professorName.slice(6)}</>
                      : professorName}
                  </h1>
                  {isAdmin && (
                    <button
                      onClick={() => startEdit('name', professorName)}
                      title="Edit name"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#aaa', display: 'flex', flexShrink: 0 }}
                    ><FiEdit2 size={11} /></button>
                  )}
                </div>
              )}

              {/* Subtitle */}
              {windowWidth >= 480 && (
                isAdmin && editingField === 'subtitle' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                    <input
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                      style={{
                        fontSize: '0.65rem',
                        fontFamily: '"Inter", sans-serif',
                        border: '2px solid #ffcc00',
                        borderRadius: '4px',
                        padding: '1px 4px',
                        width: '140px',
                        outline: 'none',
                        letterSpacing: '0.1em'
                      }}
                    />
                    <button
                      onClick={commitEdit}
                      style={{ background: '#ffcc00', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    ><FiCheck size={10} /></button>
                    <button
                      onClick={cancelEdit}
                      style={{ background: '#eee', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    ><FiX size={10} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                    <p style={{
                      fontSize: windowWidth < 768 ? '0.65rem' : '0.7rem',
                      fontFamily: '"Inter", -apple-system, sans-serif',
                      color: showDark ? 'rgba(255,255,255,0.45)' : '#888888',
                      margin: 0,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      fontWeight: 500,
                      transition: 'color 0.3s ease'
                    }}>
                      {subtitle}
                    </p>
                    {isAdmin && (
                      <button
                        onClick={() => startEdit('subtitle', subtitle)}
                        title="Edit subtitle"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', color: '#bbb', display: 'flex', flexShrink: 0 }}
                      ><FiEdit2 size={9} /></button>
                    )}
                  </div>
                )
              )}
            </div>
          </div>

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
                color: showDark ? '#ffffff' : '#1a1a1a',
                zIndex: 60,
                marginLeft: '0.5rem',
                transition: 'transform 0.2s ease, color 0.3s ease'
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
              {navLinks.map((link, index) => (
                <div
                  key={link.id || link.name}
                  draggable={isAdmin}
                  onDragStart={isAdmin ? (e) => onDragStart(e, index) : undefined}
                  onDragOver={isAdmin ? (e) => onDragOver(e, index) : undefined}
                  onDrop={isAdmin ? (e) => onDrop(e, index) : undefined}
                  onDragEnd={isAdmin ? onDragEnd : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '3px',
                    opacity: dragIndex === index ? 0.4 : 1,
                    outline: dragOverIndex === index && dragIndex !== index ? '2px dashed #ffcc00' : 'none',
                    borderRadius: '4px',
                    transition: 'opacity 0.2s'
                  }}
                >
                  {/* Drag handle - admin only */}
                  {isAdmin && (
                    <span title="Drag to reorder" style={{ cursor: 'grab', color: '#ccc', display: 'flex', padding: '0 1px' }}>
                      <FiMoreVertical size={13} />
                    </span>
                  )}

                  {/* Editable label or button */}
                  {isAdmin && editingField === (link.id || link.name) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <input
                        autoFocus
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                        style={{ fontSize: '0.8rem', border: '2px solid #ffcc00', borderRadius: '4px', padding: '2px 5px', width: '100px', outline: 'none' }}
                      />
                      <button onClick={commitEdit} style={{ background: '#ffcc00', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiCheck size={10} /></button>
                      <button onClick={cancelEdit} style={{ background: '#eee', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={10} /></button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <button
                        onClick={() => handleNavClick(link)}
                        onMouseEnter={() => setHoveredLink(link.name)}
                        onMouseLeave={() => setHoveredLink(null)}
                        style={{ 
                          fontSize: '0.875rem', 
                          fontFamily: '"Inter", -apple-system, sans-serif', 
                          fontWeight: 500, 
                          color: showDark
                            ? (hoveredLink === link.name ? '#F5C400' : 'rgba(255,255,255,0.8)')
                            : (hoveredLink === link.name ? '#1a1a1a' : '#555555'),
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
                            backgroundColor: showDark ? '#F5C400' : '#1a1a1a',
                            transition: 'all 0.2s ease'
                          }} />
                        )}
                      </button>
                      {/* Edit label button - admin only */}
                      {isAdmin && (
                        <button
                          onClick={() => startEdit(link.id || link.name, link.name)}
                          title="Edit label"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1px', color: '#ccc', display: 'flex' }}
                        >
                          <FiEdit2 size={10} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
                  {/* IIMA Profile Button */}
                  <button
                    onClick={() => {
                      if (location.pathname !== '/') {
                        navigate('/', { state: { scrollTo: '#newsletter' } });
                      } else {
                        scrollToSection('#newsletter');
                      }
                    }}
                    style={{ 
                      padding: '0.7rem 1.6rem', 
                      backgroundColor: '#F5C400', 
                      color: '#0B1628', 
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      letterSpacing: '0.04em',
                      fontFamily: '"Inter", -apple-system, sans-serif',
                      transition: 'all 0.25s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      textDecoration: 'none',
                      display: 'inline-block'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#004B8D';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F5C400';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                    }}
                  >
                    Join Newsletter
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
                top: windowWidth < 768 ? '65px' : '80px',
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
                <div
                  key={link.id || link.name}
                  draggable={isAdmin}
                  onDragStart={isAdmin ? (e) => onDragStart(e, index) : undefined}
                  onDragOver={isAdmin ? (e) => onDragOver(e, index) : undefined}
                  onDrop={isAdmin ? (e) => onDrop(e, index) : undefined}
                  onDragEnd={isAdmin ? onDragEnd : undefined}
                  style={{
                    opacity: dragIndex === index ? 0.35 : 1,
                    outline: dragOverIndex === index && dragIndex !== index ? '2px dashed #ffcc00' : 'none',
                    borderRadius: '6px',
                    transition: 'opacity 0.2s',
                    borderBottom: index < navLinks.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  {isAdmin && editingField === (link.id || link.name) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.8rem 0.75rem' }}>
                      <FiMoreVertical size={14} style={{ color: '#ccc', cursor: 'grab', flexShrink: 0 }} />
                      <input
                        autoFocus
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
                        style={{ flex: 1, fontSize: '0.95rem', border: '2px solid #ffcc00', borderRadius: '6px', padding: '4px 8px', outline: 'none' }}
                      />
                      <button onClick={commitEdit} style={{ background: '#ffcc00', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiCheck size={12} /></button>
                      <button onClick={cancelEdit} style={{ background: '#eee', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FiX size={12} /></button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {isAdmin && (
                        <span title="Drag to reorder" style={{ cursor: 'grab', color: '#ccc', padding: '1rem 0.5rem 1rem 0.75rem', display: 'flex', flexShrink: 0 }}>
                          <FiMoreVertical size={15} />
                        </span>
                      )}
                      <button
                        onClick={() => handleNavClick(link)}
                        style={{
                          flex: 1,
                          fontSize: windowWidth < 480 ? '1.05rem' : '1.15rem',
                          fontFamily: '"Inter", -apple-system, sans-serif',
                          fontWeight: 500,
                          color: '#1a1a1a',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: windowWidth < 480 ? '1rem 0.75rem' : '1.1rem 1rem',
                          textAlign: 'left',
                          borderRadius: '6px',
                        }}
                        onMouseDown={(e) => { e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)'; }}
                        onMouseUp={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        {link.name}
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => startEdit(link.id || link.name, link.name)}
                          title="Edit label"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem', color: '#bbb', flexShrink: 0, display: 'flex' }}
                        >
                          <FiEdit2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
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
                      navigate('/', { state: { scrollTo: '#newsletter' } });
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
      <div style={{ height: windowWidth < 768 ? (isAdmin ? '93px' : '65px') : (isAdmin ? '108px' : '80px') }} />
      
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
