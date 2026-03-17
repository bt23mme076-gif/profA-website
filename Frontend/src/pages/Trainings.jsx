import { motion } from 'framer-motion';
import { FiExternalLink, FiCalendar, FiClock, FiMapPin, FiTarget, FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import { useFirestoreCollection } from '../hooks/useFirestoreCollection';
import EditableText from '../components/EditableText';
import { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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
    await addDoc(collection(db, 'training_programs'), newData);
    setShowAddForm(false);
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
            <input name="title" value={formData.title} onChange={handleChange} placeholder="Title (e.g., LEAP-EMB)" className="p-2 border rounded" />
            <input name="fullTitle" value={formData.fullTitle} onChange={handleChange} placeholder="Full Title" className="p-2 border rounded" />
            <input name="duration" value={formData.duration} onChange={handleChange} placeholder="Duration" className="p-2 border rounded" />
            <input name="format" value={formData.format} onChange={handleChange} placeholder="Format" className="p-2 border rounded" />
            <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="p-2 border rounded" />
            <input name="applyLink" value={formData.applyLink} onChange={handleChange} placeholder="Apply Link" className="p-2 border rounded" />
            <input name="color" value={formData.color} onChange={handleChange} placeholder="Gradient Color (e.g., from-blue-500 to-blue-700)" className="p-2 border rounded" />
          </div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full p-2 border rounded mt-4"
            rows="3"
          />
          <textarea
            name="highlights"
            value={formData.highlights.join('\n')}
            onChange={handleHighlightsChange}
            placeholder="Key Highlights (one per line)"
            className="w-full p-2 border rounded mt-4"
            rows="5"
          />
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
            <div className="w-20 h-1 bg-[#f97316] mb-8 rounded-full mx-auto"></div>
            <h1 className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6">
              <EditableText
                collection="content"
                docId="trainings"
                field="page_heading"
                defaultValue={pageData?.page_heading || 'Executive Training Programs'}
                className="text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#1a1a1a]"
              />
            </h1>
            <p className="text-xl lg:text-2xl text-[#004B8D] font-['Inter'] max-w-3xl mx-auto">
              <EditableText
                collection="content"
                docId="trainings"
                field="page_subtitle"
                className="text-xl lg:text-2xl text-[#004B8D] font-['Inter']"
              />
            </p>
            <p className="text-lg text-gray-600 font-['Inter'] max-w-4xl mx-auto mt-6">
              <EditableText
                collection="content"
                docId="trainings"
                field="page_description"
                defaultValue={pageData?.page_description || 'Transform your leadership journey with world-class executive education programs from IIM Ahmedabad'}
                className="text-lg text-gray-600 font-['Inter']"
                multiline
              />
            </p>
          </motion.div>
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
            {programs.map((program, index) => {
              const isEven = index % 2 === 0;
              const headerBg = isEven ? 'bg-[#004B8D]' : 'bg-[#f97316]';
              const buttonGradient = isEven
                ? 'bg-linear-to-r from-[#004B8D] to-[#003870] hover:from-[#003870] hover:to-[#002a5a]'
                : 'bg-linear-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c]';

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
                      <div className="absolute top-4 right-4 z-10 flex gap-2">
                        <button
                          onClick={() => setEditingProgram(program)}
                          className="p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDeleteProgram(program.id)}
                          className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    )}
                    {/* Program Header */}
                    <div className={`p-8 text-white ${headerBg}`}> 
                      <h2 className="text-4xl font-['Playfair_Display'] font-bold mb-2 text-white !text-white">
                        {program.title}
                      </h2>
                      <p className="text-lg opacity-90 font-['Inter'] text-white">
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
                            {program.highlights && program.highlights.map((highlight, idx) => (
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
          <h2 className="text-3xl lg:text-4xl font-['Playfair_Display'] font-bold mb-4">
            Ready to Transform Your Leadership?
          </h2>
          <p className="text-lg font-['Inter'] mb-8 opacity-90">
            Join thousands of executives who have enhanced their leadership capabilities through our programs
          </p>
          <a
            href="#contact"
            className="inline-block px-8 py-4 bg-white text-[#004B8D] font-['Inter'] font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all duration-300"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  );
}
