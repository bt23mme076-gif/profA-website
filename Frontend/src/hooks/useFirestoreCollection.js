import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, query, onSnapshot } from 'firebase/firestore';

export function useFirestoreCollection(collectionName, constraints = [], realtime = false) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // stabilize constraints
  const constraintsKey = JSON.stringify(constraints);
  const constraintsRef = useRef(constraintsKey);
  constraintsRef.current = constraintsKey;

  useEffect(() => {
    console.log(`${realtime ? 'Setting up real-time listener' : 'Fetching'} for ${collectionName}...`);
    
    const collectionRef = collection(db, collectionName);
    let q = collectionRef;
    if (constraints.length > 0) {
      q = query(collectionRef, ...constraints);
    }

    // Real-time listener
    if (realtime) {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log(`✅ Real-time update for ${collectionName}:`, items.length, 'items');
          setData(items);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error(`❌ Real-time listener error for ${collectionName}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );

      // Cleanup function
      return () => {
        console.log(`🔌 Unsubscribing from ${collectionName}`);
        unsubscribe();
      };
    }

    // One-time fetch
    const fetchData = async () => {
      try {
        setLoading(true);
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log(`${collectionName} fetched:`, items.length, 'items');
        setData(items);
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName, constraintsRef.current, realtime]);

  return { data, loading, error };
}
