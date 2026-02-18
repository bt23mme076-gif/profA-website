import { motion } from 'framer-motion';
import { FiAward, FiUsers, FiBookOpen, FiBriefcase, FiTrendingUp, FiHeart } from 'react-icons/fi';

export default function About() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const viewportOptions = {
    once: true,
    margin: "0px 0px -50px 0px",
    amount: 0.2
  };

  const achievements = [
    { 
      icon: <FiAward />, 
      title: "Academic Leader", 
      desc: "President of Indian Academy of Management (2020-2022). Affiliate of Academy of Management, US." 
    },
    { 
      icon: <FiBriefcase />, 
      title: "Corporate Consultant", 
      desc: "Training leaders at NHPC, Taj Group, L&T, DRDO, and consulting for BSNL, Tilburg University, Aston Business School." 
    },
    { 
      icon: <FiBookOpen />, 
      title: "Published Author", 
      desc: "'First Among Equals' (2020) & 'Demystifying Leadership: Unveiling the Mahabharata Code' (2021)." 
    }
  ];

  const awards = [
    "Outstanding Doctoral Dissertation Award - EFMD/Emerald (2013-14)",
    "Young Scientist Award - National Academy of Sciences India & Scopus (2016)",
    "India's 25 Young HR Leaders - People Matters (2013)",
    "Emerging Psychologist - National Academy of Psychology India (2014)"
  ];

  const workExperience = [
    {
      period: "September 2022 – Present",
      role: "Professor in Organizational Behavior Area",
      organization: "Indian Institute of Management Ahmedabad"
    },
    {
      period: "May 2016 – August 2022",
      role: "Associate Professor in Organizational Behavior Area",
      organization: "Indian Institute of Management Ahmedabad"
    },
    {
      period: "March 2013 – May 2016",
      role: "Assistant Professor in Organizational Behavior Area",
      organization: "Indian Institute of Management Ahmedabad"
    },
    {
      period: "July 2012 – February 2013",
      role: "Assistant Professor in HRM Group",
      organization: "Indian Institute of Management Calcutta"
    },
    {
      period: "September 2005 – June 2008",
      role: "VLSI Design Engineer in Hardware Design Group",
      organization: "ST Microelectronics Pvt Ltd, Noida"
    },
    {
      period: "January 2005 – June 2005",
      role: "Student Intern in Wireline Group",
      organization: "Infineon Technologies AG, Munich, Germany"
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section - The Statement */}
      <section className="min-h-screen grid lg:grid-cols-2 items-center px-6 lg:px-20 py-16 bg-gradient-to-br from-[#eff6ff] to-[#faf8f5]">
        {/* Left: Text Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="space-y-6 max-w-xl"
        >
          <div className="w-20 h-1 bg-[#f97316] rounded-full"></div>
          <h1 className="text-6xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#1a1a1a] leading-tight">
            Creating Happy Leaders
          </h1>
          <p className="text-2xl lg:text-3xl font-['Playfair_Display'] text-[#3b82f6] font-semibold">
            Professor of Organizational Behavior at IIM Ahmedabad.
          </p>
          <p className="text-xl font-['Inter'] text-gray-600 leading-relaxed">
            Researcher, Author, and Leadership Coach bridging engineering precision with behavioral science.
          </p>
          <a 
            href="https://www.linkedin.com/in/gvishal/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white px-8 py-4 rounded-lg font-['Inter'] font-bold transition-all shadow-lg hover:shadow-xl"
          >
            Connect on LinkedIn
          </a>
        </motion.div>

        {/* Right: Professional Portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mt-12 lg:mt-0"
        >
          <div className="aspect-[3/4] max-w-lg mx-auto lg:ml-auto rounded-3xl overflow-hidden shadow-2xl bg-gray-200 border-4 border-[#3b82f6]">
            <img 
              src="https://i.ibb.co/WvvwbZBt/prof-gupta-jpg.png"
              alt="Prof. Vishal Gupta" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/800x1000/cccccc/333333?text=Prof.+Vishal+Gupta";
              }}
            />
          </div>
        </motion.div>
      </section>

      {/* Core Expertise Cards - Laurie Santos Style */}
      <section className="py-16 px-6 lg:px-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {achievements.map((item, i) => (
              <div key={i} className="border-t-4 border-[#3b82f6] pt-8 space-y-4 group hover:border-[#f97316] transition-all">
                <div className="w-14 h-14 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-xl flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h4 className="text-sm uppercase tracking-widest font-bold text-gray-500">{item.title}</h4>
                <p className="text-lg font-['Inter'] font-medium text-gray-700 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Journey - Engineering to Leadership */}
      <section className="py-16 px-6 lg:px-20 bg-[#faf8f5]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
            className="text-center space-y-8"
          >
            <h2 className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
              Bridging Engineering and Behavior
            </h2>
            <div className="w-24 h-1 bg-[#f97316] rounded-full mx-auto"></div>
            <div className="space-y-6 text-left">
              <p className="text-xl font-['Inter'] text-gray-700 leading-relaxed">
                I obtained my doctorate in <span className="font-semibold text-[#3b82f6]">Human Resource Management</span> from the Indian Institute of Management Lucknow in 2013. I hold a Bachelor's degree in <span className="font-semibold text-[#3b82f6]">Electrical and Electronics Engineering</span> from BITS-Pilani, Pilani Campus, India.
              </p>
              <p className="text-xl font-['Inter'] text-gray-700 leading-relaxed">
                Prior to joining IIMA, I worked as a <span className="font-semibold text-[#f97316]">Hardware Design Engineer</span> with ST Microelectronics Pvt Ltd., Greater Noida and with Infineon Technologies AG, Munich, Germany where I was involved in the design of high-performance Application-Specific Integrated Circuits (ASICs).
              </p>
              <p className="text-xl font-['Inter'] text-gray-700 leading-relaxed">
                This unique blend of <span className="font-semibold">technical precision and behavioral insight</span> fuels my research in leadership development, mindfulness, emotional intelligence, organization development, and R&D management.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-16 px-6 lg:px-20 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#fb923c] to-[#f97316] rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl">
                <FiAward />
              </div>
              <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
                Awards & Recognition
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {awards.map((award, index) => (
                <div key={index} className="bg-gradient-to-br from-[#eff6ff] to-white p-6 rounded-xl border-l-4 border-[#3b82f6] shadow-md hover:shadow-xl transition-shadow">
                  <p className="font-['Inter'] text-gray-800 font-medium">{award}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Published Books */}
      <section className="py-16 px-6 lg:px-20 bg-[#fff7ed]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl">
                <FiBookOpen />
              </div>
              <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
                Published Books
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-[#3b82f6] hover:scale-105 transition-transform">
                <h3 className="text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-3">
                  First Among Equals
                </h3>
                <p className="text-gray-600 font-['Inter'] mb-4">
                  T-R-E-A-T Leadership for L-E-A-P in a Knowledge-based World
                </p>
                <p className="text-sm text-gray-500 font-['Inter']">Published by Bloomsbury India (2020)</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-[#f97316] hover:scale-105 transition-transform">
                <h3 className="text-2xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-3">
                  Demystifying Leadership
                </h3>
                <p className="text-gray-600 font-['Inter'] mb-4">
                  Unveiling the Mahabharata Code
                </p>
                <p className="text-sm text-gray-500 font-['Inter']">Published by Bloomsbury India (2021)</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Work Experience Timeline */}
      <section className="py-16 px-6 lg:px-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] rounded-2xl flex items-center justify-center text-white text-3xl shadow-xl">
                <FiTrendingUp />
              </div>
              <h2 className="text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
                Professional Journey
              </h2>
            </div>
            <div className="space-y-6">
              {workExperience.map((exp, index) => (
                <div key={index} className="relative pl-8 pb-6 border-l-2 border-[#3b82f6] last:border-0 group">
                  <div className="absolute -left-3 top-0 w-5 h-5 rounded-full bg-[#3b82f6] group-hover:bg-[#f97316] transition-colors shadow-lg"></div>
                  <p className="text-sm font-['Inter'] font-semibold text-[#3b82f6] mb-2">{exp.period}</p>
                  <h3 className="text-xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-1">{exp.role}</h3>
                  <p className="font-['Inter'] text-gray-600">{exp.organization}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Board Positions & Media Coverage */}
      <section className="py-16 px-6 lg:px-20 bg-[#faf8f5]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
          {/* Board Positions */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#3b82f6] rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                <FiUsers />
              </div>
              <h3 className="text-3xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
                Board Positions
              </h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#3b82f6]">
                <p className="font-['Inter'] font-semibold text-[#1a1a1a]">
                  Independent Director - Gujarat Industries Power Company Limited (GIPCL)
                </p>
                <p className="text-sm text-gray-600 mt-1">Present</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-gray-300">
                <p className="font-['Inter'] font-semibold text-gray-700">
                  Independent Director - Gujarat Gas Limited
                </p>
                <p className="text-sm text-gray-600 mt-1">August 2017 - August 2021</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-gray-300">
                <p className="font-['Inter'] font-semibold text-gray-700">
                  Board of Governors Member - IIM Ahmedabad
                </p>
                <p className="text-sm text-gray-600 mt-1">December 2020 - February 2022</p>
              </div>
            </div>
          </motion.div>

          {/* Media Coverage */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            variants={fadeInUp}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#f97316] rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                <FiHeart />
              </div>
              <h3 className="text-3xl font-['Playfair_Display'] font-bold text-[#1a1a1a]">
                Media Coverage
              </h3>
            </div>
            <p className="text-lg font-['Inter'] text-gray-700 mb-6 leading-relaxed">
              My research has been published in prestigious international journals and featured in major media outlets:
            </p>
            <div className="flex flex-wrap gap-3">
              {['Times of India', 'Economic Times', 'Business Line', 'Ahmedabad Mirror', 'Mint', 'DNA'].map((media) => (
                <span key={media} className="bg-white px-4 py-2 rounded-full text-sm font-['Inter'] font-semibold text-[#3b82f6] shadow-md border border-[#3b82f6]">
                  {media}
                </span>
              ))}
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
