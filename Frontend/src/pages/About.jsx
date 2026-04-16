import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiUsers, FiBookOpen, FiBriefcase, FiTrendingUp, FiHeart, FiPlus, FiTrash2, FiSave, FiX, FiEdit2 } from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import EditableText from '../components/EditableText';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const DEFAULT_AWARDS = [
  "Outstanding Doctoral Dissertation Award - EFMD/Emerald (2013-14)",
  "Young Scientist Award - National Academy of Sciences India & Scopus (2016)",
  "India's 25 Young HR Leaders - People Matters (2013)",
  "Emerging Psychologist - National Academy of Psychology India (2014)",
];

const DEFAULT_WORK_EXPERIENCE = [
  { period: "September 2022 – Present", role: "Professor in Organizational Behavior Area", organization: "Indian Institute of Management Ahmedabad", type: "academic" },
  { period: "May 2016 – August 2022", role: "Associate Professor in Organizational Behavior Area", organization: "Indian Institute of Management Ahmedabad", type: "academic" },
  { period: "March 2013 – May 2016", role: "Assistant Professor in Organizational Behavior Area", organization: "Indian Institute of Management Ahmedabad", type: "academic" },
  { period: "July 2012 – February 2013", role: "Assistant Professor in HRM Group", organization: "Indian Institute of Management Calcutta", type: "academic" },
  { period: "September 2005 – June 2008", role: "VLSI Design Engineer in Hardware Design Group", organization: "ST Microelectronics Pvt Ltd, Noida", type: "industry" },
  { period: "January 2005 – June 2005", role: "Student Intern in Wireline Group", organization: "Infineon Technologies AG, Munich, Germany", type: "industry" },
];

const DEFAULT_BOARD_POSITIONS = [
  { title: "Independent Director - Gujarat Industries Power Company Limited (GIPCL)", period: "Present", active: true },
  { title: "Independent Director - Gujarat Gas Limited", period: "August 2017 - August 2021", active: false },
  { title: "Board of Governors Member - IIM Ahmedabad", period: "December 2020 - February 2022", active: false },
];

const DEFAULT_MEDIA = ['Times of India', 'Economic Times', 'Business Line', 'Ahmedabad Mirror', 'Mint', 'DNA'];

