import { useState, useRef, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { FaBold, FaItalic } from 'react-icons/fa';

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

  // Helper: simple renderer for **bold** and newlines -> <br>
  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const renderRichText = (text, isMultiline) => {
    if (!text) return '';
    // escape then replace **bold**
    let html = escapeHtml(text);
    // convert **bold** to <strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // convert *italic* to <em>
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    if (isMultiline) {
      // preserve line breaks
      html = html.replace(/\r?\n/g, '<br/>');
    }
    return html;
  };

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
      <p className={className} dangerouslySetInnerHTML={{ __html: renderRichText(defaultValue, true) }} />
    ) : (
      <span className={className} dangerouslySetInnerHTML={{ __html: renderRichText(defaultValue, false) }} />
    );
  }

  // Admin View (With Floating Edit Box)
  return (
    <span
      ref={containerRef}
      className="relative inline-block w-full group"
      onMouseEnter={() => !isEditing && setShowEditIcon(true)}
      onMouseLeave={() => !isEditing && setShowEditIcon(false)}
    >
      {!isEditing ? (
        <div className="relative cursor-pointer border border-transparent hover:border-[#004B8D]/30 transition-all rounded px-1 overflow-visible">
          {multiline ? (
            <p className={className} dangerouslySetInnerHTML={{ __html: renderRichText(defaultValue, true) }} />
          ) : (
            <span className={className} dangerouslySetInnerHTML={{ __html: renderRichText(defaultValue, false) }} />
          )}
          
          <AnimatePresence>
            {showEditIcon && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                // prevent click from bubbling to parent buttons/links
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsEditing(true);
                }}
                className="absolute top-2 right-2 bg-black text-white p-2 rounded-md shadow-lg z-30 cursor-pointer"
              >
                <FiEdit2 size={14} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Floating Edit Modal Style */
        <motion.div 
          onClick={(e) => e.stopPropagation()} 
          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute left-0 top-0 z-50 w-full min-w-[300px] bg-white p-4 shadow-2xl rounded-xl border border-gray-100 max-h-[60vh] overflow-auto">
          {/* Toolbar: formatting + actions */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2 items-center">
              <button
                type="button"
                title="Bold"
                onClick={() => {
                  const el = inputRef.current;
                  if (!el) return;
                  const start = el.selectionStart ?? 0;
                  const end = el.selectionEnd ?? 0;
                  const before = value.slice(0, start);
                  const selected = value.slice(start, end) || '';
                  const after = value.slice(end);
                  const isBold = /^(\*\*)([\s\S]*?)(\*\*)$/.test(selected);
                  const newSelected = isBold ? selected.replace(/^(\*\*)([\s\S]*?)(\*\*)$/, '$2') : `**${selected || 'bold text'}**`;
                  const newValue = before + newSelected + after;
                  setValue(newValue);
                  setTimeout(() => {
                    el.focus();
                    if (selected === '') {
                      const pos = start + (isBold ? 0 : 2);
                      const len = isBold ? 9 : 9;
                      el.setSelectionRange(pos, pos + len);
                    } else {
                      el.setSelectionRange(start, start + newSelected.length);
                    }
                  }, 0);
                }}
                className="p-2 rounded border bg-white text-gray-700 hover:bg-gray-50"
              >
                <FaBold />
              </button>

              <button
                type="button"
                title="Italic"
                onClick={() => {
                  const el = inputRef.current;
                  if (!el) return;
                  const start = el.selectionStart ?? 0;
                  const end = el.selectionEnd ?? 0;
                  const before = value.slice(0, start);
                  const selected = value.slice(start, end) || '';
                  const after = value.slice(end);
                  const isItalic = /^(\*)([\s\S]*?)(\*)$/.test(selected);
                  const newSelected = isItalic ? selected.replace(/^(\*)([\s\S]*?)(\*)$/, '$2') : `*${selected || 'italic text'}*`;
                  const newValue = before + newSelected + after;
                  setValue(newValue);
                  setTimeout(() => {
                    el.focus();
                    if (selected === '') {
                      const pos = start + (isItalic ? 0 : 1);
                      const len = isItalic ? 11 : 11;
                      el.setSelectionRange(pos, pos + len);
                    } else {
                      el.setSelectionRange(start, start + newSelected.length);
                    }
                  }, 0);
                }}
                className="p-2 rounded border bg-white text-gray-700 hover:bg-gray-50"
              >
                <FaItalic />
              </button>
            </div>

            <div className="flex gap-2 items-center">
              <button onClick={handleCancel} className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded border">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="bg-black text-white text-sm px-3 py-1 rounded flex items-center gap-2">
                {isSaving ? 'Saving...' : (<><FiCheck /> Save</>)}
              </button>
            </div>
          </div>

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
    </span>
  );
}