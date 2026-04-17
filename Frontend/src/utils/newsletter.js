import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Subscribe user to newsletter & send welcome email via backend
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

    const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Something went wrong. Please try again later.'
      };
    }

    return {
      success: true,
      message: 'Thank you for subscribing! Check your inbox for a welcome email.'
    };
  } catch (error) {
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
