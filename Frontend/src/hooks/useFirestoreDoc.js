import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Deep merge: keys from `override` win; missing keys fall back to `base`
function deepMerge(base, override) {
  if (!override) return base;
  if (!base) return override;
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      override[key] !== null &&
      typeof override[key] === 'object' &&
      !Array.isArray(override[key]) &&
      typeof base[key] === 'object' &&
      base[key] !== null &&
      !Array.isArray(base[key])
    ) {
      result[key] = deepMerge(base[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

/**
 * Custom Hook to fetch and listen to Firestore document changes
 * @param {string} collection - Collection name (e.g., 'content')
 * @param {string} docId - Document ID (e.g., 'home')
 * @param {object} defaultData - Default data structure if document doesn't exist
 */
export function useFirestoreDoc(collection, docId, defaultData = {}) {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const docRef = doc(db, collection, docId);

    // Real-time listener
    const unsubscribe = onSnapshot(
      docRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          // Deep merge: Firestore data wins, but fills in any missing nested fields from defaults
          const merged = deepMerge(defaultData, docSnap.data());
          setData(merged);
        } else {
          // If document doesn't exist, create it with default data
          try {
            await setDoc(docRef, defaultData);
            setData(defaultData);
          } catch (err) {
            console.error('Error creating document:', err);
            setError(err);
          }
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching document:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [collection, docId]);

  return { data, loading, error };
}
