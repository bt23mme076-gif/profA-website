import { motion } from 'framer-motion';
import { FiExternalLink, FiCalendar, FiClock, FiMapPin, FiTarget } from 'react-icons/fi';

export default function Trainings() {
  const programs = [
    {
      id: 'leap-emb',
      title: 'LEAP-EMB',
      fullTitle: 'Leadership Excellence and Accelerated Performance - Executive Management Batch',
      description: 'A comprehensive leadership development program designed for senior executives to enhance their strategic thinking, decision-making capabilities, and leadership effectiveness.',
      duration: '9 Months',
      format: 'Hybrid (Online + Campus)',
      location: 'IIM Ahmedabad',
      applyLink: 'https://exed.iima.ac.in/programme-details.php?id=MTI4MA==',
      highlights: [
        'Strategic Leadership & Decision Making',
        'Business Strategy & Innovation',
        'Financial Management for Executives',
        'Leading Change & Transformation',
        'Networking with Industry Leaders'
      ],
      color: 'from-[#2A35CC] to-[#1f2a99]'
    },
    {
      id: 'heal',
      title: 'HEAL',
      fullTitle: 'Healthcare Executive Advancement & Leadership',
      description: 'A specialized program for healthcare professionals to develop leadership skills, strategic thinking, and management expertise specific to the healthcare sector.',
      duration: '6 Months',
      format: 'Hybrid (Online + Campus)',
      location: 'IIM Ahmedabad',
      applyLink: 'https://exed.iima.ac.in/programme-details.php?id=MTI3OQ==',
      highlights: [
        'Healthcare Management & Policy',
        'Strategic Planning in Healthcare',
        'Quality & Patient Safety',
        'Healthcare Analytics & Technology',
        'Leadership in Healthcare Organizations'
      ],
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'climb',
      title: 'CLIMB',
      fullTitle: 'Contemporary Leadership & Innovative Management for Business',
      description: 'An intensive program focusing on contemporary business challenges, innovative management practices, and developing future-ready leaders for dynamic business environments.',
      duration: '12 Months',
      format: 'Hybrid (Online + Campus)',
      location: 'IIM Ahmedabad',
      applyLink: 'https://exed.iima.ac.in/programme-details.php?id=MTI5OQ==',
      highlights: [
        'Contemporary Business Challenges',
        'Innovation & Entrepreneurship',
        'Digital Transformation',
        'Sustainable Business Practices',
        'Global Business Perspectives'
      ],
      color: 'from-[#2A35CC] to-[#1f2a99]'
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header Section */}
      <section className="py-20 bg-gradient-to-br from-[#fff7ed] to-white border-b-4 border-[#f97316]">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <motion.div
            initial={{ opacity: 0.85, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center"
          >
            <h1 className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-gray-900 mb-6">
              Executive Training Programs
            </h1>
            <p className="text-xl lg:text-2xl text-[#2A35CC] font-['Inter'] max-w-3xl mx-auto">
              By Prof. Vishal Gupta
            </p>
            <p className="text-lg text-gray-600 font-['Inter'] max-w-4xl mx-auto mt-6">
              Transform your leadership journey with world-class executive education programs from IIM Ahmedabad
            </p>
          </motion.div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 px-6 lg:px-16 bg-gradient-to-b from-white to-[#fff7ed]">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-16">
            {programs.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0.85, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.08 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100 hover:shadow-2xl transition-shadow duration-300"
              >
                {/* Program Header */}
                <div className={`bg-gradient-to-r ${program.color} p-8 text-white`}>
                  <h2 className="text-4xl font-['Playfair_Display'] font-bold mb-2">
                    {program.title}
                  </h2>
                  <p className="text-lg opacity-90 font-['Inter']">
                    {program.fullTitle}
                  </p>
                </div>

                {/* Program Content */}
                <div className="p-8 lg:p-12">
                  <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Left Column - Description */}
                    <div>
                      <p className="text-gray-700 text-lg leading-relaxed mb-6 font-['Inter']">
                        {program.description}
                      </p>

                      {/* Program Details */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-gray-700">
                          <FiClock className="text-[#f97316] text-xl" />
                          <span className="font-['Inter']"><strong>Duration:</strong> {program.duration}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <FiCalendar className="text-[#f97316] text-xl" />
                          <span className="font-['Inter']"><strong>Format:</strong> {program.format}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                          <FiMapPin className="text-[#f97316] text-xl" />
                          <span className="font-['Inter']"><strong>Location:</strong> {program.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Highlights */}
                    <div>
                      <h3 className="text-2xl font-['Playfair_Display'] font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiTarget className="text-[#f97316]" />
                        Key Highlights
                      </h3>
                      <ul className="space-y-3">
                        {program.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="text-[#f97316] text-xl mt-1">•</span>
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
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-['Inter'] font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-[#ea580c] hover:to-[#c2410c] transition-all duration-300 transform hover:scale-105"
                    >
                      Apply Now
                      <FiExternalLink className="text-xl" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#2A35CC] to-[#1f2a99] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-['Playfair_Display'] font-bold mb-4">
            Ready to Transform Your Leadership?
          </h2>
          <p className="text-lg font-['Inter'] mb-8 opacity-90">
            Join thousands of executives who have enhanced their leadership capabilities through our programs
          </p>
          <a
            href="#contact"
            className="inline-block px-8 py-4 bg-white text-[#2A35CC] font-['Inter'] font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
}
