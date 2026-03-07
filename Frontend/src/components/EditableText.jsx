import { useState, useRef, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi';

/**
 * EditableText Component - Allows Admin to edit text inline
 * 1. Admin login detect karta hai
 * 2. Hover par pencil icon dikhata hai
 * 3. Click par floating edit box kholta hai
 */
export default function EditableText({ 
  collection = 'content',
  docId = 'home',
  field,
  defaultValue = '',
  className = '',
  multiline = false,
  placeholder = 'Click to edit...'
}) {
  const { isAdmin } = useAuth(); //
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [showEditIcon, setShowEditIcon] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Click outside to cancel logic
  useEffect(() => {
    if (!isEditing) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        handleCancel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing]);

  const handleSave = async () => {
    if (value.trim() === '' || value === defaultValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const docRef = doc(db, collection, docId);
      await updateDoc(docRef, { [field]: value.trim() }); //
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating text:', error);
      alert('Save failed. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(defaultValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  // Normal User View (No Admin)
  if (!isAdmin) {
    return multiline ? (
      <p className={className}>{defaultValue}</p>
    ) : (
      <span className={className}>{defaultValue}</span>
    );
  }

  // Admin View (With Floating Edit Box)
  return (
    <div 
      ref={containerRef}
      className="relative inline-block w-full group"
      onMouseEnter={() => !isEditing && setShowEditIcon(true)}
      onMouseLeave={() => !isEditing && setShowEditIcon(false)}
    >
      {!isEditing ? (
        <div className="relative cursor-pointer border border-transparent hover:border-[#004B8D]/30 transition-all rounded px-1">
          {multiline ? (
            <p className={className}>{defaultValue}</p>
          ) : (
            <span className={className}>{defaultValue}</span>
          )}
          
          <AnimatePresence>
            {showEditIcon && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditing(true)}
                className="absolute -top-3 -right-3 bg-black text-white p-1.5 rounded-full shadow-lg z-10"
              >
                <FiEdit2 size={12} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Floating Edit Modal Style */
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute left-0 top-0 z-50 w-full min-w-[300px] bg-white p-4 shadow-2xl rounded-xl border border-gray-100">
          {multiline ? (
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border p-2 rounded mb-3 font-sans text-base text-gray-800"
              rows={5}
            />
          ) : (
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border p-2 rounded mb-3 font-sans text-base text-gray-800"
            />
          )}
          <div className="flex justify-end gap-2">
            <button onClick={handleCancel} className="text-xs text-gray-500 hover:text-gray-800 px-3 py-1">Cancel</button>
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-black text-white text-xs px-4 py-1.5 rounded-full flex items-center gap-1"
            >
              {isSaving ? '...' : <><FiCheck /> Save</>}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}