import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Subscribe user to newsletter
 * @param {string} email - User's email address
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function subscribeToNewsletter(email) {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: 'Please enter a valid email address'
      };
    }

    const normalizedEmail = email.toLowerCase();
    
    // We cannot query ('getDocs') the collection due to safety rules, 
    // so we attempt to create the document with the email as its ID.
    // If it already exists, Firestore will throw a 'permission-denied' error because over-writing requires update permissions.
    const newsletterDocRef = doc(db, 'newsletter_subscribers', normalizedEmail);
    
    await setDoc(newsletterDocRef, {
      email: normalizedEmail,
      subscribedAt: new Date().toISOString(),
      status: 'active',
      source: 'website'
    });

    return {
      success: true,
      message: 'Thank you for subscribing! Check your inbox for confirmation.'
    };
  } catch (error) {
    if (error.code === 'permission-denied') {
      return {
        success: false,
        message: 'This email is already subscribed!'
      };
    }
    console.error('Newsletter subscription error:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again later.'
    };
  }
}

/**
 * Get total subscriber count (admin only)
 * @returns {Promise<number>}
 */
export async function getSubscriberCount() {
  try {
    const newsletterRef = collection(db, 'newsletter_subscribers');
    const querySnapshot = await getDocs(newsletterRef);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting subscriber count:', error);
    return 0;
  }
}
