import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  FiYoutube, FiExternalLink, FiMic, FiFileText,
  FiPlus, FiTrash2, FiSave, FiX
} from 'react-icons/fi';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import EditableText from '../components/EditableText';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

/* ─── Font Injection ─────────────────────────────────────────────────── */
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

/* ─── Static Data ────────────────────────────────────────────────────── */
const STATIC_TALKS = [
  {
    id: 't1',
    title: 'Views on BAPS Pramukh Swami Maharaj Shatabdi Mahotsav',
    venue: 'YouTube',
    date: 'December 2022',
    link: 'https://www.youtube.com/watch?v=qCW9q4qlCTE',
    type: 'youtube',
  },
  {
    id: 't2',
    title: 'Podcast on the book with Secrets of Storytellers',
    venue: 'Spotify Podcast',
    date: 'December 2021',
    link: 'https://open.spotify.com/embed-podcast/episode/3Lg5ID3kgYuFYtBdrKwFF9',
    type: 'podcast',
  },
  {
    id: 't3',
    title: 'Conversation on the book "First Among Equals"',
    venue: 'Ahmedabad University',
    date: 'July 2021',
    link: 'https://www.youtube.com/watch?v=3nN_AF7NTEg',
    type: 'youtube',
  },
  {
    id: 't4',
    title: 'TREAT for LEAP: Leadership for New Age Organizations',
    venue: 'IIM Ranchi',
    date: 'July 2020',
    link: 'https://www.youtube.com/watch?v=toiEi6lzZwE&t=36s',
    type: 'youtube',
  },
  {
    id: 't5',
    title: 'Inner Game of Peak Performance',
    venue: 'IIMA Podcast',
    date: 'May 28, 2018',
    link: 'https://soundcloud.com/iimapodcast/prof-vishal-gupta-associate-professor-at-iima-discusses-the-inner-game-of-peak-performance',
    type: 'podcast',
  },
  {
    id: 't6',
    title: 'Stress and Our Inner Game',
    venue: 'IIMA Podcast',
    date: 'September 13, 2018',
    link: 'https://soundcloud.com/iimapodcast/prof-vishal-gupta-associate-professor-at-iima-discusses-stress-and-our-inner-game',
    type: 'podcast',
  },
  {
    id: 't7',
    title: 'When is Extrinsic Motivation Helpful for Promoting Employee Creativity? Evidence from India',
    venue: 'IIMA Podcast',
    date: 'February 17, 2017',
    link: 'https://soundcloud.com/iimapodcast/when-is-extrinsic-motivation-helpful-for-promoting-employee-creativity-evidence-for-india',
    type: 'podcast',
  },
];