export default function About() {
  const { isAdmin } = useAuth();

  // --- Edit states for each dynamic list ---
  const [editingAwardIdx, setEditingAwardIdx] = useState(null);
  const [addingAward, setAddingAward] = useState(false);
  const [draftAward, setDraftAward] = useState('');

  const [editingExpIdx, setEditingExpIdx] = useState(null);
  const [addingExp, setAddingExp] = useState(false);
  const [draftExp, setDraftExp] = useState({ period: '', role: '', organization: '', type: 'academic' });

  const [editingBoardIdx, setEditingBoardIdx] = useState(null);
  const [addingBoard, setAddingBoard] = useState(false);
  const [draftBoard, setDraftBoard] = useState({ title: '', period: '', active: false });

  const [editingMediaIdx, setEditingMediaIdx] = useState(null);
  const [addingMedia, setAddingMedia] = useState(false);
  const [draftMedia, setDraftMedia] = useState('');

  const [saving, setSaving] = useState(false);

  const defaultAboutData = {
    header: {
      title: "About",
      subtitle: "Professor of Organizational Behavior at IIM Ahmedabad — Researcher, Author, and Leadership Coach.",
    },
    hero: {
      mainHeading: "Creating Happy Leaders",
      subtitle: "Professor of Organizational Behavior at IIM Ahmedabad.",
      description: "Researcher, Author, and Leadership Coach bridging engineering precision with behavioral science.",
      linkedinUrl: "https://www.linkedin.com/in/gvishal/",
    },
    journey: {
      heading: "Bridging Engineering and Behavior",
      paragraph1: "I obtained my doctorate in Human Resource Management from the Indian Institute of Management Lucknow in 2013. I hold a Bachelor's degree in Electrical and Electronics Engineering from BITS-Pilani, Pilani Campus, India.",
      paragraph2: "Prior to joining IIMA, I worked as a Hardware Design Engineer with ST Microelectronics Pvt Ltd., Greater Noida and with Infineon Technologies AG, Munich, Germany where I was involved in the design of high-performance Application-Specific Integrated Circuits (ASICs).",
      paragraph3: "This unique blend of technical precision and behavioral insight fuels my research in leadership development, mindfulness, emotional intelligence, organization development, and R&D management."
    },
    awards: DEFAULT_AWARDS,
    workExperience: DEFAULT_WORK_EXPERIENCE,
    boardPositions: DEFAULT_BOARD_POSITIONS,
    mediaOutlets: DEFAULT_MEDIA,
  };

  const { data: aboutData, loading } = useFirestoreDoc('content', 'about', defaultAboutData);

  // --- Firestore save helper ---
  const saveField = async (field, value) => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'content', 'about'), { [field]: value }, { merge: true });
    } catch (e) {
      console.error('Save failed:', e);
      alert('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // --- Awards CRUD ---
  const awards = aboutData?.awards?.length ? aboutData.awards : DEFAULT_AWARDS;
  const commitAward = async (idx) => {
    if (!draftAward.trim()) return;
    const updated = [...awards];
    if (idx === 'new') updated.push(draftAward.trim());
    else updated[idx] = draftAward.trim();
    await saveField('awards', updated);
    setEditingAwardIdx(null); setAddingAward(false); setDraftAward('');
  };
  const deleteAward = async (idx) => {
    if (!confirm('Delete this award?')) return;
    await saveField('awards', awards.filter((_, i) => i !== idx));
  };

  // --- Work Experience CRUD ---
  const workExperience = aboutData?.workExperience?.length ? aboutData.workExperience : DEFAULT_WORK_EXPERIENCE;
  const commitExp = async (idx) => {
    if (!draftExp.role.trim()) return;
    const updated = [...workExperience];
    if (idx === 'new') updated.push({ ...draftExp });
    else updated[idx] = { ...draftExp };
    await saveField('workExperience', updated);
    setEditingExpIdx(null); setAddingExp(false);
    setDraftExp({ period: '', role: '', organization: '', type: 'academic' });
  };
  const deleteExp = async (idx) => {
    if (!confirm('Delete this experience entry?')) return;
    await saveField('workExperience', workExperience.filter((_, i) => i !== idx));
  };

  // --- Board Positions CRUD ---
  const boardPositions = aboutData?.boardPositions?.length ? aboutData.boardPositions : DEFAULT_BOARD_POSITIONS;
  const commitBoard = async (idx) => {
    if (!draftBoard.title.trim()) return;
    const updated = [...boardPositions];
    if (idx === 'new') updated.push({ ...draftBoard });
    else updated[idx] = { ...draftBoard };
    await saveField('boardPositions', updated);
    setEditingBoardIdx(null); setAddingBoard(false);
    setDraftBoard({ title: '', period: '', active: false });
  };
  const deleteBoard = async (idx) => {
    if (!confirm('Delete this board position?')) return;
    await saveField('boardPositions', boardPositions.filter((_, i) => i !== idx));
  };

  // --- Media Outlets CRUD ---
  const mediaOutlets = aboutData?.mediaOutlets?.length ? aboutData.mediaOutlets : DEFAULT_MEDIA;
  const commitMedia = async (idx) => {
    if (!draftMedia.trim()) return;
    const updated = [...mediaOutlets];
    if (idx === 'new') updated.push(draftMedia.trim());
    else updated[idx] = draftMedia.trim();
    await saveField('mediaOutlets', updated);
    setEditingMediaIdx(null); setAddingMedia(false); setDraftMedia('');
  };
  const deleteMedia = async (idx) => {
    await saveField('mediaOutlets', mediaOutlets.filter((_, i) => i !== idx));
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const viewportOptions = { once: true, margin: "0px 0px -50px 0px", amount: 0.2 };

  const achievements = [
    { icon: <FiAward />, title: "Academic Leader", desc: "President of Indian Academy of Management (2020-2022). Affiliate of Academy of Management, US." },
    { icon: <FiBriefcase />, title: "Corporate Consultant", desc: "Training leaders at NHPC, Taj Group, L&T, DRDO, and consulting for BSNL, Tilburg University, Aston Business School." },
    { icon: <FiBookOpen />, title: "Published Author", desc: "'First Among Equals' (2020) & 'Demystifying Leadership: Unveiling the Mahabharata Code' (2021)." }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Admin save indicator */}
      {isAdmin && saving && (
        <div className="fixed top-20 right-4 z-50 bg-[#004B8D] text-white px-4 py-2 rounded-lg text-sm font-['Inter'] shadow-lg animate-pulse">
          Savingâ€¦
        </div>
      )}

      {/* Page Header */}
      <section className="bg-gradient-to-br from-[#dce8f5] to-[#fff7ed] py-20 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center">
            <div className="w-20 h-1 bg-[#f97316] mb-8 rounded-full mx-auto"></div>
            <h1 className="text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6">
              <EditableText
                collection="content"
                docId="about"
                field="header.title"
                defaultValue={aboutData?.header?.title || "About"}
                className="text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
              />
            </h1>
            <p className="text-xl lg:text-2xl font-['Inter'] text-gray-600 max-w-3xl mx-auto">
              <EditableText
                collection="content"
                docId="about"
                field="header.subtitle"
                defaultValue={aboutData?.header?.subtitle || "Professor of Organizational Behavior at IIM Ahmedabad — Researcher, Author, and Leadership Coach."}
                className="text-xl lg:text-2xl font-['Inter'] text-gray-600"
                multiline
              />
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Expertise Cards */}
      <section className="py-16 px-6 lg:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements.map((item, i) => (
              <div key={i} className="border-t-4 border-[#004B8D] pt-8 space-y-4 group hover:border-[#f97316] transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-[#004B8D] to-[#003870] rounded-xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h4 className="text-sm uppercase tracking-widest font-bold text-gray-500">{item.title}</h4>
                <p className="text-lg font-['Inter'] font-medium text-gray-700 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Journey */}
      <section className="py-16 px-6 lg:px-20 bg-[#faf8f5]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
            className="text-center space-y-8">
            <h2 className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
              <EditableText collection="content" docId="about" field="journey.heading"
                defaultValue={aboutData?.journey?.heading || "Bridging Engineering and Behavior"}
                className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#1a1a1a]" />
            </h2>
            <div className="w-24 h-1 bg-[#f97316] rounded-full mx-auto"></div>
            <div className="space-y-6 text-left">
              {['paragraph1', 'paragraph2', 'paragraph3'].map((field) => (
                <p key={field} className="text-xl font-['Inter'] text-gray-700 leading-relaxed">
                  <EditableText collection="content" docId="about" field={`journey.${field}`}
                    defaultValue={aboutData?.journey?.[field] || ''}
                    className="text-xl font-['Inter'] text-gray-700 leading-relaxed" multiline />
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-16 px-6 lg:px-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}>
            <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F5C400] to-[#f5b800] rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl">
                  <FiAward />
                </div>
                <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">Awards & Recognition</h2>
              </div>
              {isAdmin && (
                <button onClick={() => { setAddingAward(true); setDraftAward(''); }}
                  className="flex items-center gap-2 bg-[#f97316] text-white px-4 py-2 rounded-lg text-sm font-['Inter'] font-semibold hover:bg-[#e06010] transition-colors shadow-md">
                  <FiPlus size={14} /> Add Award
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <AnimatePresence>
                {awards.map((award, index) => (
                  <motion.div key={index} layout
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-gradient-to-br from-[#dce8f5] to-white p-6 rounded-xl border-l-4 border-[#004B8D] shadow-md hover:shadow-xl transition-shadow relative">
                    {editingAwardIdx === index ? (
                      <div className="space-y-3">
                        <textarea value={draftAward} onChange={e => setDraftAward(e.target.value)} rows={3} autoFocus
                          className="w-full px-3 py-2 border-2 border-[#004B8D] rounded-lg font-['Inter'] text-sm focus:outline-none resize-none" />
                        <div className="flex gap-2">
                          <button onClick={() => commitAward(index)}
                            className="flex items-center gap-1 bg-[#004B8D] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#003870]">
                            <FiSave size={12} /> Save
                          </button>
                          <button onClick={() => { setEditingAwardIdx(null); setDraftAward(''); }}
                            className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-300">
                            <FiX size={12} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-['Inter'] text-gray-800 font-medium pr-16">{award}</p>
                        {isAdmin && (
                          <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingAwardIdx(index); setDraftAward(award); }}
                              className="bg-[#004B8D] text-white p-1.5 rounded hover:bg-[#003870]"><FiEdit2 size={12} /></button>
                            <button onClick={() => deleteAward(index)}
                              className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600"><FiTrash2 size={12} /></button>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                ))}
                {isAdmin && addingAward && (
                  <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-[#fff7ed] p-6 rounded-xl border-2 border-dashed border-[#f97316] shadow-md">
                    <p className="text-xs font-['Inter'] font-bold text-[#f97316] uppercase tracking-wider mb-3">New Award</p>
                    <textarea value={draftAward} onChange={e => setDraftAward(e.target.value)} rows={3} autoFocus
                      placeholder="Enter award / recognition..."
                      className="w-full px-3 py-2 border-2 border-[#f97316] rounded-lg font-['Inter'] text-sm focus:outline-none resize-none mb-3" />
                    <div className="flex gap-2">
                      <button onClick={() => commitAward('new')}
                        className="flex items-center gap-1 bg-[#f97316] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#e06010]">
                        <FiSave size={12} /> Save
                      </button>
                      <button onClick={() => { setAddingAward(false); setDraftAward(''); }}
                        className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-300">
                        <FiX size={12} /> Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Work Experience Timeline */}
      <section className="py-16 px-6 lg:px-20 bg-[#faf8f5]">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}>
            <div className="flex items-center justify-between gap-4 mb-12 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#004B8D] to-[#003870] rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl">
                  <FiTrendingUp />
                </div>
                <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">Professional Journey</h2>
              </div>
              {isAdmin && (
                <button onClick={() => { setAddingExp(true); setDraftExp({ period: '', role: '', organization: '', type: 'academic' }); }}
                  className="flex items-center gap-2 bg-[#004B8D] text-white px-4 py-2 rounded-lg text-sm font-['Inter'] font-semibold hover:bg-[#003870] transition-colors shadow-md">
                  <FiPlus size={14} /> Add Entry
                </button>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mb-8 pl-16">
              <span className="flex items-center gap-2 text-sm font-['Inter'] text-gray-500">
                <span className="w-3 h-3 rounded-full bg-[#004B8D] inline-block"></span> Academic
              </span>
              <span className="flex items-center gap-2 text-sm font-['Inter'] text-gray-500">
                <span className="w-3 h-3 rounded-full bg-[#f97316] inline-block"></span> Industry
              </span>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#004B8D] via-[#f97316] to-[#004B8D] opacity-20" />
              <div className="space-y-3">
                <AnimatePresence>
                  {workExperience.map((exp, index) => (
                    <motion.div key={index} layout
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                      className="group relative pl-16 pb-2">
                      {/* Dot */}
                      <div className={`absolute left-[18px] top-4 w-5 h-5 rounded-full border-[3px] border-white shadow-md z-10 transition-all duration-300 group-hover:scale-125 ${exp.type === 'industry' ? 'bg-[#f97316]' : 'bg-[#004B8D]'}`} />

                      {editingExpIdx === index ? (
                        <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-[#004B8D] space-y-3">
                          <input value={draftExp.period} onChange={e => setDraftExp(d => ({ ...d, period: e.target.value }))}
                            placeholder="Period (e.g. Jan 2020 – Present)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-[#004B8D]" />
                          <input value={draftExp.role} onChange={e => setDraftExp(d => ({ ...d, role: e.target.value }))}
                            placeholder="Role / Position *"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-[#004B8D]" autoFocus />
                          <input value={draftExp.organization} onChange={e => setDraftExp(d => ({ ...d, organization: e.target.value }))}
                            placeholder="Organization"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-[#004B8D]" />
                          <select value={draftExp.type} onChange={e => setDraftExp(d => ({ ...d, type: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-[#004B8D] bg-white">
                            <option value="academic">Academic</option>
                            <option value="industry">Industry</option>
                          </select>
                          <div className="flex gap-2">
                            <button onClick={() => commitExp(index)}
                              className="flex items-center gap-1 bg-[#004B8D] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#003870]">
                              <FiSave size={12} /> Save
                            </button>
                            <button onClick={() => setEditingExpIdx(null)}
                              className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-300">
                              <FiX size={12} /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <motion.div whileHover={{ x: 6 }} transition={{ duration: 0.2 }}
                          className="bg-white rounded-2xl px-5 py-4 shadow-md hover:shadow-xl transition-all border border-gray-100 hover:border-[#004B8D]/30">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`text-xs font-['Inter'] font-bold px-2.5 py-0.5 rounded-full ${exp.type === 'industry' ? 'bg-[#fff7ed] text-[#f97316] ring-1 ring-[#f97316]/30' : 'bg-[#dce8f5] text-[#004B8D] ring-1 ring-[#004B8D]/30'}`}>
                                  {exp.type === 'industry' ? 'Industry' : 'Academic'}
                                </span>
                                <span className="text-xs font-['Inter'] text-gray-400 font-medium">{exp.period}</span>
                              </div>
                              <h3 className="text-[17px] font-['Playfair_Display'] font-bold text-[#1a1a1a] leading-snug mb-0.5">{exp.role}</h3>
                              <p className="text-sm font-['Inter'] text-gray-500">{exp.organization}</p>
                            </div>
                            {isAdmin && (
                              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1">
                                <button onClick={() => { setEditingExpIdx(index); setDraftExp({ period: exp.period || '', role: exp.role || '', organization: exp.organization || '', type: exp.type || 'academic' }); }}
                                  className="bg-[#004B8D] text-white p-1.5 rounded hover:bg-[#003870]"><FiEdit2 size={12} /></button>
                                <button onClick={() => deleteExp(index)}
                                  className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600"><FiTrash2 size={12} /></button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}

                  {isAdmin && addingExp && (
                    <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      className="relative pl-16 pb-2">
                      <div className="absolute left-[18px] top-4 w-5 h-5 rounded-full bg-gray-300 border-[3px] border-white shadow-md z-10" />
                      <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-dashed border-[#004B8D] space-y-3">
                        <p className="text-xs font-['Inter'] font-bold text-[#004B8D] uppercase tracking-wider">New Entry</p>
                        <input value={draftExp.period} onChange={e => setDraftExp(d => ({ ...d, period: e.target.value }))}
                          placeholder="Period (e.g. Jan 2020 – Present)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-[#004B8D]" autoFocus />
                        <input value={draftExp.role} onChange={e => setDraftExp(d => ({ ...d, role: e.target.value }))}
                          placeholder="Role / Position *"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-[#004B8D]" />
                        <input value={draftExp.organization} onChange={e => setDraftExp(d => ({ ...d, organization: e.target.value }))}
                          placeholder="Organization"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-[#004B8D]" />
                        <select value={draftExp.type} onChange={e => setDraftExp(d => ({ ...d, type: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-['Inter'] focus:outline-none focus:border-[#004B8D] bg-white">
                          <option value="academic">Academic</option>
                          <option value="industry">Industry</option>
                        </select>
                        <div className="flex gap-2">
                          <button onClick={() => commitExp('new')}
                            className="flex items-center gap-1 bg-[#004B8D] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#003870]">
                            <FiSave size={12} /> Save
                          </button>
                          <button onClick={() => setAddingExp(false)}
                            className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-300">
                            <FiX size={12} /> Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Board Positions & Media Coverage */}
      <section className="py-16 px-6 lg:px-20 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          {/* Board Positions */}
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}>
            <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#004B8D] rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  <FiUsers />
                </div>
                <h3 className="text-3xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">Board Positions</h3>
              </div>
              {isAdmin && (
                <button onClick={() => { setAddingBoard(true); setDraftBoard({ title: '', period: '', active: false }); }}
                  className="flex items-center gap-1 bg-[#004B8D] text-white px-3 py-1.5 rounded-lg text-xs font-['Inter'] font-semibold hover:bg-[#003870]">
                  <FiPlus size={12} /> Add
                </button>
              )}
            </div>
            <div className="space-y-4">
              <AnimatePresence>
                {boardPositions.map((pos, index) => (
                  <motion.div key={index} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className={`group bg-white p-6 rounded-xl shadow-md border-l-4 ${pos.active ? 'border-[#004B8D]' : 'border-gray-200'} relative`}>
                    {editingBoardIdx === index ? (
                      <div className="space-y-2">
                        <input value={draftBoard.title} onChange={e => setDraftBoard(d => ({ ...d, title: e.target.value }))}
                          placeholder="Title / Organization *" autoFocus
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-['Inter'] focus:outline-none focus:border-[#004B8D]" />
                        <input value={draftBoard.period} onChange={e => setDraftBoard(d => ({ ...d, period: e.target.value }))}
                          placeholder="Period (e.g. Present / Aug 2017 – Aug 2021)"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-['Inter'] focus:outline-none focus:border-[#004B8D]" />
                        <label className="flex items-center gap-2 text-sm font-['Inter'] text-gray-700 cursor-pointer select-none">
                          <input type="checkbox" checked={draftBoard.active} onChange={e => setDraftBoard(d => ({ ...d, active: e.target.checked }))} />
                          Current / Active position
                        </label>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => commitBoard(index)}
                            className="flex items-center gap-1 bg-[#004B8D] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#003870]">
                            <FiSave size={12} /> Save
                          </button>
                          <button onClick={() => setEditingBoardIdx(null)}
                            className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-300">
                            <FiX size={12} /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {pos.active && (
                          <span className="inline-block mb-2 text-xs font-['Inter'] font-bold text-[#004B8D] uppercase tracking-wider bg-[#dce8f5] px-2.5 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                        <p className={`font-['Inter'] font-semibold leading-snug pr-16 ${pos.active ? 'text-[#1a1a1a]' : 'text-gray-700'}`}>{pos.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{pos.period}</p>
                        {isAdmin && (
                          <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setEditingBoardIdx(index); setDraftBoard({ title: pos.title || '', period: pos.period || '', active: !!pos.active }); }}
                              className="bg-[#004B8D] text-white p-1.5 rounded hover:bg-[#003870]"><FiEdit2 size={12} /></button>
                            <button onClick={() => deleteBoard(index)}
                              className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600"><FiTrash2 size={12} /></button>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                ))}
                {isAdmin && addingBoard && (
                  <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-[#ebf2f8] p-5 rounded-xl border-2 border-dashed border-[#004B8D] space-y-2">
                    <p className="text-xs font-['Inter'] font-bold text-[#004B8D] uppercase tracking-wider">New Position</p>
                    <input value={draftBoard.title} onChange={e => setDraftBoard(d => ({ ...d, title: e.target.value }))}
                      placeholder="Title / Organization *" autoFocus
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-['Inter'] focus:outline-none focus:border-[#004B8D]" />
                    <input value={draftBoard.period} onChange={e => setDraftBoard(d => ({ ...d, period: e.target.value }))}
                      placeholder="Period"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-['Inter'] focus:outline-none focus:border-[#004B8D]" />
                    <label className="flex items-center gap-2 text-sm font-['Inter'] text-gray-700 cursor-pointer select-none">
                      <input type="checkbox" checked={draftBoard.active} onChange={e => setDraftBoard(d => ({ ...d, active: e.target.checked }))} />
                      Current / Active position
                    </label>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => commitBoard('new')}
                        className="flex items-center gap-1 bg-[#004B8D] text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-[#003870]">
                        <FiSave size={12} /> Save
                      </button>
                      <button onClick={() => setAddingBoard(false)}
                        className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-300">
                        <FiX size={12} /> Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Media Coverage */}
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}>
            <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#f97316] rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                  <FiHeart />
                </div>
                <h3 className="text-3xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">Media Coverage</h3>
              </div>
              {isAdmin && (
                <button onClick={() => { setAddingMedia(true); setDraftMedia(''); }}
                  className="flex items-center gap-1 bg-[#f97316] text-white px-3 py-1.5 rounded-lg text-xs font-['Inter'] font-semibold hover:bg-[#e06010]">
                  <FiPlus size={12} /> Add
                </button>
              )}
            </div>
            <p className="text-lg font-['Inter'] text-gray-700 mb-6 leading-relaxed">
              My research has been published in prestigious international journals and featured in major media outlets:
            </p>
            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {mediaOutlets.map((media, index) => (
                  <motion.div key={index} layout
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                    className="group relative">
                    {editingMediaIdx === index ? (
                      <div className="flex items-center gap-1">
                        <input value={draftMedia} onChange={e => setDraftMedia(e.target.value)} autoFocus
                          className="w-32 px-2 py-1.5 border-2 border-[#004B8D] rounded-full text-sm font-['Inter'] focus:outline-none"
                          onKeyDown={e => { if (e.key === 'Enter') commitMedia(index); if (e.key === 'Escape') setEditingMediaIdx(null); }} />
                        <button onClick={() => commitMedia(index)} className="bg-[#004B8D] text-white p-1.5 rounded-full"><FiSave size={11} /></button>
                        <button onClick={() => setEditingMediaIdx(null)} className="bg-gray-200 text-gray-600 p-1.5 rounded-full"><FiX size={11} /></button>
                      </div>
                    ) : (
                      <span className="bg-white px-4 py-2 rounded-full text-sm font-['Inter'] font-semibold text-[#004B8D] shadow-md border border-[#004B8D]/30 hover:border-[#004B8D] transition-colors inline-flex items-center gap-1.5">
                        {media}
                        {isAdmin && (
                          <span className="inline-flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5">
                            <button onClick={() => { setEditingMediaIdx(index); setDraftMedia(media); }}
                              className="text-[#004B8D] hover:text-[#003870]"><FiEdit2 size={10} /></button>
                            <button onClick={() => deleteMedia(index)}
                              className="text-red-400 hover:text-red-600"><FiTrash2 size={10} /></button>
                          </span>
                        )}
                      </span>
                    )}
                  </motion.div>
                ))}
                {isAdmin && addingMedia && (
                  <motion.div layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1">
                    <input value={draftMedia} onChange={e => setDraftMedia(e.target.value)} placeholder="Outlet nameâ€¦" autoFocus
                      className="w-32 px-2 py-1.5 border-2 border-[#f97316] rounded-full text-sm font-['Inter'] focus:outline-none"
                      onKeyDown={e => { if (e.key === 'Enter') commitMedia('new'); if (e.key === 'Escape') setAddingMedia(false); }} />
                    <button onClick={() => commitMedia('new')} className="bg-[#f97316] text-white p-1.5 rounded-full"><FiSave size={11} /></button>
                    <button onClick={() => setAddingMedia(false)} className="bg-gray-200 text-gray-600 p-1.5 rounded-full"><FiX size={11} /></button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-lg font-['Inter'] text-gray-700 mt-8 leading-relaxed">
              Academic publications in <span className="font-semibold">Academy of Management Journal</span>, <span className="font-semibold">Human Resource Management</span>, <span className="font-semibold">Personnel Review</span>, and more.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

