import { motion } from 'framer-motion';
import { FiExternalLink, FiCalendar, FiClock, FiMapPin, FiTarget, FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { FaBold, FaItalic } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import EditableText from '../components/EditableText';
import { useState, useRef } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

/* ─── Font Injection (Matching Books Page) ───────────────────────────── */
if (typeof document !== 'undefined') {
  const _trainingsLink = document.createElement('link');
  _trainingsLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap';
  _trainingsLink.rel = 'stylesheet';
  document.head.appendChild(_trainingsLink);
}

export default function Trainings() {
  const { isAdmin } = useAuth() || {};
  const { data: pageData } = useFirestoreDoc('content', 'trainings', {
    page_heading: 'Executive Training Programs',
    page_description: 'Transform your leadership journey with world-class executive education programs from IIM Ahmedabad',
  });

  const { data: programs, loading } = useFirestoreCollection('training_programs', [], true);
  const [editingProgram, setEditingProgram] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleUpdateProgram = async (id, updatedData) => {
    const docRef = doc(db, 'training_programs', id);
    await updateDoc(docRef, updatedData);
    setEditingProgram(null);
  };

  const handleDeleteProgram = async (id) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      const docRef = doc(db, 'training_programs', id);
      await deleteDoc(docRef);
    }
  };

  const handleAddProgram = async (newData) => {
    // set an `order` timestamp so we can control ordering (newer => higher order)
    const dataWithOrder = { ...newData, order: Date.now() };
    await addDoc(collection(db, 'training_programs'), dataWithOrder);
    setShowAddForm(false);
  };

  // Reorder handlers: swap `order` values between adjacent program docs
  const reorderPrograms = async (newOrderArray) => {
    // newOrderArray: array of program objects in desired order (first = highest)
    try {
      // assign descending integer order values starting from length
      const n = newOrderArray.length;
      const updates = newOrderArray.map((p, i) => ({ id: p.id, order: n - i }));
      // perform updates sequentially
      for (const u of updates) {
        const docRef = doc(db, 'training_programs', u.id);
        await updateDoc(docRef, { order: u.order });
      }
    } catch (err) {
      console.error('Error reordering programs', err);
      alert('Failed to reorder programs');
    }
  };

  const moveUpProgram = async (index) => {
    const sorted = (programs || []).slice().sort((a, b) => (b.order || 0) - (a.order || 0));
    if (index <= 0 || index >= sorted.length) return;
    const newSorted = sorted.slice();
    // swap with previous
    [newSorted[index - 1], newSorted[index]] = [newSorted[index], newSorted[index - 1]];
    // write new order values for all
    await reorderPrograms(newSorted);
  };

  const moveDownProgram = async (index) => {
    const sorted = (programs || []).slice().sort((a, b) => (b.order || 0) - (a.order || 0));
    if (index < 0 || index >= sorted.length - 1) return;
    const newSorted = sorted.slice();
    // swap with next
    [newSorted[index], newSorted[index + 1]] = [newSorted[index + 1], newSorted[index]];
    await reorderPrograms(newSorted);
  };

  const AddEditForm = ({ program, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
      program || {
        title: '',
        fullTitle: '',
        description: '',
        duration: '',
        format: '',
        location: '',
        applyLink: '',
        highlights: [],
        color: 'from-[#004B8D] to-[#003870]',
      }
    );
    const titleRef = useRef(null);
    const fullTitleRef = useRef(null);
    const descRef = useRef(null);
    const highlightsRef = useRef(null);

    // Helper to toggle wrapping selection with markers (e.g., **bold**, *italic*)
    const toggleWrapSelection = (ref, markerStart, markerEnd) => {
      const el = ref?.current;
      if (!el) return;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;
      // use the live element value to avoid mismatch with arrays (highlights)
      const raw = el.value ?? '';
      const before = raw.slice(0, start);
      const selected = raw.slice(start, end) || '';
      const after = raw.slice(end);
      const open = markerStart;
      const close = markerEnd ?? markerStart;
      const wrappedRegex = new RegExp(`^${escapeRegExp(open)}([\s\S]*?)${escapeRegExp(close)}$`);
      const isWrapped = wrappedRegex.test(selected);
      const newSelected = isWrapped ? selected.replace(wrappedRegex, '$1') : `${open}${selected || (open === '**' ? 'bold text' : 'italic text')}${close}`;
      const newValue = before + newSelected + after;

      // If this is the highlights field, keep it as array in state
      if (el.name === 'highlights') {
        setFormData((prev) => ({ ...prev, highlights: newValue.split('\n') }));
      } else {
        setFormData((prev) => ({ ...prev, [el.name]: newValue }));
      }

      // restore focus and selection
      setTimeout(() => {
        el.focus();
        if (selected === '') {
          const pos = start + (isWrapped ? 0 : open.length);
          el.setSelectionRange(pos, pos + newSelected.length);
        } else {
          el.setSelectionRange(start, start + newSelected.length);
        }
      }, 0);
    };

    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleHighlightsChange = (e) => {
      setFormData((prev) => ({ ...prev, highlights: e.target.value.split('\n') }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-100 p-6 rounded-lg mb-8"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute right-2 top-2 flex gap-2">
                <button type="button" title="Bold" onClick={() => toggleWrapSelection(titleRef, '**')} className="p-1 rounded border bg-white text-gray-700 hover:bg-gray-50"><FaBold /></button>
                <button type="button" title="Italic" onClick={() => toggleWrapSelection(titleRef, '*')} className="p-1 rounded border bg-white text-gray-700 hover:bg-gray-50"><FaItalic /></button>
              </div>
              <input ref={titleRef} name="title" value={formData.title} onChange={handleChange} placeholder="Title (e.g., LEAP-EMB)" className="p-2 border rounded" />
            </div>

            <div className="relative">
              <div className="absolute right-2 top-2 flex gap-2">
                <button type="button" title="Bold" onClick={() => toggleWrapSelection(fullTitleRef, '**')} className="p-1 rounded border bg-white text-gray-700 hover:bg-gray-50"><FaBold /></button>
                <button type="button" title="Italic" onClick={() => toggleWrapSelection(fullTitleRef, '*')} className="p-1 rounded border bg-white text-gray-700 hover:bg-gray-50"><FaItalic /></button>
              </div>
              <input ref={fullTitleRef} name="fullTitle" value={formData.fullTitle} onChange={handleChange} placeholder="Full Title" className="p-2 border rounded" />
            </div>

            <input name="duration" value={formData.duration} onChange={handleChange} placeholder="Duration" className="p-2 border rounded" />
            <input name="format" value={formData.format} onChange={handleChange} placeholder="Format" className="p-2 border rounded" />
            <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="p-2 border rounded" />
            <input name="applyLink" value={formData.applyLink} onChange={handleChange} placeholder="Apply Link" className="p-2 border rounded" />
            <input name="color" value={formData.color} onChange={handleChange} placeholder="Gradient Color (e.g., from-blue-500 to-blue-700)" className="p-2 border rounded" />
          </div>
          <div className="relative mt-4">
            <div className="absolute right-2 top-2 flex gap-2 z-10">
              <button type="button" title="Bold" onClick={() => toggleWrapSelection(descRef, '**')} className="p-1 rounded border bg-white text-gray-700 hover:bg-gray-50"><FaBold /></button>
              <button type="button" title="Italic" onClick={() => toggleWrapSelection(descRef, '*')} className="p-1 rounded border bg-white text-gray-700 hover:bg-gray-50"><FaItalic /></button>
            </div>
            <textarea
              ref={descRef}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full p-2 border rounded mt-4"
              rows="3"
            />
          </div>
          <div className="relative mt-4">
            <div className="absolute right-2 top-2 flex gap-2 z-10">
              <button type="button" title="Bold" onClick={() => toggleWrapSelection(highlightsRef, '**')} className="p-1 rounded border bg-white text-gray-700 hover:bg-gray-50"><FaBold /></button>
              <button type="button" title="Italic" onClick={() => toggleWrapSelection(highlightsRef, '*')} className="p-1 rounded border bg-white text-gray-700 hover:bg-gray-50"><FaItalic /></button>
            </div>
            <textarea
              ref={highlightsRef}
              name="highlights"
              value={formData.highlights.join('\n')}
              onChange={handleHighlightsChange}
              placeholder="Key Highlights (one per line)"
              className="w-full p-2 border rounded mt-4"
              rows="5"
            />
          </div>
          <div className="flex justify-end gap-4 mt-4">
            <button type="button" onClick={onCancel} className="flex items-center gap-2 px-4 py-2 bg-gray-300 rounded-lg">
              <FiX /> Cancel
            </button>
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg">
              <FiSave /> Save
            </button>
          </div>
        </form>
      </motion.div>
    );
  };

  const sortedPrograms = (programs || []).slice().sort((a, b) => (b.order || 0) - (a.order || 0));

  // Small markdown renderer used for program titles/descriptions to support **bold** and *italic*
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const renderMarkdown = (text, isMultiline = false) => {
    if (!text) return '';
    let html = escapeHtml(text);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    if (isMultiline) html = html.replace(/\r?\n/g, '<br/>');
    return html;
  };

  return (
    <div className="bg-white">
      {/* Header Section */}
      <section className="bg-linear-to-br from-[#dce8f5] to-[#fff7ed] py-20 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0.85, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center"
          >
            <div className="w-20 h-1 bg-[#FFCC00] mb-8 rounded-full mx-auto"></div>
            <div className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6" role="heading" aria-level={1}>
              <EditableText
                collection="content"
                docId="trainings"
                field="page_heading"
                defaultValue={pageData?.page_heading || 'Executive Training Programs'}
                className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
              />
            </div>
            <div className="text-xl lg:text-2xl text-[#004B8D] font-['Inter'] max-w-3xl mx-auto">
              <EditableText
                collection="content"
                docId="trainings"
                field="page_subtitle"
                className="text-xl lg:text-2xl text-[#004B8D] font-['Inter']"
              />
            </div>
            <div className="text-lg text-gray-600 font-['Inter'] max-w-4xl mx-auto mt-6">
              <EditableText
                collection="content"
                docId="trainings"
                field="page_description"
                defaultValue={pageData?.page_description || 'Transform your leadership journey with world-class executive education programs from IIM Ahmedabad'}
                className="text-lg text-gray-600 font-['Inter']"
                multiline
              />
            </div>
          </motion.div>

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
              }}>{(programs || []).length || 5}</strong>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '.72rem',
                fontWeight: 500,
                color: '#9ca3af',
                letterSpacing: '.09em',
                textTransform: 'uppercase',
                marginTop: '2px'
              }}>Active Programs</span>
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
              }}>1,000</strong>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '.72rem',
                fontWeight: 500,
                color: '#9ca3af',
                letterSpacing: '.09em',
                textTransform: 'uppercase',
                marginTop: '2px'
              }}>Alumni Trained</span>
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
              }}>4.8/5</strong>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '.72rem',
                fontWeight: 500,
                color: '#9ca3af',
                letterSpacing: '.09em',
                textTransform: 'uppercase',
                marginTop: '2px'
              }}>Average Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 px-6 lg:px-16 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto">
          {isAdmin && (
            <div className="text-center mb-12">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-all"
                >
                  <FiPlus /> Add New Program
                </button>
              ) : (
                <AddEditForm
                  onSave={handleAddProgram}
                  onCancel={() => setShowAddForm(false)}
                />
              )}
            </div>
          )}
          <div className="space-y-16">
            {loading && <p>Loading programs...</p>}
            {sortedPrograms.map((program, index) => {
              const isEven = index % 2 === 0;
              const headerBg = isEven ? 'bg-[#004B8D]' : 'bg-[#FFCC00]';
              const buttonGradient = isEven
                ? 'bg-linear-to-r from-[#004B8D] to-[#003870] hover:from-[#003870] hover:to-[#002a5a]'
                : 'bg-linear-to-r from-[#FFCC00] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c]';

                return (
              <div key={program.id}>
                {editingProgram?.id === program.id ? (
                  <AddEditForm
                    program={editingProgram}
                    onSave={(updatedData) => handleUpdateProgram(program.id, updatedData)}
                    onCancel={() => setEditingProgram(null)}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0.85, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#fff3e6]'} rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100 hover:shadow-2xl transition-shadow duration-300 relative`}
                  >
                    {isAdmin && (
                      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                        <button
                          onClick={() => moveUpProgram(index)}
                          className="p-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50"
                          title="Move up"
                        >
                          <FiArrowUp />
                        </button>
                        <button
                          onClick={() => moveDownProgram(index)}
                          className="p-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50"
                          title="Move down"
                        >
                          <FiArrowDown />
                        </button>
                        <button
                          onClick={() => setEditingProgram(program)}
                          className="p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
                          title="Edit"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDeleteProgram(program.id)}
                          className="p-2 bg-white text-red-500 border border-red-200 rounded-lg shadow hover:bg-red-50"
                          title="Delete"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    )}
                    {/* Program Header */}
                    <div className={`p-8 ${headerBg}`}> 
                      <h2 className="text-4xl font-['Playfair_Display'] font-bold mb-2 text-white" style={{ color: '#ffffff' }}>
                        <span dangerouslySetInnerHTML={{ __html: renderMarkdown(program.title) }} />
                      </h2>
                      <p className="text-lg opacity-90 font-['Inter'] text-white" style={{ color: '#ffffff' }}>
                        <span dangerouslySetInnerHTML={{ __html: renderMarkdown(program.fullTitle) }} />
                      </p>
                    </div>

                    {/* Program Content */}
                    <div className="p-8 lg:p-12">
                      <div className="grid lg:grid-cols-2 gap-8 mb-8">
                        {/* Left Column - Description */}
                        <div>
                          <p className="text-gray-700 text-lg leading-relaxed mb-6 font-['Inter']">
                            <span dangerouslySetInnerHTML={{ __html: renderMarkdown(program.description, true) }} />
                          </p>

                          {/* Program Details */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-700">
                              <FiClock className="text-[#FFCC00] text-xl" />
                              <span className="font-['Inter']"><strong>Duration:</strong> {program.duration}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                              <FiCalendar className="text-[#FFCC00] text-xl" />
                              <span className="font-['Inter']"><strong>Format:</strong> {program.format}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                              <FiMapPin className="text-[#FFCC00] text-xl" />
                              <span className="font-['Inter']"><strong>Location:</strong> {program.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Column - Highlights */}
                        <div>
                          <h3 className="text-2xl font-['Playfair_Display'] font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FiTarget className="text-[#FFCC00]" />
                            Key Highlights
                          </h3>
                          <ul className="space-y-3">
                            {program.highlights && program.highlights.map((highlight, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span className="text-[#FFCC00] text-xl mt-1">•</span>
                                <span className="text-gray-700 font-['Inter']">{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Apply Button */}
                      <div className="flex justify-center pt-6 border-t-2 border-gray-100">
                        <a
                          href={program.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-3 px-8 py-4 ${buttonGradient} text-white font-['Inter'] font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105`}
                        >
                          Apply Now
                          <FiExternalLink className="text-xl" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-linear-to-br from-[#004B8D] to-[#003870] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-['Playfair_Display'] font-bold mb-4 text-white">
            <EditableText
              collection="content"
              docId="trainings"
              field="cta_heading"
              defaultValue={pageData?.cta_heading || 'Ready to Transform Your Leadership?'}
              className="text-3xl lg:text-4xl font-['Playfair_Display'] font-bold mb-4 text-white"
            />
          </h2>
          <p className="text-lg font-['Inter'] mb-8 opacity-90 text-white">
            <EditableText
              collection="content"
              docId="trainings"
              field="cta_description"
              defaultValue={pageData?.cta_description || 'Join thousands of executives who have enhanced their leadership capabilities through our programs'}
              className="text-lg font-['Inter'] mb-8 opacity-90 text-white"
              multiline
            />
          </p>

          <div className="relative inline-block">
            <a
              href="/#newsletter"
              className="inline-block px-8 py-4 bg-white text-[#004B8D] font-['Inter'] font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300"
            >
              <span className="text-sm font-['Inter'] font-semibold text-[#004B8D]">
                {!isAdmin ? (pageData?.cta_button_text || 'Join Newsletter') : <span className="opacity-0">{pageData?.cta_button_text || 'Join Newsletter'}</span>}
              </span>
            </a>

            {/* Editable overlay placed outside the interactive anchor to avoid nested interactive elements */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center justify-center w-full pointer-events-auto">
                <EditableText
                  collection="content"
                  docId="trainings"
                  field="cta_button_text"
                  defaultValue={pageData?.cta_button_text || 'Join Newsletter'}
                  className="w-full inline-block text-sm font-['Inter'] font-semibold text-[#004B8D] text-center px-2"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
