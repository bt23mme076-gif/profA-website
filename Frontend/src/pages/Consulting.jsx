import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  FiExternalLink, FiBriefcase, FiAward, FiUsers, FiBook,
  FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import EditableText from '../components/EditableText';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

/* ─── Font Injection ─────────────────────────────────────────────────── */
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

/* ─── Static Data ────────────────────────────────────────────────────── */
const STATIC_ASSIGNMENTS = [
  {
    id: 's1',
    year: 'July 2023 – March 2024',
    org: 'SkillsEdge',
    role: 'Mentor and Chief Faculty',
    description: 'Worked with SkillsEdge, a faculty development platform, in helping them plan their content and outreach for faculty and students.',
    link: 'http://www.skillsedge.co',
    linkLabel: 'skillsedge.co',
  },
  {
    id: 's2',
    year: 'May 2021 – present',
    org: 'Capacity Building Commission',
    role: 'Advisor',
    description: 'Working with the Capacity Building Commission as an advisor, helping the commission design suitable interventions to improve the state of civil services in India.',
    link: null,
  },
  {
    id: 's3',
    year: 'February 2022 – present',
    org: 'University Grants Commission (UGC)',
    role: 'Expert Committee Member',
    description: 'Member of UGC\'s expert committee to formulate "Guidelines for leadership development programmes to prepare faculty members for potential institutional leadership roles".',
    link: null,
  },
  {
    id: 's4',
    year: 'May 2018 – March 2019',
    org: 'Bharat Sanchar Nigam Limited (BSNL)',
    role: 'Lead Researcher – Restructuring Study',
    description: 'Organisation-wide study of BSNL providing suggestions regarding revival and restructuring.',
    link: 'https://www.bdpa.in/iim-ahmedabad-interim-report-submitted-on-revival-of-bsnl/',
    linkLabel: 'IIMA Interim Report on BSNL',
    extraLinks: [
      { label: 'New Indian Express Coverage', href: 'https://www.newindianexpress.com/business/2019/jan/24/iim-a-report-highlights-widespread-challenges-confronting-bsnl-1929375.html' },
      { label: 'Suggestions for Restructuring', href: 'http://mydigitalfc.com/plan-and-policy/suggestions-iim-restructuring-bsnl' },
      { label: 'Swarajya Mag Report', href: 'https://swarajyamag.com/insta/mediocre-people-hold-important-roles-workforce-lacks-technical-skills-iim-ahmedabad-report-on-bsnl-revival' },
    ],
  },
  {
    id: 's5',
    year: 'July 2015 – March 2017',
    org: 'SICOM',
    role: 'Performance Appraisal Redesign',
    description: 'Study involved redesigning the performance appraisal system for SICOM, a public-sector NBFC in the state of Maharashtra.',
    link: null,
  },
];

const STATIC_GRANTS = [
  {
    id: 'g1',
    title: 'Linkages between Pay-for-Performance, Organizational Fairness, Employee Attitudes and Performance',
    period: 'January 2018 – December 2019',
    sponsor: 'British Academy (in collaboration with Aston Business School, UK)',
    amount: '£10,000',
  },
  {
    id: 'g2',
    title: 'Innovation in Manufacturing SMEs in India',
    period: 'February 2016 – December 2017',
    sponsor: 'Tilburg University, Netherlands',
    amount: '€28,000',
  },
];

const GOVT_ORGS = [
  'Indian Administrative Service (IAS) Officers, Government of India',
  'Indian Police Service (IPS) Officers, Government of India',
  'Indian Revenue Service (IRS) Officers, Government of India',
  'Indian Foreign Service (IFS) Officers, Government of India',
  'Indian Economic Service (IES) Officers, Government of India',
  'Principals and teachers of government schools, Government of Delhi',
  'Defence Research and Development Organization (DRDO), Government of India',
  'State Poverty Eradication Mission (SPEM), Government of Kerala',
  'Officers of Income Tax, Central Board of Direct Taxes (CBDT)',
  'Chennai Petroleum Corporation Limited (CPCL)',
  'Gujarat Maritime Board, Government of Gujarat',
  'British High Commission, Government of UK',
  'Mahatma Gandhi National Fellowship (MGNF), Government of India',
  'Department of Atomic Energy, Atomic Energy Commission, Government of India',
];

