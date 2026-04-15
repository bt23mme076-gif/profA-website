import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { FiExternalLink, FiBookOpen, FiUsers, FiFileText, FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiSearch } from 'react-icons/fi';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import { useAuth } from '../context/AuthContext';
import EditableText from '../components/EditableText';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function Research() {
  const { isAdmin } = useAuth() || {};
  const [editingPub, setEditingPub] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingCase, setEditingCase] = useState(null);
  const [showAddPub, setShowAddPub] = useState(false);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [showAddCase, setShowAddCase] = useState(false);
  const [pubSearch, setPubSearch] = useState('');
  const [showAddSpecialIssue, setShowAddSpecialIssue] = useState(false);
  const [editingSpecialIssue, setEditingSpecialIssue] = useState(null);
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const viewportOptions = {
    once: true,
    margin: "0px 0px -50px 0px",
    amount: 0.1
  };

  // Fetch research content from Firestore (optional - will use hardcoded data as fallback)
  const { data: researchData, loading } = useFirestoreDoc('content', 'research', {});

  // Hardcoded featured publications (original data preserved)
  const featuredPublications = [
    {
      id: 1,
      authors: "Kuril, S., Gupta, V., Kakkar, S., & Gupta, R.",
      year: "2025",
      title: "Public Sector Motivation: Construct Definition, Measurement, and Validation.",
      journal: "Public Administration Quarterly, 0(0).",
      doi: "https://journals.sagepub.com/doi/10.1177/07349149251359153"
    },
    {
      id: 2,
      authors: "George, P. R. & Gupta, V.",
      year: "2024",
      title: "Environmental identity and perceived salience of policy issues in coastal communities: a moderated-mediation analysis.",
      journal: "Policy Science, 57, 787-822.",
      doi: "https://link.springer.com/article/10.1007/s11077-024-09547-4"
    },
    {
      id: 3,
      authors: "Khan, F., Preeti, Gupta, V.",
      year: "2024",
      title: "Examining the relationships between instructional leadership, teacher self-efficacy and job satisfaction: a study of primary schools in India.",
      journal: "Journal of Educational Administration, forthcoming.",
      doi: "https://www.emerald.com/jea/article/62/2/223/1224308/Examining-the-relationships-between-instructional"
    },
    {
      id: 4,
      authors: "Gupta, V., Mittal, S., Ilavarasan, P. V., & Budhwar, P.",
      year: "2024",
      title: "Pay-for-performance, procedural justice, OCB and job performance: A sequential mediation model.",
      journal: "Personnel Review, 53(1), 136-154.",
      doi: "https://www.emerald.com/pr/article/53/1/136/1228152/Pay-for-performance-procedural-justice-OCB-and-job"
    },
    {
      id: 5,
      authors: "Gopakumar, K. V. & Gupta, V.",
      year: "2024",
      title: "Combining profit and purpose: Paradoxical leadership skills and social–business tensions during the formation and sustenance of a social enterprise.",
      journal: "Nonprofit Management & Leadership, 34, 489-522.",
      doi: "https://onlinelibrary.wiley.com/doi/10.1002/nml.21580"
    },
    {
      id: 6,
      authors: "Singhal, S. & Gupta, V.",
      year: "2022",
      title: "Religiosity and homophobia: Examining the impact of perceived importance of childbearing, hostile sexism and gender.",
      journal: "Sexuality Research and Social Policy, 19, 1636-1649.",
      doi: "https://link.springer.com/article/10.1007/s13178-022-00725-8"
    },
    {
      id: 7,
      authors: "Mittal, S., Gupta, V. & Mottiani, M.",
      year: "2022",
      title: "Examining the linkages between brand love, affective commitment, PWOM and turnover intentions: A social identity theory perspective.",
      journal: "IIMB Management Review, 34(1), 7-17.",
      doi: "https://www.sciencedirect.com/science/article/pii/S0970389622000234"
    },
    {
      id: 8,
      authors: "Kuril, S., Gupta. V. & Chand, V. S.",
      year: "2021",
      title: "Relationship between Negative Teacher Behaviors and Student Engagement: Evidence from India.",
      journal: "International Journal of Educational Research, 109, 1-19.",
      doi: "https://www.sciencedirect.com/science/article/pii/S0883035521001270"
    },
    {
      id: 9,
      authors: "Bhayana, C., Gupta, V., & Sharda, K.",
      year: "2021",
      title: "Exploring dynamics within multigenerational teams with millennials: A research framework.",
      journal: "Business Perspectives and Research, 9(2), 252-268.",
      doi: "https://journals.sagepub.com/doi/pdf/10.1177/2278533720964928"
    },
    {
      id: 10,
      authors: "Chattopadhyay, P, George, E., Li, J. & Gupta, V.",
      year: "2020",
      title: "Geographical dissimilarity and team member influence: Do emotions experienced in the initial team meeting matter?",
      journal: "Academy of Management Journal, 63(6), 1807-1839.",
      doi: "https://journals.aom.org/doi/10.5465/amj.2017.0744"
    },
    {
      id: 11,
      authors: "Gupta, V.",
      year: "2020",
      title: "Relationships between leadership, motivation, and employee-level innovation: Evidence from India.",
      journal: "Personnel Review, 49(7), 1363-1379.",
      doi: "https://www.emerald.com/pr/article/49/7/1363/453315/Relationships-between-leadership-motivation-and"
    },
    {
      id: 12,
      authors: "Pandey, A., Gupta, V., & Gupta, R.",
      year: "2019",
      title: "Spirituality and Innovative Behaviour in Teams: Examining the Mediating Role of Team Learning.",
      journal: "IIMB Management Review, 31(2), 116-126.",
      doi: "https://www.sciencedirect.com/science/article/pii/S0970389619301636"
    },
    {
      id: 13,
      authors: "Li, J., Li, A., Chattopadhyay, P., George, E., & Gupta, V.",
      year: "2018",
      title: "Team emotion diversity and performance: The moderating role of social class homogeneity.",
      journal: "Group Dynamics: Theory, Research and Practice, 22(2), 76-92.",
      doi: "https://psycnet.apa.org/record/2018-25949-002"
    },
    {
      id: 14,
      authors: "Agarwal, UA, & Gupta, V.",
      year: "2018",
      title: "Relationships between Job Characteristics, Work Engagement, Conscientiousness and Managers' Turnover Intentions: A Moderated-Mediation Analysis.",
      journal: "Personnel Review, 47(2), 353-377.",
      doi: "https://www.emerald.com/pr/article-pdf/47/2/353/2099767/pr-09-2016-0229.pdf"
    },
    {
      id: 15,
      authors: "Gupta, V., Chopra, S., & Kakani, R. K.",
      year: "2018",
      title: "Leadership Competencies for Effective Public Administration: A Study of Indian Administrative Service Officers.",
      journal: "Journal of Asian Public Policy, 11(1), 98-120.",
      doi: "https://www.tandfonline.com/doi/full/10.1080/17516234.2017.1353942"
    },
    {
      id: 16,
      authors: "Khatri, N., Gupta, V., & Varma, A.",
      year: "2017",
      title: "The relationship between HR capabilities and quality of patient care: The mediating role of proactive work behaviors.",
      journal: "Human Resource Management, 56(4), 673-691.",
      doi: "https://onlinelibrary.wiley.com/doi/full/10.1002/hrm.21794"
    },
    {
      id: 17,
      authors: "Gupta, V., Singh, S. & Bhattacharya, A.",
      year: "2017",
      title: "Relationships between Leadership, Work Engagement and Employee Innovative Performance: Empirical Evidence from the Indian R&D Context.",
      journal: "International Journal of Innovation Management, 21(7), 1-30.",
      doi: "https://www.worldscientific.com/doi/abs/10.1142/S1363919617500554"
    },
    {
      id: 18,
      authors: "Khatri, N., & Gupta, V.",
      year: "2016",
      title: "Effective implementation of health information technologies in US hospitals.",
      journal: "Health Care Management Review, 41(1), 11-21.",
      doi: "https://journals.lww.com/hcmrjournal/fulltext/2016/01000/effective_implementation_of_health_information.3.aspx"
    },
    {
      id: 19,
      authors: "Gupta, V., Agarwal, U., & Khatri, N.",
      year: "2016",
      title: "The relationships between perceived organizational support, affective commitment, psychological contract breach, organizational citizenship behavior, and work engagement.",
      journal: "Journal of Advanced Nursing, 72(11), 2806-2817.",
      doi: "https://onlinelibrary.wiley.com/doi/full/10.1111/jan.13043"
    },
    {
      id: 20,
      authors: "Gupta, V., & Singh, S.",
      year: "2015",
      title: "Leadership and Creative Performance Behaviors in R&D Laboratories: Examining the Role of Justice Perceptions.",
      journal: "Journal of Leadership and Organizational Studies, 22(1), 21-36.",
      doi: "https://jlo.sagepub.com/content/early/2014/01/05/1548051813517002"
    },
    {
      id: 21,
      authors: "Gupta, V., & Singh, S.",
      year: "2014",
      title: "Psychological Capital as a Mediator of the Relationship between Leadership and Creative Performance Behaviors: Empirical Evidence from the Indian R&D Sector.",
      journal: "The International Journal of Human Resource Management, 25(10), 1373-1394.",
      doi: "https://www.tandfonline.com/eprint/8JVJFdePeVr6cDq4a7mN/full"
    },
    {
      id: 22,
      authors: "Gupta, V., Singh, S., & Khatri, N.",
      year: "2013",
      title: "Creativity in Research and Development Laboratories: A New Scale for Leader Behaviors.",
      journal: "IIMB Management Review, 25(2), 83-90.",
      doi: "https://www.sciencedirect.com/science/article/pii/S0970389613000177"
    },
    {
      id: 23,
      authors: "Gupta, V. & Singh, S.",
      year: "2013",
      title: "How Leaders Impact Employee Creativity: A Study of Indian R&D Laboratories.",
      journal: "Management Research Review, 36(1), 66-88.",
      doi: "https://www.emerald.com/journals.htm?issn=2040-8269&volume=36&issue=1&articleid=17068408&show=abstract"
    },
    {
      id: 24,
      authors: "Gupta, V. & Singh, S.",
      year: "2013",
      title: "An Empirical Study of the Dimensionality of Organizational Justice and its Relationship with Organizational Citizenship Behavior in the Indian Context.",
      journal: "The International Journal of Human Resource Management, 24(6), 1277-1299.",
      doi: "https://www.tandfonline.com/doi/full/10.1080/09585192.2012.709188"
    },
    {
      id: 25,
      authors: "Gupta, V. & Kumar, S.",
      year: "2013",
      title: "Impact of Performance Appraisal Justice on Employee Engagement: A Study of Indian Professionals.",
      journal: "Employee Relations: The International Journal, 35(1), 61-78.",
      doi: "https://www.emerald.com/fwd.htm?id=aob&ini=aob&doi=10.1108/01425451311279410"
    }
  ];

  // Admin functions for managing publications
  const addPublication = async (newPub) => {
    try {
      const pubWithId = { ...newPub, id: Date.now() };
      let currentPubs = researchData?.featured_publications;
      // If Firestore has no publications or an empty array, merge with hardcoded 25
      if (!currentPubs || currentPubs.length === 0) {
        currentPubs = featuredPublications;
      }
      await updateDoc(doc(db, 'content', 'research'), {
        featured_publications: [...currentPubs, pubWithId]
      });
      setShowAddPub(false);
      alert('Publication added successfully!');
    } catch (error) {
      console.error('Error adding publication:', error);
      alert('Failed to add publication');
    }
  };

  const updatePublication = async (updatedPub) => {
    try {
      const currentPubs = researchData?.featured_publications || featuredPublications;
      const updatedPubs = currentPubs.map(p => p.id === updatedPub.id ? updatedPub : p);
      await updateDoc(doc(db, 'content', 'research'), {
        featured_publications: updatedPubs
      });
      setEditingPub(null);
      alert('Publication updated successfully!');
    } catch (error) {
      console.error('Error updating publication:', error);
      alert('Failed to update publication');
    }
  };

  const deletePublication = async (pub) => {
    if (!confirm('Delete this publication?')) return;
    try {
      const currentPubs = researchData?.featured_publications || featuredPublications;
      const updatedPubs = currentPubs.filter(p => p.id !== pub.id);
      await updateDoc(doc(db, 'content', 'research'), {
        featured_publications: updatedPubs
      });
      alert('Publication deleted successfully!');
    } catch (error) {
      console.error('Error deleting publication:', error);
      alert('Failed to delete publication');
    }
  };

  const addBookChapter = async (newChapter) => {
    try {
      const chapterWithId = { ...newChapter, id: Date.now() };
      const currentChapters = researchData?.book_chapters || bookChapters;
      await updateDoc(doc(db, 'content', 'research'), {
        book_chapters: [...currentChapters, chapterWithId]
      });
      setShowAddChapter(false);
      alert('Chapter added successfully!');
    } catch (error) {
      console.error('Error adding chapter:', error);
      alert('Failed to add chapter');
    }
  };

  const updateBookChapter = async (updatedChapter) => {
    try {
      const currentChapters = researchData?.book_chapters || bookChapters;
      const updatedChapters = currentChapters.map(c => c.id === updatedChapter.id ? updatedChapter : c);
      await updateDoc(doc(db, 'content', 'research'), {
        book_chapters: updatedChapters
      });
      setEditingChapter(null);
      alert('Chapter updated successfully!');
    } catch (error) {
      console.error('Error updating chapter:', error);
      alert('Failed to update chapter');
    }
  };

  // Admin functions for managing special issues (auto-updates via Firestore)
  const addSpecialIssue = async (newIssue) => {
    try {
      const issueWithId = { ...newIssue, id: Date.now() };
      const current = researchData?.special_issues;
      const base = (current && current.length > 0) ? current : specialIssues;
      await updateDoc(doc(db, 'content', 'research'), {
        special_issues: [...base, issueWithId]
      });
      setShowAddSpecialIssue(false);
      alert('Special issue added successfully!');
    } catch (err) {
      console.error('Error adding special issue', err);
      alert('Failed to add special issue');
    }
  };

  const updateSpecialIssue = async (updatedIssue, idx = null) => {
    try {
      const current = researchData?.special_issues || specialIssues;
      // try matching by id first
      const updated = current.map(i => (i.id && updatedIssue.id && i.id === updatedIssue.id) ? updatedIssue : i);
      await updateDoc(doc(db, 'content', 'research'), {
        special_issues: updated
      });
      setEditingSpecialIssue(null);
      alert('Special issue updated successfully!');
    } catch (err) {
      console.error('Error updating special issue', err);
      alert('Failed to update special issue');
    }
  };

  const deleteSpecialIssue = async (idxOrIssue) => {
    if (!confirm('Delete this special issue?')) return;
    try {
      const current = researchData?.special_issues || specialIssues;
      let updated;
      if (typeof idxOrIssue === 'number') {
        updated = current.filter((_, i) => i !== idxOrIssue);
      } else {
        updated = current.filter(i => i.id !== idxOrIssue.id);
      }
      await updateDoc(doc(db, 'content', 'research'), {
        special_issues: updated
      });
      alert('Special issue deleted successfully!');
    } catch (err) {
      console.error('Error deleting special issue', err);
      alert('Failed to delete special issue');
    }
  };

  const deleteBookChapter = async (chapter) => {
    if (!confirm('Delete this book chapter?')) return;
    try {
      const currentChapters = researchData?.book_chapters || bookChapters;
      const updatedChapters = currentChapters.filter(c => c.id !== chapter.id);
      await updateDoc(doc(db, 'content', 'research'), {
        book_chapters: updatedChapters
      });
      alert('Chapter deleted successfully!');
    } catch (error) {
      console.error('Error deleting chapter:', error);
      alert('Failed to delete chapter');
    }
  };

  const addCase = async (newCase) => {
    try {
      const caseWithId = { ...newCase, id: Date.now() };
      const currentCases = researchData?.cases || cases;
      await updateDoc(doc(db, 'content', 'research'), {
        cases: [...currentCases, caseWithId]
      });
      setShowAddCase(false);
      alert('Case added successfully!');
    } catch (error) {
      console.error('Error adding case:', error);
      alert('Failed to add case');
    }
  };

  const deleteCase = async (caseItem) => {
    if (!confirm('Delete this case?')) return;
    try {
      const currentCases = researchData?.cases || cases;
      const updatedCases = currentCases.filter(c => c.id !== caseItem.id);
      await updateDoc(doc(db, 'content', 'research'), {
        cases: updatedCases
      });
      alert('Case deleted successfully!');
    } catch (error) {
      console.error('Error deleting case:', error);
      alert('Failed to delete case');
    }
  };

  // Editable PhD Students (Firestore-backed)
  const phdStudents = researchData?.phdStudents || { chairperson: [], member: [] };

  // Admin handlers for PhD Students
  const updatePhdStudents = async (newData) => {
    try {
      await updateDoc(doc(db, 'content', 'research'), { phdStudents: newData });
    } catch (err) {
      alert('Failed to update PhD students');
    }
  };

  // Add, edit, delete for Chairperson
  const addChairperson = (student) => {
    updatePhdStudents({
      ...phdStudents,
      chairperson: [...phdStudents.chairperson, student]
    });
  };
  const editChairperson = (idx, student) => {
    const arr = [...phdStudents.chairperson];
    arr[idx] = student;
    updatePhdStudents({ ...phdStudents, chairperson: arr });
  };
  const deleteChairperson = (idx) => {
    const arr = phdStudents.chairperson.filter((_, i) => i !== idx);
    updatePhdStudents({ ...phdStudents, chairperson: arr });
  };

  // Add, edit, delete for Member
  const addMember = (student) => {
    updatePhdStudents({
      ...phdStudents,
      member: [...phdStudents.member, student]
    });
  };
  const editMember = (idx, student) => {
    const arr = [...phdStudents.member];
    arr[idx] = student;
    updatePhdStudents({ ...phdStudents, member: arr });
  };
  const deleteMember = (idx) => {
    const arr = phdStudents.member.filter((_, i) => i !== idx);
    updatePhdStudents({ ...phdStudents, member: arr });
  };

  const bookChapters = [
    {
      id: 1,
      authors: "Gupta, V. and Basant, A.",
      year: "2025",
      title: "HEAL: Defining a new POB construct.",
      book: "In C. L. Cooper, S. Pattnaik & R. V. Rodriguez (Eds.) Advancing Positive Organizational Behaviour. Routledge."
    },
    {
      id: 2,
      authors: "Gupta, V.",
      year: "2023",
      title: "TREAT Leadership Framework: A Knowledge-Based Theory of the Global Firm.",
      book: "In A. Akande (Ed.). Springer Handbook on Globalization, Politics in Organizations, Human Rights, and Populism: Reimagining People, Power, and Places. Springer.",
      doi: "https://link.springer.com/chapter/10.1007/978-3-031-17203-8_28"
    },
    {
      id: 3,
      authors: "Gupta, V. & Gopalan, N.",
      year: "2021",
      title: "L-E-A-P: A new model of organisational culture for knowledge-based organisations.",
      book: "In Lepley, M. T. (Ed.) Human Centered Management: Principles and Practices. Routledge.",
      doi: "https://www.taylorfrancis.com/chapters/edit/10.4324/9781003092025-4-5/new-organizational-culture-framework-knowledge-intensive-organizations-vishal-gupta-neena-gopalan"
    },
    {
      id: 4,
      authors: "Gupta, V., Bhattacharya, S. & Gopalan, N.",
      year: "2021",
      title: "Emotions, emotional intelligence and conflict management: A conceptual framework.",
      book: "In Lepley, M. T. (Ed.) Human Centered Management: Principles and Practices. Routledge.",
      doi: "https://www.taylorfrancis.com/chapters/edit/10.4324/9781003094463-4-6/emotions-emotional-intelligence-conflict-management-vishal-gupta-shalini-bhattacharya-neena-gopalan"
    },
    {
      id: 5,
      authors: "Syal, A. & Gupta, V.",
      year: "2021",
      title: "Leveraging social media to enable leadership during crises: Linking TREAT leader behaviours and BOAT leader attributes.",
      book: "In A. Akande, B. Adetoun, & M. Adewuyi (Eds.), The Global Nature of Organizational Science Phenomena. Hauppauge, NY: Nova Science Publishers.",
      doi: "https://search.bvsalud.org/global-literature-on-novel-coronavirus-2019-ncov/resource/en/covidwho-1469291"
    },
    {
      id: 6,
      authors: "Singh, S. & Gupta, V.",
      year: "2019",
      title: "Organizational Performance Research in India: A Review and Future Research Agenda.",
      book: "In Misra, G. (Ed.) The Sixth Indian Council for Social Science Research (ICSSR) Survey of Psychology in India (pp. 1-93), Oxford University Press: New Delhi.",
      doi: "https://academic.oup.com/book/36805/chapter-abstract/321958320?redirectedFrom=fulltext"
    },
    {
      id: 7,
      authors: "Gupta D., & Gupta V.",
      year: "2018",
      title: "Effective Policing in a VUCA Environment: Lessons from a Dark Network.",
      book: "In: Dhir S., Sushil (eds) Flexible Strategies in VUCA Markets (pp. 89-111). Flexible Systems Management. Springer, Singapore.",
      doi: "https://link.springer.com/chapter/10.1007/978-981-10-8926-8_7"
    },
    {
      id: 8,
      authors: "Gupta, D. & Gupta, V.",
      year: "2017",
      title: "Why are Dark Networks Resilient and What can the Security Forces Learn from them? A Study of Strategies, Military Tactics and Organizational Structure of CPI (Maoists).",
      book: "Proceedings of the International Conference on 'Strategies in Volatile and Uncertain Environment for Emerging Markets (pp. 411-417). New Delhi: IIT Delhi.",
      doi: "https://strategiesinemergingmarkets.com/"
    },
    {
      id: 9,
      authors: "Gupta, V., Singh, S. & Bhattacharya, A.",
      year: "2014",
      title: "Inspiring creativity in Indian R&D organizations: Examining the role of leadership, justice perceptions, motivation and psychological capital.",
      book: "In Banerjee, A. (Ed.) Emerging Issues in Management: Proceedings of Pan-IIM World Management Conference (pp. 45-53). New Delhi: Emerald."
    },
    {
      id: 10,
      authors: "Gupta, V. & Singh, S.",
      year: "2011",
      title: "Development of a Causal Framework Linking Leadership to Employee Creativity.",
      book: "Proceedings of the 2011 Meeting of the Southern Management Association, Savannah, US, 13-18.",
      doi: "http://southernmanagement.org/meetings/2011/proceedings/PaperID106.pdf"
    },
    {
      id: 11,
      authors: "Gupta, V. & Singh, S.",
      year: "2010",
      title: "Developing a Set of High Performance HRM Practices and Exploring its Relationship with OCB and Organizational Justice.",
      book: "Proceedings of the 2010 Meeting of the Southern Management Association, Florida, US, 464-469.",
      doi: "https://southernmanagement.org/meetings/2010/proceedings/PaperID232.pdf"
    }
  ];

  const specialIssues = [
    {
      title: "IIMB Management Review Special Issue",
      description: "Based on the Seventh Indian Academy of Management (INDAM) conference",
      link: "https://www.sciencedirect.com/journal/iimb-management-review"
    },
    {
      title: "Business Perspectives and Research Special Issue",
      description: "Based on the Sixth INDAM conference",
      link: "https://journals.sagepub.com/toc/bpra/9/2"
    },
    {
      title: "South Asian Journal of Business Studies Special Issue",
      description: "Based on the Sixth INDAM conference",
      link: "#"
    },
    {
      title: "Vikalpa Special Issue",
      description: "On the Fourth Pan-IIM World Management conference",
      link: "#"
    }
  ];

  const cases = [
    {
      id: 1,
      title: "Pramukh Swami Maharaj Shatabdi Mahotsav: Event Scale",
      code: "IIMA/ADCLOD0003",
      link: "https://cases.iima.ac.in/index.php/pramukh-swami-maharaj-shatabdi-mahotsav-event-scale.html"
    },
    {
      id: 2,
      title: "Pramukh Swami Maharaj Shatabdi Mahotsav: Service-Orientation, People Management and Leadership",
      code: "IIMA/ADCLOD0004",
      link: "https://cases.iima.ac.in/index.php/pramukh-swami-maharaj-shatabdi-mahotsav-service-orientation-people-management-and-leadership.html"
    },
    {
      id: 3,
      title: "Tata vs Mistry: Struggle for Succession and Governance",
      code: "IIMA/0246 - A, B, C, D",
      link: "https://cases.iima.ac.in/index.php/tata-vs-mistry-a-struggle-for-succession-and-governance.html"
    },
    {
      id: 4,
      title: "VIKAS and SAVE: Combining cause with commerce",
      code: "IIMA/OB0239",
      link: "https://cases.iima.ac.in/index.php/vikas-and-save-combining-cause-with-commerce.html"
    },
    {
      id: 5,
      title: "Aditya Kumar: Office Politics and managing upwards",
      code: "IIMA/OB0236",
      link: "https://cases.iima.ac.in/index.php/aditya-kumar-office-politics-and-managing-upwards.html"
    },
    {
      id: 6,
      title: "Vasudha's Dismay",
      code: "IIMA/OB0230",
      link: "https://cases.iima.ac.in/index.php/vasudha-s-dismay.html"
    },
    {
      id: 7,
      title: "Mohan Dixit",
      code: "IIMA/OB0233, IIMA/OB0233TN",
      link: "https://cases.iima.ac.in/index.php/catalogsearch/result/?attr=0&q=OB0233"
    },
    {
      id: 8,
      title: "Meera Nair at PhoenixWay: Which Way to Go",
      code: "IIMA/OB0231, IIMA/OB0231TN",
      link: "https://cases.iima.ac.in/index.php/catalogsearch/result/?attr=0&q=OB0231"
    },
    {
      id: 9,
      title: "GAIL 'Saksham' Program: Remoulding the Future",
      code: "IIMA/PSG0123, IIMA/PSG0123TN",
      link: "https://cases.iima.ac.in/index.php/gail-saksham-program-remoulding-the-future.html"
    },
    {
      id: 10,
      title: "CSIR Tech Private Limited: Facilitating Lab to Market Journeys",
      code: "IIMA/OB0218, IIMA/OB0218S",
      link: "https://www.iveypublishing.ca/s/?id=85693"
    },
    {
      id: 11,
      title: "Performance Management at IRD Corporation (A) and (B)",
      code: "IIMA/P&IR0227A,B",
      link: "https://cases.iima.ac.in/index.php/performance-management-at-ird-corporation-a.html"
    }
  ];

  const technicalNotes = [
    {
      title: "A Note on Decision-Making",
      code: "IIMA/OB0232TEC",
      link: "https://cases.iima.ac.in/index.php/performance-management-at-ird-corporation-a.html"
    },
    {
      title: "Understanding the Design of Organizations",
      code: "IIMA/OB0226TEC",
      link: "https://cases.iima.ac.in/index.php/new-age-organisations-managing-matrix-structures.html"
    },
    {
      title: "Stress and Our Inner Game",
      code: "IIMA/OB0228TEC",
      link: "https://cases.iima.ac.in/index.php/the-inner-game-of-peak-performance.html"
    },
    {
      title: "Appreciative Inquiry: A Positive Way of Managing Change",
      code: "IIMA/OB0229TEC",
      link: "https://cases.iima.ac.in/index.php/appreciative-inquiry-a-positive-way-of-managing-change.html"
    },
    {
      title: "Teaching note for 'The Cybertech Project (A) and (B)'",
      code: "HBS No. 695-030 and 695-041 (IIMA/OB0214TN)"
    },
    {
      title: "Teaching note for 'The Audubon Zoo, 1993', an integrative case published in Daft (2007)",
      code: "IIMA/OB0215TN"
    }
  ];

  // Helper to parse a year/date from various fields and compare descending
  const parseYear = (item) => {
    if (!item) return 0;
    const y = item.year || item.date || '';
    const s = String(y).trim();
    const m = s.match(/(\d{4})/);
    if (m) return parseInt(m[1], 10);
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : 0;
  };

  const compareByYearDesc = (a, b) => parseYear(b) - parseYear(a);

  // Use Firestore data if available, otherwise use hardcoded data — always sort by year desc
  const displayPublications = (researchData?.featured_publications && researchData.featured_publications.length > 0)
    ? researchData.featured_publications.slice().sort(compareByYearDesc)
    : featuredPublications.slice().sort(compareByYearDesc);

  const filteredPublications = useMemo(() => {
    const q = pubSearch.trim().toLowerCase();
    const base = displayPublications.slice();
    if (!q) return base;
    return base.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.authors?.toLowerCase().includes(q) ||
      String(p.year || '').toLowerCase().includes(q) ||
      p.journal?.toLowerCase().includes(q)
    );
  }, [pubSearch, displayPublications]);

  const displayBookChapters = (researchData?.book_chapters || bookChapters).slice().sort(compareByYearDesc);
  const displayCases = researchData?.cases || cases;
  const displaySpecialIssues = (researchData?.special_issues && researchData.special_issues.length > 0)
    ? researchData.special_issues
    : specialIssues;

  // ── CHANGE 1: Total publications = journal articles + cases + technical notes + book chapters/proceedings
  const totalPublications =
    displayPublications.length +
    displayCases.length +
    technicalNotes.length +
    displayBookChapters.length;

  // ── CHANGE 2: Year range is computed from journal articles only (as before)
  const allYears = displayPublications.map(p => parseYear(p)).filter(y => y > 0);
  const yearRange = allYears.length > 0
    ? `${Math.min(...allYears)}–${Math.max(...allYears)}`
    : '—';

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-[#dce8f5] to-[#fff7ed] py-20 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center"
          >
            <div className="w-20 h-1 bg-[#f97316] mb-8 rounded-full mx-auto"></div>
            <h1 className="text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6">
              <EditableText
                collection="content"
                docId="research"
                field="page_heading"
                defaultValue={researchData?.page_heading || "Research"}
                className="text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
              />
            </h1>
            <p className="text-xl lg:text-2xl font-['Inter'] text-gray-600 max-w-3xl mx-auto">
              <EditableText
                collection="content"
                docId="research"
                field="page_description"
                defaultValue={researchData?.page_description || "Advancing knowledge in leadership, organizational behavior, and human resource management"}
                className="text-xl lg:text-2xl font-['Inter'] text-gray-600"
                multiline
              />
            </p>
          </motion.div>

          {/* Publications Dashboard */}
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
              }}>{totalPublications}</strong>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '.72rem',
                fontWeight: 500,
                color: '#9ca3af',
                letterSpacing: '.09em',
                textTransform: 'uppercase',
                marginTop: '2px'
              }}>Publications</span>
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
              }}>{yearRange}</strong>
              <span style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '.72rem',
                fontWeight: 500,
                color: '#9ca3af',
                letterSpacing: '.09em',
                textTransform: 'uppercase',
                marginTop: '2px'
              }}>Year Range</span>
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
              <a
                href="https://scholar.google.co.in/citations?user=_kfodNoAAAAJ&hl=en"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <strong style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: '#004B8D'
                }}>3,540+</strong>
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '.72rem',
                  fontWeight: 500,
                  color: '#9ca3af',
                  letterSpacing: '.09em',
                  textTransform: 'uppercase',
                  marginTop: '2px'
                }}>Citations</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 px-6 lg:px-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6">
            <a 
              href="https://scholar.google.co.in/citations?user=_kfodNoAAAAJ&hl=hi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#004B8D] hover:bg-[#E0B000] text-white px-6 py-3 rounded-lg font-['Inter'] font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <FiExternalLink /> Google Scholar Citations
            </a>
            <a 
              href="https://www.researchgate.net/profile/YOUR_PROFILE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#E0B000] hover:bg-[#003870] text-white px-6 py-3 rounded-lg font-['Inter'] font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <FiExternalLink /> ResearchGate Profile
            </a>
          </div>
        </div>
      </section>

      {/* Featured Publications */}
      <section className="py-16 px-6 lg:px-16 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
            className="mb-12"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="group">
                <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4 transition-colors duration-300">
                  Featured Peer-reviewed Publications
                </h2>
                <div className="w-24 h-1 bg-[#004B8D] rounded-full group-hover:bg-[#F5C400] group-hover:w-32 transition-all duration-300"></div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowAddPub(true)}
                  className="flex items-center gap-2 bg-[#004B8D] hover:bg-[#003870] text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  <FiPlus /> Add Publication
                </button>
              )}
            </div>

            {/* Search bar */}
            <div className="mt-6 relative max-w-xl">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={pubSearch}
                onChange={e => setPubSearch(e.target.value)}
                placeholder="Search by title, author, year, or journal…"
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004B8D] text-sm"
              />
              {pubSearch && (
                <button
                  onClick={() => setPubSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
            {pubSearch && (
              <p className="mt-2 text-sm text-gray-500">
                {filteredPublications.length} result{filteredPublications.length !== 1 ? 's' : ''} for &ldquo;{pubSearch}&rdquo;
              </p>
            )}
          </motion.div>

          {showAddPub && isAdmin && (
            <div className="mb-6 p-6 bg-white rounded-xl border-2 border-[#004B8D] shadow-lg">
              <PublicationForm
                onSave={addPublication}
                onCancel={() => setShowAddPub(false)}
              />
            </div>
          )}

          <div className="space-y-6">
            {filteredPublications.map((pub, index) => (
              <motion.div
                key={pub.id || index}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOptions}
                variants={fadeInUp}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-[#004B8D] relative group"
              >
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingPub(pub)}
                      className="p-2 bg-[#004B8D] hover:bg-[#003870] text-white rounded-lg"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => deletePublication(pub)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                )}
                <p className="font-['Inter'] text-gray-700 mb-2">
                  <span className="font-semibold text-[#1a1a1a]">{pub.authors}</span> ({pub.year}). {pub.title}
                </p>
                <p className="font-['Inter'] text-gray-600 italic mb-2">{pub.journal}</p>
                {pub.doi && (
                  <a 
                    href={pub.doi} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#004B8D] hover:text-[#003870] font-['Inter'] text-sm inline-flex items-center gap-1"
                  >
                    <FiExternalLink size={14} /> View Publication
                  </a>
                )}
              </motion.div>
            ))}

            {editingPub && isAdmin && (
              <div className="mt-6 p-6 bg-white rounded-xl border-2 border-[#004B8D] shadow-lg">
                <PublicationForm
                  publication={editingPub}
                  onSave={updatePublication}
                  onCancel={() => setEditingPub(null)}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cases and Technical Notes */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Cases */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#fb923c] rounded-lg flex items-center justify-center">
                  <FiFileText className="text-white text-xl" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
                  Cases
                </h2>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowAddCase(true)}
                  className="flex items-center gap-2 bg-[#fb923c] hover:bg-[#ea580c] text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                >
                  <FiPlus size={16} /> Add Case
                </button>
              )}
            </div>

            {showAddCase && isAdmin && (
              <div className="mb-4 p-4 bg-white rounded-lg border-2 border-[#fb923c]">
                <CaseForm
                  onSave={addCase}
                  onCancel={() => setShowAddCase(false)}
                />
              </div>
            )}

            <ul className="space-y-3">
              {displayCases.map((caseItem, index) => (
                <li key={caseItem.id || index} className="font-['Inter'] text-gray-700 pl-4 border-l-2 border-[#fb923c] hover:bg-[#fff7ed] p-2 transition-colors relative group">
                  {isAdmin && (
                    <button
                      onClick={() => deleteCase(caseItem)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">{caseItem.title}</span>
                    <span className="text-sm text-gray-500">({caseItem.code})</span>
                    {caseItem.link && (
                      <a 
                        href={caseItem.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#fb923c] hover:text-[#ea580c] text-sm inline-flex items-center gap-1 mt-1"
                      >
                        <FiExternalLink size={12} /> View Case
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Technical Notes */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#004B8D] rounded-lg flex items-center justify-center">
                <FiBookOpen className="text-white text-xl" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
                Technical Notes
              </h2>
            </div>
            <ul className="space-y-3">
              {technicalNotes.map((note, index) => (
                <li key={index} className="font-['Inter'] text-gray-700 pl-4 border-l-2 border-[#004B8D] hover:bg-[#dce8f5] p-2 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">{note.title}</span>
                    <span className="text-sm text-gray-500">({note.code})</span>
                    {note.link && (
                      <a 
                        href={note.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#004B8D] hover:text-[#003870] text-sm inline-flex items-center gap-1 mt-1"
                      >
                        <FiExternalLink size={12} /> View Note
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Book Chapters */}
      <section className="py-16 px-6 lg:px-16 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
            className="mb-12"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="group">
                <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4 transition-colors duration-300">
                  Book Chapters & Conference Proceedings
                </h2>
                <div className="w-24 h-1 bg-[#004B8D] rounded-full group-hover:bg-[#F5C400] group-hover:w-32 transition-all duration-300"></div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => setShowAddChapter(true)}
                  className="flex items-center gap-2 bg-[#004B8D] hover:bg-[#003870] text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  <FiPlus /> Add Chapter
                </button>
              )}
            </div>
          </motion.div>

          {showAddChapter && isAdmin && (
            <div className="mb-6 p-6 bg-white rounded-xl border-2 border-[#004B8D] shadow-lg">
              <BookChapterForm
                onSave={addBookChapter}
                onCancel={() => setShowAddChapter(false)}
              />
            </div>
          )}

          <div className="space-y-6">
            {displayBookChapters.map((chapter, index) => (
              <motion.div
                key={chapter.id || index}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOptions}
                variants={fadeInUp}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-[#004B8D] relative group"
              >
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingChapter(chapter)}
                      className="p-2 bg-[#004B8D] hover:bg-[#003870] text-white rounded-lg"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteBookChapter(chapter)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                )}
                <p className="font-['Inter'] text-gray-700 mb-2">
                  <span className="font-semibold text-[#1a1a1a]">{chapter.authors}</span> ({chapter.year}). {chapter.title}
                </p>
                <p className="font-['Inter'] text-gray-600 italic mb-2">{chapter.book}</p>
                {chapter.doi && (
                  <a 
                    href={chapter.doi} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#004B8D] hover:text-[#003870] font-['Inter'] text-sm inline-flex items-center gap-1"
                  >
                    <FiExternalLink size={14} /> View Chapter
                  </a>
                )}
              </motion.div>
            ))}

            {editingChapter && isAdmin && (
              <div className="mt-6 p-6 bg-white rounded-xl border-2 border-[#004B8D] shadow-lg">
                <BookChapterForm
                  chapter={editingChapter}
                  onSave={updateBookChapter}
                  onCancel={() => setEditingChapter(null)}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Special Issues */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
            className="mb-12"
          >
            <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4">
              Special Issues Edited
            </h2>
            <div className="w-24 h-1 bg-[#f97316] rounded-full"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {isAdmin && (
              <div className="md:col-span-2 flex justify-end">
                <button
                  onClick={() => { setShowAddSpecialIssue(true); setEditingSpecialIssue(null); }}
                  className="flex items-center gap-2 bg-[#f97316] hover:bg-[#ea580c] text-white px-4 py-2 rounded-lg font-semibold transition-all mb-4"
                >
                  <FiPlus /> Add Special Issue
                </button>
              </div>
            )}

            {displaySpecialIssues.map((issue, index) => (
              <motion.div
                key={issue.id || index}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOptions}
                variants={fadeInUp}
                className="bg-linear-to-br from-[#fff7ed] to-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow border-l-4 border-[#f97316] relative group"
              >
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingSpecialIssue({ ...issue, idx: index })}
                      className="p-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteSpecialIssue(index)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                )}
                <h3 className="text-xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-2">
                  {issue.title}
                </h3>
                <p className="font-['Inter'] text-gray-600 mb-3">{issue.description}</p>
                {issue.link !== "#" && (
                  <a 
                    href={issue.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#f97316] hover:text-[#ea580c] font-['Inter'] text-sm inline-flex items-center gap-1 font-semibold"
                  >
                    <FiExternalLink size={14} /> View Journal
                  </a>
                )}
              </motion.div>
            ))}
          </div>

          {(showAddSpecialIssue || editingSpecialIssue) && isAdmin && (
            <div className="mt-6 p-6 bg-white rounded-xl border-2 border-[#f97316] shadow-lg">
              <SpecialIssueForm
                issue={editingSpecialIssue}
                onSave={(data) => {
                  if (editingSpecialIssue) {
                    updateSpecialIssue(data, editingSpecialIssue.idx);
                  } else {
                    addSpecialIssue(data);
                  }
                  setShowAddSpecialIssue(false);
                  setEditingSpecialIssue(null);
                }}
                onCancel={() => { setShowAddSpecialIssue(false); setEditingSpecialIssue(null); }}
              />
            </div>
          )}
        </div>
      </section>

      {/* PhD Students */}
      <section className="py-16 px-6 lg:px-16 bg-[#dce8f5]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
            className="mb-12 text-center group"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 bg-[#004B8D] rounded-full flex items-center justify-center">
                <FiUsers className="text-white text-2xl" />
              </div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4 transition-colors duration-300">
              PhD Students Guided
            </h2>
            <div className="w-24 h-1 bg-[#004B8D] rounded-full mx-auto group-hover:bg-[#F5C400] group-hover:w-32 transition-all duration-300"></div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* TAC Chairperson */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOptions}
              variants={fadeInUp}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6">
                As TAC Chairperson
              </h3>
              <div className="space-y-4">
                {phdStudents.chairperson.map((student, index) => (
                  <div key={index} className="border-l-4 border-[#004B8D] pl-4 py-2 hover:bg-[#dce8f5] transition-colors flex items-center justify-between">
                    <div>
                      <p className="font-['Inter'] font-semibold text-[#1a1a1a]">{student.name}</p>
                      <p className="font-['Inter'] text-sm text-gray-600">{student.position}</p>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button onClick={() => {
                          const name = prompt('Edit Name', student.name);
                          const position = prompt('Edit Position', student.position);
                          if (name && position) editChairperson(index, { name, position });
                        }} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => deleteChairperson(index)} className="text-red-500 hover:underline">Delete</button>
                      </div>
                    )}
                  </div>
                ))}
                {isAdmin && (
                  <button onClick={() => {
                    const name = prompt('Student Name (with institute)');
                    const position = prompt('Position/Status');
                    if (name && position) addChairperson({ name, position });
                  }} className="mt-2 px-3 py-1 bg-[#004B8D] text-white rounded hover:bg-[#003366]">+ Add Chairperson</button>
                )}
              </div>
            </motion.div>

            {/* TAC Member */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={viewportOptions}
              variants={fadeInUp}
              className="bg-white p-8 rounded-xl shadow-lg"
            >
              <h3 className="text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6">
                As TAC Member
              </h3>
              <div className="space-y-3">
                {phdStudents.member.map((student, index) => (
                  <div key={index} className="border-l-4 border-[#fb923c] pl-4 py-2 hover:bg-[#fff7ed] transition-colors flex items-center justify-between">
                    <p className="font-['Inter'] text-gray-700">{student}</p>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button onClick={() => {
                          const newVal = prompt('Edit Member', student);
                          if (newVal) editMember(index, newVal);
                        }} className="text-orange-600 hover:underline">Edit</button>
                        <button onClick={() => deleteMember(index)} className="text-red-500 hover:underline">Delete</button>
                      </div>
                    )}
                  </div>
                ))}
                {isAdmin && (
                  <button onClick={() => {
                    const newVal = prompt('Member Name (with details)');
                    if (newVal) addMember(newVal);
                  }} className="mt-2 px-3 py-1 bg-[#fb923c] text-white rounded hover:bg-[#ea580c]">+ Add Member</button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Publication Form Component
function PublicationForm({ publication, onSave, onCancel }) {
  const [formData, setFormData] = useState(publication || {
    authors: '',
    year: new Date().getFullYear().toString(),
    title: '',
    journal: '',
    doi: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-2xl font-bold mb-4">
        {publication ? 'Edit Publication' : 'Add New Publication'}
      </h3>
      <div>
        <label className="block text-sm font-semibold mb-2">Authors</label>
        <input
          type="text"
          value={formData.authors}
          onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D]"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Year</label>
        <input
          type="text"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D]"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Title</label>
        <textarea
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D]"
          rows={3}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">Journal</label>
        <input
          type="text"
          value={formData.journal}
          onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D]"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2">DOI/Link (optional)</label>
        <input
          type="url"
          value={formData.doi}
          onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004B8D]"
        />
      </div>
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg font-semibold transition-colors"
        >
          <FiX className="inline mr-2" /> Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-[#004B8D] hover:bg-[#003870] text-white rounded-lg font-semibold transition-colors"
        >
          <FiSave className="inline mr-2" /> Save
        </button>
      </div>
    </form>
  );
}

// Book Chapter Form Component
function BookChapterForm({ chapter, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    chapter || {
      authors: '',
      year: new Date().getFullYear().toString(),
      title: '',
      book: '',
      doi: ''
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-xl font-bold mb-3">{chapter ? 'Edit Book Chapter' : 'Add New Book Chapter'}</h3>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold mb-1">Authors</label>
          <input
            type="text"
            value={formData.authors}
            onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Year</label>
          <input
            type="text"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Book/Conference</label>
        <input
          type="text"
          value={formData.book}
          onChange={(e) => setFormData({ ...formData, book: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">DOI/Link (optional)</label>
        <input
          type="url"
          value={formData.doi}
          onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#fb923c] hover:bg-[#ea580c] text-white rounded-lg text-sm font-semibold"
        >
          Save Chapter
        </button>
      </div>
    </form>
  );
}

// Special Issue Form Component
function SpecialIssueForm({ issue, onSave, onCancel }) {
  const [form, setForm] = useState(issue || { title: '', description: '', link: '#' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-2xl font-bold mb-4">{issue ? 'Edit Special Issue' : 'Add Special Issue'}</h3>
      <div>
        <label className="block text-sm font-semibold mb-1">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows={3}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Journal Link (optional)</label>
        <input
          type="url"
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg font-semibold">Save</button>
      </div>
    </form>
  );
}

// Case Form Component
function CaseForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    link: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ title: '', code: '', link: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-lg font-bold mb-3">Add New Case</h3>
      <div>
        <label className="block text-sm font-semibold mb-1">Case Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Case Code</label>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="e.g. IIMA/OB0230"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Link (optional)</label>
        <input
          type="url"
          value={formData.link}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg text-sm font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#fb923c] hover:bg-[#ea580c] text-white rounded-lg text-sm font-semibold"
        >
          Save Case
        </button>
      </div>
    </form>
  );
}