const STATIC_ARTICLES = [
  { id: 'a1', title: 'Mindfulness, the myth of multitasking and winning our inner game', outlet: 'People Matters', date: 'February 06, 2022', link: 'https://www.peoplematters.in/article/strategic-hr/mindfulness-the-myth-of-multitasking-and-winning-our-inner-game-32588' },
  { id: 'a2', title: 'L-E-A-P: Rethinking organizational culture for new-age organizations', outlet: 'People Matters', date: 'November 17, 2021', link: 'https://www.peoplemattersglobal.com/article/culture/l-e-a-p-rethinking-organizational-culture-for-new-age-organizations-31641' },
  { id: 'a3', title: 'Emotional intelligence and conflict management in virtual workplaces', outlet: 'ETHR World', date: 'October 09, 2021', link: 'https://hr.economictimes.indiatimes.com/news/trends/leadership/emotional-intelligence-and-conflict-management-in-virtual-workplaces/86881263' },
  { id: 'a4', title: 'Leadership and organisational culture: Two sides of a coin', outlet: 'ETHR World', date: 'September 19, 2021', link: 'https://hr.economictimes.indiatimes.com/news/trends/leadership/leadership-and-organisational-culture-two-sides-of-a-coin/86337567' },
  { id: 'a5', title: 'Leading knowledge organisations in the post-COVID world', outlet: 'People Matters', date: 'September 14, 2021', link: 'https://www.peoplematters.in/article/behavioural-assessments/leading-knowledge-organisations-in-the-post-covid-world-30855' },
  { id: 'a6', title: 'Relational power: The importance of networking in organisations', outlet: 'ETHR World', date: 'July 02, 2021', link: 'https://hr.economictimes.indiatimes.com/news/trends/leadership/relational-power-the-importance-of-networking-in-organisations/84054530' },
  { id: 'a7', title: "Principled pragmatism: Navigating life's ethical dilemmas", outlet: 'ETHR World', date: 'June 20, 2021', link: 'https://hr.economictimes.indiatimes.com/news/trends/leadership/principled-pragmatism-navigating-lifes-ethical-dilemmas/83680565' },
  { id: 'a8', title: 'L-E-A-P culture essential for businesses in a post-COVID world', outlet: 'Financial Express', date: 'June 13, 2021', link: 'https://www.financialexpress.com/opinion/l-e-a-p-culture-essential-for-businesses-in-a-post-covid-world/2270443/' },
  { id: 'a9', title: 'Leading upwards: Art of working effectively with bosses', outlet: 'ETHR World', date: 'May 31, 2021', link: 'https://hr.economictimes.indiatimes.com/news/trends/leadership/leading-upwards-art-of-working-effectively-with-bosses/83104766' },
  { id: 'a10', title: 'Growth, empathy and authenticity: Leadership lessons from the Bengal assembly elections', outlet: 'Outlook', date: 'May 23, 2021', link: 'https://www.outlookindia.com/website/story/india-news-growth-empathy-and-authenticity-leadership-lessons-from-the-bengal-assembly-elections/383423' },
  { id: 'a11', title: 'T-R-E-A-T leadership for new age organizations', outlet: 'IIMA Newsletter', date: 'August 2020', link: 'https://facultynewsletter.iima.ac.in/ideas/T-R-E-A-T-LEADERSHIP-FOR-NEW-AGE-ORGANISATIONS.html' },
  { id: 'a12', title: "Winning nurses' commitment in the Indian healthcare system", outlet: 'Hindu BusinessLine', date: 'September 4, 2019', link: 'https://www.thehindubusinessline.com/specials/pulse/winning-nurses-commitment-in-the-indian-healthcare-system/article29332083.ece' },
  { id: 'a13', title: "It is time to start a 'mindfulness-centered' conversation in our organisations", outlet: 'Economic Times', date: 'January 11, 2019', link: 'https://cio.economictimes.indiatimes.com/news/strategy-and-management/it-is-time-to-start-a-mindfulness-centered-conversation-in-our-organizations-view/67487888' },
  { id: 'a14', title: 'Are you mindful', outlet: 'The Smart Manager', date: 'November–December 2017', link: 'https://www.magzter.com/stories/Business/The-Smart-Manager/Are-You-Mindful' },
  { id: 'a15', title: 'Leadership competencies for effective public administration', outlet: 'Mint', date: 'October 1, 2017', link: 'http://www.livemint.com/Opinion/EBhW9oGaY6d8fl8yPOQY9I/Leadership-competencies-for-effective-public-administration.html' },
  { id: 'a16', title: 'When is extrinsic (reward-dependent) motivation bad for employee creativity', outlet: 'Mint', date: 'March 3, 2017', link: 'http://www.livemint.com/Opinion/NQhTcULU01eQKxKxmQqvtL/When-is-extrinsic-rewarddependent-motivation-bad-for-empl.html' },
  { id: 'a17', title: 'Agency based approach to reform Indian Administrative Service', outlet: 'Mint', date: 'August 31, 2015', link: 'http://www.livemint.com/Opinion/jAgyqXXbnl0uJKo5jEtPmM/Agencybased-approach-to-reform-the-Indian-Administrative-Se.html' },
  { id: 'a18', title: 'IIM-A paper suggests steps to improve IAS', outlet: 'Business Standard', date: 'May 03, 2015', link: 'http://wap.business-standard.com/article/management/iim-a-paper-suggests-steps-to-improve-ias-115050300674_1.html' },
  { id: 'a19', title: 'Towards demand-driven training', outlet: 'Hindu BusinessLine', date: 'April 14, 2015', link: 'http://www.thehindubusinessline.com/features/newmanager/towards-demanddriven-training/article7102243.ece' },
  { id: 'a20', title: "IIMA faculty seeks to bust rust off India's steel frame", outlet: 'Times of India', date: 'March 21, 2015', link: 'http://timesofindia.indiatimes.com/city/ahmedabad/IIM-A-faculty-seeks-to-bust-rust-off-Indias-steel-frame/articleshow/46645718.cms' },
  { id: 'a21', title: 'Case-based discussions needed to groom IAS officers', outlet: 'DNA', date: 'December 23, 2014', link: 'http://epaper.dnaindia.com/epapermain.aspx?eddate=2014-12-23&edcode=1310009' },
  { id: 'a22', title: 'Leadership, team work boost creativity: IIMA study', outlet: 'DNA', date: 'January 31, 2014', link: 'http://dnasyndication.com/dna/dna_english_news_and_features/Leadership-team-work-boost-creativity_-IIMA-study/DNAHM69912' },
  { id: 'a23', title: 'Cultural storm in Indian R&D space', outlet: 'Business Line', date: 'December 12, 2013', link: 'http://www.thehindubusinessline.com/features/weekend-life/cultural-storm-in-indian-rd-space/article5448430.ece' },
  { id: 'a24', title: 'Indians averse to risks, hence less creative: IIM-A study', outlet: 'Times of India', date: 'November 22, 2013', link: 'http://articles.timesofindia.indiatimes.com/2013-11-22/india/44363825_1_iim-a-study-indian-institutes-role-model' },
  { id: 'a25', title: 'Creativity boosts productivity', outlet: 'Ahmedabad Mirror', date: 'November 20, 2013', link: 'http://vslir.iima.ac.in:8080/xmlui/bitstream/handle/123456789/11405/' },
];