const PRIVATE_ORGS = [
  'L&T', 'Ambuja Group', 'Taj Group', 'Torrent Pharma', 'Novartis', 'JLL',
  'Economic Times', 'La Renon', 'Nissan', 'E&Y', 'Tata Power', 'Crowne Plaza',
  'ACT Fibernet', 'Bharat Petroleum Corporation Limited (BPCL)',
  'Hindustan Petroleum Corporation Limited (HPCL)', 'ICICI Bank',
  'Jindal Steel Works (JSW)', 'CapitalOne', 'Tata AIG', 'Tata Projects',
];

const EXEC_PROGRAMS = [
  { label: 'Leadership and Change Management', org: 'JLL' },
  { label: 'Leadership Workshop', org: 'Economic Times Group' },
  { label: 'Leadership Skills', org: 'Novartis' },
  { label: 'Leadership Program for Dealers', org: 'Nissan' },
  { label: 'Winning Habits of Highly Effective People, Strategic Thinking & Change Management', org: 'NHPC' },
  { label: 'Leadership and Project Management', org: 'State Poverty Eradication Mission, Kerala' },
  { label: 'Social Intelligence and Collaboration', org: 'L&T' },
  { label: 'R&D Management', org: 'HPCL, BPCL' },
  { label: 'Management Development Programme', org: 'DAE' },
];

