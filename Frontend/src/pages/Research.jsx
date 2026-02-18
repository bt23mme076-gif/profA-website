import { motion } from 'framer-motion';
import { FiExternalLink, FiBookOpen, FiUsers, FiFileText } from 'react-icons/fi';

export default function Research() {
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

  const featuredPublications = [
    {
      authors: "Kuril, S., Gupta, V., Kakkar, S., & Gupta, R.",
      year: "2025",
      title: "Public Sector Motivation: Construct Definition, Measurement, and Validation.",
      journal: "Public Administration Quarterly, 0(0).",
      doi: "https://doi.org/10.1177/07349149251359153"
    },
    {
      authors: "George, P. R. & Gupta, V.",
      year: "2024",
      title: "Environmental identity and perceived salience of policy issues in coastal communities: a moderated-mediation analysis.",
      journal: "Policy Science, 57, 787-822."
    },
    {
      authors: "Khan, F., Preeti, Gupta, V.",
      year: "2024",
      title: "Examining the relationships between instructional leadership, teacher self-efficacy and job satisfaction: a study of primary schools in India.",
      journal: "Journal of Educational Administration, forthcoming."
    },
    {
      authors: "Gupta, V., Mittal, S., Ilavarasan, P. V., & Budhwar, P.",
      year: "2024",
      title: "Pay-for-performance, procedural justice, OCB and job performance: A sequential mediation model.",
      journal: "Personnel Review, 53(1), 136-154."
    },
    {
      authors: "Gopakumar, K. V. & Gupta, V.",
      year: "2024",
      title: "Combining profit and purpose: Paradoxical leadership skills and social–business tensions during the formation and sustenance of a social enterprise.",
      journal: "Nonprofit Management & Leadership, 34, 489-522.",
      doi: "https://doi.org/10.1002/nml.21580"
    },
    {
      authors: "Singhal, S. & Gupta, V.",
      year: "2022",
      title: "Religiosity and homophobia: Examining the impact of perceived importance of childbearing, hostile sexism and gender.",
      journal: "Sexuality Research and Social Policy, 19, 1636-1649."
    },
    {
      authors: "Mittal, S., Gupta, V. & Mottiani, M.",
      year: "2022",
      title: "Examining the linkages between brand love, affective commitment, PWOM and turnover intentions: A social identity theory perspective.",
      journal: "IIMB Management Review, 34(1), 7-17."
    },
    {
      authors: "Kuril, S., Gupta. V. & Chand, V. S.",
      year: "2021",
      title: "Relationship between Negative Teacher Behaviors and Student Engagement: Evidence from India.",
      journal: "International Journal of Educational Research, 109, 1-19."
    },
    {
      authors: "Bhayana, C., Gupta, V., & Sharda, K.",
      year: "2021",
      title: "Exploring dynamics within multigenerational teams with millennials: A research framework.",
      journal: "Business Perspectives and Research, 9(2), 252-268."
    },
    {
      authors: "Chattopadhyay, P, George, E., Li, J. & Gupta, V.",
      year: "2020",
      title: "Geographical dissimilarity and team member influence: Do emotions experienced in the initial team meeting matter?",
      journal: "Academy of Management Journal, 63(6), 1807-1839."
    },
    {
      authors: "Gupta, V.",
      year: "2020",
      title: "Relationships between leadership, motivation, and employee-level innovation: Evidence from India.",
      journal: "Personnel Review, 49(7), 1363-1379."
    },
    {
      authors: "Pandey, A., Gupta, V., & Gupta, R.",
      year: "2019",
      title: "Spirituality and Innovative Behaviour in Teams: Examining the Mediating Role of Team Learning.",
      journal: "IIMB Management Review, 31(2), 116-126."
    }
  ];

  const phdStudents = {
    chairperson: [
      { name: "Ananya Syal (IIMA)", position: "Assistant Professor, IIM Amritsar" },
      { name: "Vedant Dev (IIMA)", position: "Faculty, Ahmedabad University" },
      { name: "Lokesh Malviya", position: "ABD (IIMA, OB area)" },
      { name: "Anmol Basant", position: "ABD (IIMA, OB area)" },
      { name: "Harish Premi", position: "ABD (IIMA, RJMCEI)" }
    ],
    member: [
      "Bhumi Trivedi (HRM, IIMA)",
      "Furkan Khan (RJMCEI, IIMA)",
      "Parth Soni (RJMCEI, IIMA)",
      "Sharad Sharma (IS area, IIMA): Indian Railways",
      "Samvet Kuril (RJMCEI, IIMA): Faculty, Ahmedabad University",
      "Nycil George (Strategy area, IIMA) - Faculty, IIM Kozhikode",
      "Shiva Kakkar (OB area, IIMA) - Faculty, IIM Nagpur",
      "Vijayta Doshi (OB area, IIMA) - Faculty, IIM Udaipur",
      "Smriti Agarwalla (OB area, IIMA)",
      "Ritika Singh (HRM area, Nirma University) - Faculty, DY Patil University"
    ]
  };

  const cases = [
    "Pramukh Swami Maharaj Shatabdi Mahotsav: Event Scale (IIMA/ADCLOD0003)",
    "Pramukh Swami Maharaj Shatabdi Mahotsav: Service-Orientation, People Management and Leadership (IIMA/ADCLOD0004)",
    "Tata vs Mistry: Struggle for Succession and Governance (IIMA/0246 - A, B, C, D)",
    "VIKAS and SAVE: Combining cause with commerce (IIMA/OB0239)",
    "Aditya Kumar: Office Politics and managing upwards (IIMA/OB0236)",
    "Vasudha's Dismay (IIMA/OB0230)",
    "Mohan Dixit (IIMA/OB0233, IIMA/OB0233TN)",
    "Meera Nair at PhoenixWay: Which Way to Go (IIMA/OB0231, IIMA/OB0231TN)",
    "GAIL 'Saksham' Program: Remoulding the Future (IIMA/PSG0123, IIMA/PSG0123TN)",
    "CSIR Tech Private Limited: Facilitating Lab to Market Journeys (IIMA/OB0218, IIMA/OB0218S)",
    "Performance Management at IRD Corporation (A) and (B) (IIMA/P&IR0227A,B)"
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#eff6ff] to-[#fff7ed] py-20 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center"
          >
            <div className="w-20 h-1 bg-[#f97316] mb-8 rounded-full mx-auto"></div>
            <h1 className="text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6">
              Research
            </h1>
            <p className="text-xl lg:text-2xl font-['Inter'] text-gray-600 max-w-3xl mx-auto">
              Advancing knowledge in leadership, organizational behavior, and human resource management
            </p>
          </motion.div>
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
              className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-3 rounded-lg font-['Inter'] font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              <FiExternalLink /> Google Scholar Citations
            </a>
            <a 
              href="https://www.researchgate.net/profile/YOUR_PROFILE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#fb923c] hover:bg-[#f97316] text-white px-6 py-3 rounded-lg font-['Inter'] font-semibold transition-all shadow-lg hover:shadow-xl"
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
            <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4">
              Featured Peer-reviewed Publications
            </h2>
            <div className="w-24 h-1 bg-[#3b82f6] rounded-full"></div>
          </motion.div>

          <div className="space-y-6">
            {featuredPublications.map((pub, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOptions}
                variants={fadeInUp}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-[#3b82f6]"
              >
                <p className="font-['Inter'] text-gray-700 mb-2">
                  <span className="font-semibold text-[#1a1a1a]">{pub.authors}</span> ({pub.year}). {pub.title}
                </p>
                <p className="font-['Inter'] text-gray-600 italic mb-2">{pub.journal}</p>
                {pub.doi && (
                  <a 
                    href={pub.doi} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#3b82f6] hover:text-[#2563eb] font-['Inter'] text-sm inline-flex items-center gap-1"
                  >
                    <FiExternalLink size={14} /> View Publication
                  </a>
                )}
              </motion.div>
            ))}
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
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#fb923c] rounded-lg flex items-center justify-center">
                <FiFileText className="text-white text-xl" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
                Cases
              </h2>
            </div>
            <ul className="space-y-3">
              {cases.map((caseItem, index) => (
                <li key={index} className="font-['Inter'] text-gray-700 pl-4 border-l-2 border-[#fb923c] hover:bg-[#fff7ed] p-2 transition-colors">
                  {caseItem}
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
              <div className="w-12 h-12 bg-[#3b82f6] rounded-lg flex items-center justify-center">
                <FiBookOpen className="text-white text-xl" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
                Technical Notes
              </h2>
            </div>
            <ul className="space-y-3">
              <li className="font-['Inter'] text-gray-700 pl-4 border-l-2 border-[#3b82f6] hover:bg-[#eff6ff] p-2 transition-colors">
                A Note on Decision-Making (IIMA/OB0232TEC)
              </li>
              <li className="font-['Inter'] text-gray-700 pl-4 border-l-2 border-[#3b82f6] hover:bg-[#eff6ff] p-2 transition-colors">
                Understanding the Design of Organizations (IIMA/OB0226TEC)
              </li>
              <li className="font-['Inter'] text-gray-700 pl-4 border-l-2 border-[#3b82f6] hover:bg-[#eff6ff] p-2 transition-colors">
                Stress and Our Inner Game (IIMA/OB0228TEC)
              </li>
              <li className="font-['Inter'] text-gray-700 pl-4 border-l-2 border-[#3b82f6] hover:bg-[#eff6ff] p-2 transition-colors">
                Appreciative Inquiry: A Positive Way of Managing Change (IIMA/OB0229TEC)
              </li>
              <li className="font-['Inter'] text-gray-700 pl-4 border-l-2 border-[#3b82f6] hover:bg-[#eff6ff] p-2 transition-colors">
                Teaching note for 'The Cybertech Project (A) and (B)' (HBS No. 695-030 and 695-041) (IIMA/OB0214TN)
              </li>
              <li className="font-['Inter'] text-gray-700 pl-4 border-l-2 border-[#3b82f6] hover:bg-[#eff6ff] p-2 transition-colors">
                Teaching note for 'The Audubon Zoo, 1993', an integrative case published in Daft (2007) (IIMA/OB0215TN)
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* PhD Students */}
      <section className="py-16 px-6 lg:px-16 bg-[#eff6ff]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
            className="mb-12 text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 bg-[#3b82f6] rounded-full flex items-center justify-center">
                <FiUsers className="text-white text-2xl" />
              </div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4">
              PhD Students Guided
            </h2>
            <div className="w-24 h-1 bg-[#3b82f6] rounded-full mx-auto"></div>
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
                  <div key={index} className="border-l-4 border-[#3b82f6] pl-4 py-2 hover:bg-[#eff6ff] transition-colors">
                    <p className="font-['Inter'] font-semibold text-[#1a1a1a]">{student.name}</p>
                    <p className="font-['Inter'] text-sm text-gray-600">{student.position}</p>
                  </div>
                ))}
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
                  <div key={index} className="border-l-4 border-[#fb923c] pl-4 py-2 hover:bg-[#fff7ed] transition-colors">
                    <p className="font-['Inter'] text-gray-700">{student}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