/* Outlet → colour mapping */
const OUTLET_COLORS = {
  'People Matters': '#004B8D',
  'ETHR World': '#0ea5e9',
  'Financial Express': '#16a34a',
  Outlook: '#7c3aed',
  'IIMA Newsletter': '#004B8D',
  Mint: '#0f766e',
  'Business Standard': '#b45309',
  'Hindu BusinessLine': '#dc2626',
  'Economic Times': '#ea580c',
  'Times of India': '#dc2626',
  'The Smart Manager': '#6d28d9',
  DNA: '#be185d',
  'Business Line': '#dc2626',
  'Ahmedabad Mirror': '#ca8a04',
};

const outletColor = (outlet) => OUTLET_COLORS[outlet] || '#004B8D';

/* ─── Animation Variants ─────────────────────────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};
const viewportOptions = { once: true, margin: '0px 0px -50px 0px', amount: 0.1 };

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════ */
export default function Opinions() {
  const { isAdmin } = useAuth() || {};

  const { data: pageData } = useFirestoreDoc('content', 'opinions', {
    page_heading: 'Opinions',
    page_subtitle: 'Thoughts, perspectives, and conversations on leadership, organisations, mindfulness, and the Indian management landscape.',
    talks_heading: 'Talks & Podcasts',
    articles_heading: 'Articles in Popular Media',
    cta_heading: 'Stay Updated',
    cta_subtitle: 'Join the newsletter for the latest talks, lectures, and conversations.',
  });

  /* Dynamic entries */
  const { data: dynamicTalks } = useFirestoreCollection('opinionTalks', [], true);
  const { data: dynamicArticles } = useFirestoreCollection('opinionArticles', [], true);

  const [showAddTalk, setShowAddTalk] = useState(false);
  const [showAddArticle, setShowAddArticle] = useState(false);
  const [showAllArticles, setShowAllArticles] = useState(false);

  const addTalk = async (data) => {
    await addDoc(collection(db, 'opinionTalks'), { ...data, createdAt: new Date() });
    setShowAddTalk(false);
  };

  const addArticle = async (data) => {
    await addDoc(collection(db, 'opinionArticles'), { ...data, createdAt: new Date() });
    setShowAddArticle(false);
  };

  const deleteTalk = async (id) => {
    if (!window.confirm('Delete this talk?')) return;
    await deleteDoc(doc(db, 'opinionTalks', id));
  };

  const deleteArticle = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    await deleteDoc(doc(db, 'opinionArticles', id));
  };

  const allTalks = [...STATIC_TALKS, ...(dynamicTalks || [])];
  const allArticles = [...STATIC_ARTICLES, ...(dynamicArticles || [])];
  const visibleArticles = showAllArticles ? allArticles : allArticles.slice(0, 8);

  const outletSet = new Set(allArticles.map(a => a.outlet).filter(Boolean));
  const uniqueOutlets = outletSet.size;

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#dce8f5] to-[#fff7ed] pt-20 pb-8 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="text-center">
            <div className="w-20 h-1 bg-[#FFCC00] mb-8 rounded-full mx-auto" />
            <h1 className="text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6">
              <EditableText
                collection="content" docId="opinions" field="page_heading"
                defaultValue={pageData?.page_heading || 'Opinions'}
                className="text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
              />
            </h1>
            <p className="text-xl lg:text-2xl font-['Inter'] text-gray-600 max-w-3xl mx-auto">
              <EditableText
                collection="content" docId="opinions" field="page_subtitle"
                defaultValue={pageData?.page_subtitle || ''}
                className="text-xl lg:text-2xl font-['Inter'] text-gray-600"
                multiline
              />
            </p>

            {/* KPI Cards */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 mb-2">
              {[
                { value: allTalks.length, defaultLabel: 'Talks & Podcasts', field: 'kpi_1_label' },
                { value: allArticles.length, defaultLabel: 'Media Articles', field: 'kpi_2_label' },
                { value: uniqueOutlets, defaultLabel: 'Outlets Featured In', field: 'kpi_3_label' },
              ].map(({ value, defaultLabel, field }) => (
                <div key={field} style={{
                  display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                  background: 'white', borderRadius: '10px', padding: '10px 22px',
                  boxShadow: '0 4px 20px rgba(0,75,141,.1)', border: '1px solid rgba(0,75,141,.08)',
                  minWidth: '160px'
                }}>
                  <strong style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', fontWeight: 700, color: '#004B8D' }}>{value}+</strong>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '.72rem', fontWeight: 500, color: '#9ca3af', letterSpacing: '.09em', textTransform: 'uppercase', marginTop: '2px' }}>
                    <EditableText
                      collection="content"
                      docId="opinions"
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

      {/* ── Talks & Podcasts ──────────────────────────────────────────── */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp} className="mb-12">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="group">
                <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4">
                  <EditableText collection="content" docId="opinions" field="talks_heading"
                    defaultValue={pageData?.talks_heading || 'Talks & Podcasts'}
                    className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
                  />
                </h2>
                <div className="w-24 h-1 bg-[#004B8D] rounded-full group-hover:bg-[#FFCC00] group-hover:w-32 transition-all duration-300" />
              </div>
              {isAdmin && (
                <button onClick={() => setShowAddTalk(true)}
                  className="flex items-center gap-2 bg-[#004B8D] hover:bg-[#003870] text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md">
                  <FiPlus /> Add Talk
                </button>
              )}
            </div>
          </motion.div>

          {showAddTalk && isAdmin && (
            <div className="mb-8 p-6 bg-white rounded-xl border-2 border-[#004B8D] shadow-lg">
              <TalkForm onSave={addTalk} onCancel={() => setShowAddTalk(false)} />
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTalks.map((talk, i) => {
              const isAlt = i % 2 === 1;
              const isYt = talk.type === 'youtube';
              const headerBg = isAlt ? 'bg-[#FFCC00]' : 'bg-[#004B8D]';
              const iconBg = isAlt ? 'bg-[#fff7ed]' : 'bg-[#dce8f5]';
              const iconColor = isAlt ? 'text-[#FFCC00]' : 'text-[#004B8D]';
              const borderColor = isAlt ? 'border-[#FFCC00]' : 'border-[#004B8D]';
              const cardBg = isAlt ? 'bg-[#fff7ed]' : 'bg-white';
              const btnClass = isAlt 
                ? 'bg-[#F5C400] hover:bg-[#f5b800] text-black' 
                : 'bg-[#004B8D] hover:bg-[#003870] text-white';

              return (
                <div key={talk.id} className="relative">
                  <motion.div
                    initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
                    className={`${cardBg} rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 ${borderColor} overflow-hidden flex flex-col h-full`}
                  >
                    <div className={`${headerBg} p-6`}>
                      <div className="flex items-start gap-3">
                        <div className={`${iconBg} p-3 rounded-xl flex-shrink-0`}>
                          {isYt ? <FiYoutube className={`w-5 h-5 ${iconColor}`} /> : <FiMic className={`w-5 h-5 ${iconColor}`} />}
                        </div>
                        <div>
                          <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-['Inter'] font-semibold rounded-full mb-2">{talk.date}</span>
                          <h3 className="text-lg font-['Playfair_Display'] font-bold text-white leading-snug" style={{ color: 'white' }}>{talk.title}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <p className="font-['Inter'] text-gray-500 text-sm mb-4">{talk.venue}</p>
                      {talk.link && (
                        <a href={talk.link} target="_blank" rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 px-4 py-2.5 ${btnClass} font-['Inter'] text-sm font-semibold rounded-lg transition-all shadow-md w-fit`}>
                          {isYt ? <><FiYoutube size={13} /> Watch</> : <><FiExternalLink size={13} /> Listen</>}
                        </a>
                      )}
                    </div>
                  </motion.div>
                  {isAdmin && talk.id.startsWith('s') === false && (
                    <button onClick={() => deleteTalk(talk.id)}
                      className="absolute top-3 right-3 p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg" title="Delete">
                      <FiTrash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Articles in Popular Media ─────────────────────────────────── */}
      <section className="py-16 px-6 lg:px-16 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp} className="mb-12">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="group">
                <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4">
                  <EditableText collection="content" docId="opinions" field="articles_heading"
                    defaultValue={pageData?.articles_heading || 'Articles in Popular Media'}
                    className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
                  />
                </h2>
                <div className="w-24 h-1 bg-[#004B8D] rounded-full group-hover:bg-[#FFCC00] group-hover:w-32 transition-all duration-300" />
              </div>
              {isAdmin && (
                <button onClick={() => setShowAddArticle(true)}
                  className="flex items-center gap-2 bg-[#004B8D] hover:bg-[#003870] text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md">
                  <FiPlus /> Add Article
                </button>
              )}
            </div>
          </motion.div>

          {showAddArticle && isAdmin && (
            <div className="mb-8 p-6 bg-white rounded-xl border-2 border-[#004B8D] shadow-lg">
              <ArticleForm onSave={addArticle} onCancel={() => setShowAddArticle(false)} />
            </div>
          )}

          <div className="space-y-4">
            {visibleArticles.map((article, i) => {
              const color = outletColor(article.outlet);
              const isDynamic = !article.id.startsWith('a');
              return (
                <div key={article.id} className="relative">
                  <motion.div
                    initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex items-stretch"
                  >
                    {/* Coloured left accent bar */}
                    <div className="w-1.5 flex-shrink-0" style={{ background: color }} />
                    <div className="flex-1 p-5 flex items-center gap-4 justify-between flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span
                            className="inline-block px-2.5 py-0.5 text-white text-xs font-['Inter'] font-semibold rounded-full"
                            style={{ background: color }}
                          >
                            {article.outlet}
                          </span>
                          <span className="text-gray-400 font-['Inter'] text-xs">{article.date}</span>
                        </div>
                        <h4 className="font-['Playfair_Display'] font-semibold text-[#1a1a1a] text-base leading-snug">
                          {article.title}
                        </h4>
                      </div>
                      {article.link && (
                        <a href={article.link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-['Inter'] text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-sm flex-shrink-0">
                          Read <FiExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </motion.div>
                  {isAdmin && isDynamic && (
                    <button onClick={() => deleteArticle(article.id)}
                      className="absolute top-2 right-14 p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded" title="Delete">
                      <FiTrash2 size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {allArticles.length > 8 && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAllArticles(v => !v)}
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#004B8D] text-[#004B8D] font-['Inter'] font-semibold rounded-lg hover:bg-[#dce8f5] transition-all"
              >
                {showAllArticles ? `Show Less` : `Show All ${allArticles.length} Articles`}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-16 bg-[#dce8f5]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={viewportOptions} variants={fadeInUp}>
            <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6">
              <EditableText collection="content" docId="opinions" field="cta_heading"
                defaultValue={pageData?.cta_heading || 'Stay Updated'}
                className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
              />
            </h2>
            <p className="text-xl font-['Inter'] text-gray-700 mb-8">
              <EditableText collection="content" docId="opinions" field="cta_subtitle"
                defaultValue={pageData?.cta_subtitle || 'Join the newsletter for the latest talks, lectures, and conversations.'}
                className="text-xl font-['Inter'] text-gray-700"
                multiline
              />
            </p>
            <div className="relative inline-block">
              <a href="/#newsletter"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#004B8D] hover:bg-[#003870] text-white font-['Inter'] font-bold rounded-lg transition-all shadow-xl hover:shadow-2xl text-lg"
              >
                <span className="text-lg font-['Inter'] font-bold text-white">
                  {!isAdmin ? (pageData?.cta_button_text || 'Stay Updated – Join Newsletter') : <span className="opacity-0">{pageData?.cta_button_text || 'Stay Updated – Join Newsletter'}</span>}
                </span>
              </a>

              {/* Editable overlay placed outside the interactive anchor to avoid nested interactive elements */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-center justify-center w-full pointer-events-auto">
                  <EditableText
                    collection="content"
                    docId="opinions"
                    field="cta_button_text"
                    defaultValue={pageData?.cta_button_text || 'Stay Updated – Join Newsletter'}
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

/* ─── Talk Form (Admin) ──────────────────────────────────────────────── */
function TalkForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ title: '', venue: '', date: '', link: '', type: 'youtube' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { alert('Title required'); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-['Playfair_Display'] font-bold text-[#1a1a1a]">Add Talk / Podcast</h3>
      {[
        ['title', 'Title *', 'Talk or podcast title'],
        ['venue', 'Venue / Platform', 'e.g. IIMA Podcast, IIM Ranchi'],
        ['date', 'Date', 'e.g. July 2021'],
      ].map(([key, label, placeholder]) => (
        <div key={key}>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
          <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#004B8D] outline-none" />
        </div>
      ))}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Link URL</label>
        <input type="url" value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#004B8D] outline-none" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
        <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#004B8D] outline-none">
          <option value="youtube">YouTube</option>
          <option value="podcast">Podcast</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#004B8D] hover:bg-[#003870] text-white font-semibold rounded-lg shadow-md disabled:opacity-60">
          <FiSave size={15} /> {saving ? 'Saving...' : 'Add Talk'}
        </button>
        <button type="button" onClick={onCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg">
          <FiX size={15} /> Cancel
        </button>
      </div>
    </form>
  );
}

/* ─── Article Form (Admin) ───────────────────────────────────────────── */
function ArticleForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ title: '', outlet: '', date: '', link: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { alert('Title required'); return; }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-['Playfair_Display'] font-bold text-[#1a1a1a]">Add Media Article</h3>
      {[
        ['title', 'Title *', 'Article headline'],
        ['outlet', 'Outlet', 'e.g. People Matters, Mint'],
        ['date', 'Date', 'e.g. January 2022'],
      ].map(([key, label, placeholder]) => (
        <div key={key}>
          <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
          <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#004B8D] outline-none" />
        </div>
      ))}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Link URL</label>
        <input type="url" value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#004B8D] outline-none" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#004B8D] hover:bg-[#003870] text-white font-semibold rounded-lg shadow-md disabled:opacity-60">
          <FiSave size={15} /> {saving ? 'Saving...' : 'Add Article'}
        </button>
        <button type="button" onClick={onCancel}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg">
          <FiX size={15} /> Cancel
        </button>
      </div>
    </form>
  );
}