/* ─── Animation Variants ─────────────────────────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
const viewportOptions = { once: true, margin: '0px 0px -50px 0px', amount: 0.1 };

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════ */
export default function Consulting() {
  const { isAdmin } = useAuth() || {};

  const { data: pageData } = useFirestoreDoc('content', 'consulting', {
    page_heading: 'Consulting',
    page_subtitle: 'Translating academic rigour into real-world impact — through policy advisory, organisational research, executive education, and leadership development.',
    assignments_heading: 'Consulting Assignments',
    grants_heading: 'Research Grants',
    training_heading: 'Trainings & Executive Education',
    training_subtitle: 'Conducted programmes on leadership, emotional intelligence, mindfulness, R&D management, creativity, team building, strategic leadership, change management, and public sector leadership.',
    cta_heading: 'Interested in Consulting?',
    cta_subtitle: 'Reach out to discuss potential collaborations in organisational research, executive education, or policy advisory.',
  });

  const { data: dynamicAssignments } = useFirestoreCollection('consultingAssignments', [], true);
  const { data: dynamicGrants } = useFirestoreCollection('consultingGrants', [], true);
  const { data: dynamicGovtOrgs } = useFirestoreCollection('consultingGovtOrgs', [], true);
  const { data: dynamicPrivateOrgs } = useFirestoreCollection('consultingPrivateOrgs', [], true);
  const { data: dynamicExecPrograms } = useFirestoreCollection('consultingExecPrograms', [], true);

  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showAddGrant, setShowAddGrant] = useState(false);
  const [showAddGovtOrg, setShowAddGovtOrg] = useState(false);
  const [showAddPrivateOrg, setShowAddPrivateOrg] = useState(false);
  const [showAddExecProgram, setShowAddExecProgram] = useState(false);
  const [expandedTraining, setExpandedTraining] = useState(false);

  const addAssignment = async (data) => {
    await addDoc(collection(db, 'consultingAssignments'), { ...data, createdAt: new Date() });
    setShowAddAssignment(false);
  };
  const addGrant = async (data) => {
    await addDoc(collection(db, 'consultingGrants'), { ...data, createdAt: new Date() });
    setShowAddGrant(false);
  };
  const addGovtOrg = async (data) => {
    await addDoc(collection(db, 'consultingGovtOrgs'), { ...data, createdAt: new Date() });
    setShowAddGovtOrg(false);
  };
  const addPrivateOrg = async (data) => {
    await addDoc(collection(db, 'consultingPrivateOrgs'), { ...data, createdAt: new Date() });
    setShowAddPrivateOrg(false);
  };
  const addExecProgram = async (data) => {
    await addDoc(collection(db, 'consultingExecPrograms'), { ...data, createdAt: new Date() });
    setShowAddExecProgram(false);
  };

  const deleteAssignment = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    await deleteDoc(doc(db, 'consultingAssignments', id));
  };
  const deleteGrant = async (id) => {
    if (!window.confirm('Delete this grant?')) return;
    await deleteDoc(doc(db, 'consultingGrants', id));
  };
  const deleteGovtOrg = async (id) => {
    if (!window.confirm('Delete this organization?')) return;
    await deleteDoc(doc(db, 'consultingGovtOrgs', id));
  };
  const deletePrivateOrg = async (id) => {
    if (!window.confirm('Delete this organization?')) return;
    await deleteDoc(doc(db, 'consultingPrivateOrgs', id));
  };
  const deleteExecProgram = async (id) => {
    if (!window.confirm('Delete this program?')) return;
    await deleteDoc(doc(db, 'consultingExecPrograms', id));
  };

  const allAssignments = [...STATIC_ASSIGNMENTS, ...(dynamicAssignments || [])];
  const allGrants = [...STATIC_GRANTS, ...(dynamicGrants || [])];
  const allGovtOrgs = [...GOVT_ORGS, ...(dynamicGovtOrgs?.map(d => d.name) || [])];
  const allPrivateOrgs = [...PRIVATE_ORGS, ...(dynamicPrivateOrgs?.map(d => d.name) || [])];
  const allExecPrograms = [...EXEC_PROGRAMS, ...(dynamicExecPrograms || [])];

  const totalAssignments = allAssignments.length;

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#dce8f5] to-[#fff7ed] pt-20 pb-8 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center">
            <div className="w-20 h-1 bg-[#004B8D] mb-8 rounded-full mx-auto" />
            <h1 className="text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6">
              <EditableText
                collection="content" docId="consulting" field="page_heading"
                defaultValue={pageData?.page_heading || 'Consulting'}
                className="text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
              />
            </h1>
            <p className="text-xl lg:text-2xl font-['Inter'] text-gray-600 max-w-3xl mx-auto">
              <EditableText
                collection="content" docId="consulting" field="page_subtitle"
                defaultValue={pageData?.page_subtitle || ''}
                className="text-xl lg:text-2xl font-[\'Inter\'] text-gray-600"
                multiline
              />
            </p>

            {/* KPI Stat Cards */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 mb-2">
              {[
                { value: totalAssignments, defaultLabel: 'Organisations Consulted', field: 'kpi_1_label', valueField: 'kpi_1_value' },
                { value: '300,000', defaultLabel: 'Professionals Trained', field: 'kpi_4_label', valueField: 'kpi_4_value' },
                { value: allGovtOrgs.length + allPrivateOrgs.length, defaultLabel: 'Organisations Trained', field: 'kpi_3_label', valueField: 'kpi_3_value' },
              ].map(({ value, defaultLabel, field, valueField }) => (
                <div key={field} style={{
                  display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                  background: 'white', borderRadius: '10px', padding: '10px 22px',
                  boxShadow: '0 4px 20px rgba(0,75,141,.1)', border: '1px solid rgba(0,75,141,.08)',
                  minWidth: '160px'
                }}>
                  <strong style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, color: '#004B8D' }}>
                    <EditableText
                      collection="content"
                      docId="consulting"
                      field={valueField}
                      defaultValue={pageData?.[valueField] || `${value}+`}
                      className="font-['Playfair_Display'] text-[1.8rem] font-bold text-[#004B8D]"
                    />
                  </strong>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '.72rem', fontWeight: 500, color: '#9ca3af', letterSpacing: '.09em', textTransform: 'uppercase', marginTop: '2px' }}>
                    <EditableText
                      collection="content"
                      docId="consulting"
                      field={field}
                      defaultValue={pageData?.[field] || defaultLabel}
                      className="font-['Inter'] text-[.72rem] font-medium text-[#9ca3af] uppercase tracking-[.09em] text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Consulting Assignments ────────────────────────────────────── */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp} className="mb-12">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="group">
                <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4">
                  <EditableText collection="content" docId="consulting" field="assignments_heading"
                    defaultValue={pageData?.assignments_heading || 'Organisations Consulted'}
                    className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
                  />
                </h2>
                <div className="w-24 h-1 bg-[#004B8D] rounded-full group-hover:bg-[#004B8D] group-hover:w-32 transition-all duration-300" />
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowAddAssignment(true)}
                  className="flex items-center gap-2 bg-[#004B8D] hover:bg-[#003870] text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md"
                >
                  <FiPlus /> Add Assignment
                </button>
              )}
            </div>
          </motion.div>

          {showAddAssignment && isAdmin && (
            <div className="mb-8 p-6 bg-white rounded-xl border-2 border-[#004B8D] shadow-lg">
              <AssignmentForm onSave={addAssignment} onCancel={() => setShowAddAssignment(false)} />
            </div>
          )}

          <div className="space-y-6">
            {/* Static assignments */}
            {STATIC_ASSIGNMENTS.map((a, i) => (
              <AssignmentCard key={a.id} assignment={a} index={i} />
            ))}
            {/* Dynamic assignments */}
            {dynamicAssignments?.map((a, i) => (
              <div key={a.id} className="relative">
                <AssignmentCard assignment={a} index={STATIC_ASSIGNMENTS.length + i} />
                {isAdmin && (
                  <button
                    onClick={() => deleteAssignment(a.id)}
                    className="absolute top-4 right-4 p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Research Grants ───────────────────────────────────────────── */}
      <section className="py-16 px-6 lg:px-16 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp} className="mb-12">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="group">
                <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4">
                  <EditableText collection="content" docId="consulting" field="grants_heading"
                    defaultValue={pageData?.grants_heading || 'Research Grants'}
                    className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
                  />
                </h2>
                <div className="w-24 h-1 bg-[#004B8D] rounded-full group-hover:bg-[#004B8D] group-hover:w-32 transition-all duration-300" />
              </div>
              {isAdmin && (
                <button onClick={() => setShowAddGrant(true)}
                  className="flex items-center gap-2 bg-[#004B8D] hover:bg-[#003870] text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md">
                  <FiPlus /> Add Grant
                </button>
              )}
            </div>
          </motion.div>

          {showAddGrant && isAdmin && (
            <div className="mb-8 p-6 bg-white rounded-xl border-2 border-[#004B8D] shadow-lg">
              <GrantForm onSave={addGrant} onCancel={() => setShowAddGrant(false)} />
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {allGrants.map((g, i) => {
              const isDynamic = dynamicGrants?.some(dg => dg.id === g.id);
              return (
                <motion.div
                  key={g.id || i}
                  initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-[#004B8D] overflow-hidden relative"
                >
                  <div className="bg-[#004B8D] p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-[#dce8f5] p-3 rounded-xl">
                        <FiAward className="w-6 h-6 text-[#004B8D]" />
                      </div>
                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-['Inter'] font-semibold rounded-full mb-2">{g.period}</span>
                        <h3 className="text-xl font-['Playfair_Display'] font-bold text-white" style={{ color: 'white' }}>{g.title}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="font-['Inter'] text-gray-700 mb-3">{g.sponsor}</p>
                    <span className="inline-block px-4 py-2 bg-[#dce8f5] text-[#004B8D] font-['Inter'] font-bold text-sm rounded-lg">
                      Grant: {g.amount}
                    </span>
                  </div>
                  {isAdmin && isDynamic && (
                    <button onClick={() => deleteGrant(g.id)}
                      className="absolute top-4 right-4 p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg">
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Trainings & Executive Education ──────────────────────────── */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp} className="mb-12">
            <div className="group">
              <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4">
                <EditableText collection="content" docId="consulting" field="training_heading"
                  defaultValue={pageData?.training_heading || 'Trainings & Executive Education'}
                  className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
                />
              </h2>
              <div className="w-24 h-1 bg-[#004B8D] rounded-full group-hover:bg-[#004B8D] group-hover:w-32 transition-all duration-300 mb-4" />
              <p className="text-lg font-['Inter'] text-gray-600 max-w-3xl">
                <EditableText collection="content" docId="consulting" field="training_subtitle"
                  defaultValue={pageData?.training_subtitle || ''}
                  className="text-lg font-['Inter'] text-gray-600"
                  multiline
                />
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Government & Public Sector */}
            <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
              className="bg-[#faf8f5] rounded-xl shadow-md border-l-4 border-[#004B8D] overflow-hidden"
            >
              <div className="bg-[#004B8D] p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-[#dce8f5] p-3 rounded-xl">
                    <FiUsers className="w-6 h-6 text-[#004B8D]" />
                  </div>
                  <h3 className="text-2xl font-['Playfair_Display'] font-bold text-white" style={{ color: 'white' }}>
                    <EditableText collection="content" docId="consulting" field="govt_heading"
                      defaultValue={pageData?.govt_heading || 'Government & Public Sector'}
                      className="text-2xl font-['Playfair_Display'] font-bold text-white"
                    />
                  </h3>
                </div>
                {isAdmin && (
                  <button onClick={() => setShowAddGovtOrg(true)}
                    className="flex items-center gap-1 bg-white hover:bg-gray-100 text-[#004B8D] px-3 py-1.5 rounded text-sm font-semibold transition-all">
                    <FiPlus /> Add
                  </button>
                )}
              </div>

              {showAddGovtOrg && isAdmin && (
                <div className="p-6 bg-white border-b-2 border-gray-100">
                  <OrgForm typeLabel="Govt Organization" onSave={addGovtOrg} onCancel={() => setShowAddGovtOrg(false)} />
                </div>
              )}

              <div className="p-6">
                <ul className="space-y-3">
                  {(expandedTraining ? allGovtOrgs : allGovtOrgs.slice(0, 6)).map((org, idx) => {
                    const dynamicDoc = dynamicGovtOrgs?.find(d => d.name === org);
                    return (
                      <li key={org + idx} className="flex items-start gap-2 font-['Inter'] text-gray-700 text-sm group">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#004B8D] mt-2 flex-shrink-0" />
                        <span className="flex-1">{org}</span>
                        {isAdmin && dynamicDoc && (
                          <button onClick={() => deleteGovtOrg(dynamicDoc.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded">
                            <FiTrash2 size={12} />
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {!expandedTraining && allGovtOrgs.length > 6 && (
                  <button onClick={() => setExpandedTraining(true)}
                    className="mt-4 text-[#004B8D] text-sm font-['Inter'] font-semibold flex items-center gap-1 hover:underline">
                    Show {allGovtOrgs.length - 6} more <FiChevronDown size={14} />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Private Sector */}
            <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
              className="bg-[#fff7ed] rounded-xl shadow-md border-l-4 border-[#004B8D] overflow-hidden"
            >
              <div className="bg-[#004B8D] p-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-[#fff7ed] p-3 rounded-xl">
                    <FiBriefcase className="w-6 h-6 text-[#004B8D]" />
                  </div>
                  <h3 className="text-2xl font-['Playfair_Display'] font-bold text-white" style={{ color: 'white' }}>
                    <EditableText collection="content" docId="consulting" field="private_heading"
                      defaultValue={pageData?.private_heading || 'Private Sector'}
                      className="text-2xl font-['Playfair_Display'] font-bold text-white"
                    />
                  </h3>
                </div>
                {isAdmin && (
                  <button onClick={() => setShowAddPrivateOrg(true)}
                    className="flex items-center gap-1 bg-white hover:bg-gray-100 text-[#004B8D] px-3 py-1.5 rounded text-sm font-semibold transition-all">
                    <FiPlus /> Add
                  </button>
                )}
              </div>

              {showAddPrivateOrg && isAdmin && (
                <div className="p-6 bg-white border-b-2 border-gray-100">
                  <OrgForm typeLabel="Private Organization" onSave={addPrivateOrg} onCancel={() => setShowAddPrivateOrg(false)} />
                </div>
              )}

              <div className="p-6">
                <div className="flex flex-wrap gap-2">
                  {allPrivateOrgs.map((org, idx) => {
                    const dynamicDoc = dynamicPrivateOrgs?.find(d => d.name === org);
                    return (
                      <span key={org + idx} className="group relative px-3 py-1.5 bg-white border border-[#f97316]/30 text-[#1a1a1a] font-['Inter'] text-sm rounded-full shadow-sm pr-6">
                        {org}
                        {isAdmin && dynamicDoc && (
                          <button onClick={() => deletePrivateOrg(dynamicDoc.id)}
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-red-400 hover:text-red-600">
                            <FiTrash2 size={12} />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Executive Education Programs */}
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
            className="mt-8 bg-[#faf8f5] p-8 rounded-xl shadow-md border-l-4 border-[#004B8D]"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#dce8f5] rounded-xl">
                  <FiBook className="w-6 h-6 text-[#004B8D]" />
                </div>
                <h3 className="text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
                  <EditableText collection="content" docId="consulting" field="exec_heading"
                    defaultValue={pageData?.exec_heading || 'Executive Education Programmes'}
                    className="text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
                  />
                </h3>
              </div>
              {isAdmin && (
                <button onClick={() => setShowAddExecProgram(true)}
                  className="flex items-center gap-2 bg-[#004B8D] hover:bg-[#003870] text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md">
                  <FiPlus /> Add Program
                </button>
              )}
            </div>

            {showAddExecProgram && isAdmin && (
              <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200">
                <ExecProgramForm onSave={addExecProgram} onCancel={() => setShowAddExecProgram(false)} />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {allExecPrograms.map((p, idx) => {
                const isDynamic = dynamicExecPrograms?.some(dp => dp.id === p.id);
                return (
                  <div key={(p.id || p.label) + idx} className="flex gap-3 items-start group relative">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#004B8D] mt-2 flex-shrink-0" />
                    <div className="flex-1 pr-6">
                      <span className="font-['Inter'] font-semibold text-[#1a1a1a] text-sm">{p.label}</span>
                      <span className="font-['Inter'] text-gray-500 text-sm"> — {p.org}</span>
                    </div>
                    {isAdmin && isDynamic && (
                      <button onClick={() => deleteExecProgram(p.id)}
                        className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded">
                        <FiTrash2 size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-16 bg-[#dce8f5]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}>
            <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6">
              <EditableText collection="content" docId="consulting" field="cta_heading"
                defaultValue={pageData?.cta_heading || 'Interested in Consulting?'}
                className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
              />
            </h2>
            <p className="text-xl font-['Inter'] text-gray-700 mb-8">
              <EditableText collection="content" docId="consulting" field="cta_subtitle"
                defaultValue={pageData?.cta_subtitle || ''}
                className="text-xl font-['Inter'] text-gray-700"
                multiline
              />
            </p>
            <div className="relative inline-block mt-4">
              <a href={pageData?.cta_button_link || "mailto:vishal@iima.ac.in"}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#004B8D] hover:bg-[#f5b800] text-black font-['Inter'] font-bold rounded-lg transition-all shadow-xl hover:shadow-2xl text-lg"
              >
                <FiBriefcase className="w-5 h-5" />
                <span className="text-lg font-['Inter'] font-bold">
                  {!isAdmin ? (pageData?.cta_button_text || 'Get in Touch') : <span className="opacity-0">{pageData?.cta_button_text || 'Get in Touch'}</span>}
                </span>
              </a>

              {/* Editable overlay placed outside the interactive anchor to avoid nested interactive elements */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pl-8">
                <div className="flex items-center justify-center w-full pointer-events-auto">
                  <EditableText
                    collection="content"
                    docId="consulting"
                    field="cta_button_text"
                    defaultValue={pageData?.cta_button_text || 'Get in Touch'}
                    className="w-full inline-block text-lg font-['Inter'] font-bold text-white text-center px-2"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* ─── Assignment Card ────────────────────────────────────────────────── */
function AssignmentCard({ assignment, index }) {
  const isAlt = false; // Force uniform color, was: index % 2 === 1;
  const borderColor = isAlt ? 'border-[#FFCC00]' : 'border-[#004B8D]';
  const headerBg = isAlt ? 'bg-[#FFCC00]' : 'bg-[#004B8D]';
  const iconBg = isAlt ? 'bg-[#fff7ed]' : 'bg-[#dce8f5]';
  const iconColor = isAlt ? 'text-[#FFCC00]' : 'text-[#004B8D]';
  const cardBg = isAlt ? 'bg-[#fff7ed]' : 'bg-white';

  return (
    <motion.div
      initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
      className={`${cardBg} rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 ${borderColor} overflow-hidden`}
    >
      <div className={`${headerBg} p-6`}>
        <div className="flex items-start gap-4">
          <div className={`${iconBg} p-3 rounded-xl flex-shrink-0`}>
            <FiBriefcase className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div className="flex-1">
            <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-['Inter'] font-semibold rounded-full mb-2">
              {assignment.year}
            </span>
            <h3 className="text-2xl font-['Playfair_Display'] font-bold text-white" style={{ color: 'white' }}>{assignment.org}</h3>
            {assignment.role && (
              <p className="text-white/80 font-['Inter'] text-sm mt-1">{assignment.role}</p>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        <p className="font-['Inter'] text-gray-700 leading-relaxed mb-4">{assignment.description}</p>
        <div className="flex flex-wrap gap-3">
          {assignment.link && (
            <a href={assignment.link} target="_blank" rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-4 py-2 font-['Inter'] text-sm font-semibold rounded-lg transition-all shadow-md ${isAlt ? 'bg-[#F5C400] hover:bg-[#f5b800] text-black' : 'bg-[#004B8D] hover:bg-[#003870] text-white'}`}
            >
              {assignment.linkLabel || 'View More'} <FiExternalLink size={13} />
            </a>
          )}
          {assignment.extraLinks?.map((el) => (
            <a key={el.href} href={el.href} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-['Inter'] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-sm"
            >
              {el.label} <FiExternalLink size={13} />
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Assignment Form (Admin) ────────────────────────────────────────── */
function AssignmentForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ year: '', org: '', role: '', description: '', link: '', linkLabel: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.org.trim()) { alert('Organisation is required'); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const field = (key, label, placeholder, type = 'text') => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder} rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#004B8D] outline-none resize-none"
        />
      ) : (
        <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#004B8D] outline-none"
        />
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-['Playfair_Display'] font-bold text-[#1a1a1a]">Add Consulting Assignment</h3>
      {field('year', 'Period', 'e.g. May 2021 – present')}
      {field('org', 'Organisation *', 'e.g. Capacity Building Commission')}
      {field('role', 'Role / Title', 'e.g. Advisor')}
      {field('description', 'Description', 'Brief description...', 'textarea')}
      {field('link', 'Link URL', 'https://...', 'url')}
      {field('linkLabel', 'Link Label', 'e.g. View Report')}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#004B8D] hover:bg-[#003870] text-white font-semibold rounded-lg shadow-md disabled:opacity-60">
          <FiSave size={15} /> {saving ? 'Saving...' : 'Add Assignment'}
        </button>
        <button type="button" onClick={onCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg">
          <FiX size={15} /> Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Grant Form (Admin) ─────────────────────────────────────────────── */
function GrantForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ title: '', period: '', sponsor: '', amount: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { alert('Title is required'); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const field = (key, label, placeholder) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <input type="text" value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#004B8D] outline-none"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-['Playfair_Display'] font-bold text-[#1a1a1a]">Add Research Grant</h3>
      {field('title', 'Title *', 'e.g. Innovation in SMEs')}
      {field('period', 'Period', 'e.g. Feb 2016 – Dec 2017')}
      {field('sponsor', 'Sponsor', 'e.g. Tilburg University')}
      {field('amount', 'Amount', 'e.g. €28,000')}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#004B8D] hover:bg-[#003870] text-white font-semibold rounded-lg shadow-md disabled:opacity-60">
          <FiSave size={15} /> {saving ? 'Saving...' : 'Add Grant'}
        </button>
        <button type="button" onClick={onCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg">
          <FiX size={15} /> Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Generic Organization Form (Admin) ──────────────────────────────── */
function OrgForm({ typeLabel, onSave, onCancel }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-base font-semibold text-[#1a1a1a]">Add {typeLabel}</h3>
      <input type="text" value={name} onChange={e => setName(e.target.value)}
        placeholder="Organization name..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#004B8D] outline-none"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="px-4 py-2 bg-[#004B8D] text-white text-sm font-semibold rounded shadow disabled:opacity-60">
          {saving ? '...' : 'Add'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Exec Program Form (Admin) ──────────────────────────────────────── */
function ExecProgramForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ label: '', org: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-semibold text-gray-700 mb-1">Program Label *</label>
        <input type="text" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
          placeholder="e.g. Leadership Skills"
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#004B8D] outline-none"
        />
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-semibold text-gray-700 mb-1">Organization</label>
        <input type="text" value={form.org} onChange={e => setForm(p => ({ ...p, org: e.target.value }))}
          placeholder="e.g. Novartis"
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#004B8D] outline-none"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="h-[38px] px-4 bg-[#004B8D] text-white text-sm font-semibold rounded shadow disabled:opacity-60 flex items-center">
          {saving ? '...' : 'Add'}
        </button>
        <button type="button" onClick={onCancel}
          className="h-[38px] px-4 bg-gray-200 text-gray-700 text-sm font-semibold rounded flex items-center">
          Cancel
        </button>
      </div>
    </form>
  );
}