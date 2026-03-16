import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const trainingsContent = {
  // Page header
  page_heading: "Executive Training Programs",
  page_description: "Transform your leadership journey with world-class executive education programs from IIM Ahmedabad",
  
  // Training Programs
  programs: [
    {
      id: 1,
      code: "leap-emb",
      title: "LEAP-EMB",
      full_title: "Leadership Excellence and Accelerated Performance - Executive Management Batch",
      description: "A comprehensive leadership development program designed for senior executives to enhance their strategic thinking, decision-making capabilities, and leadership effectiveness.",
      duration: "9 Months",
      format: "Hybrid (Online + Campus)",
      location: "IIM Ahmedabad",
      apply_link: "https://exed.iima.ac.in/programme-details.php?id=MTI4MA==",
      highlights: [
        "Strategic Leadership & Decision Making",
        "Business Strategy & Innovation",
        "Financial Management for Executives",
        "Leading Change & Transformation",
        "Networking with Industry Leaders"
      ],
      color: "blue", // from-[#2A35CC] to-[#1f2a99]
      published: true,
      order: 1
    },
    {
      id: 2,
      code: "heal",
      title: "HEAL",
      full_title: "Healthcare Executive Advancement & Leadership",
      description: "A specialized program for healthcare professionals to develop leadership skills, strategic thinking, and management expertise specific to the healthcare sector.",
      duration: "6 Months",
      format: "Hybrid (Online + Campus)",
      location: "IIM Ahmedabad",
      apply_link: "https://exed.iima.ac.in/programme-details.php?id=MTI3OQ==",
      highlights: [
        "Healthcare Management & Policy",
        "Strategic Planning in Healthcare",
        "Quality & Patient Safety",
        "Healthcare Analytics & Technology",
        "Leadership in Healthcare Organizations"
      ],
      color: "orange", // from-orange-500 to-orange-600
      published: true,
      order: 2
    },
    {
      id: 3,
      code: "climb",
      title: "CLIMB",
      full_title: "Contemporary Leadership & Innovative Management for Business",
      description: "An intensive program focusing on contemporary business challenges, innovative management practices, and developing future-ready leaders for dynamic business environments.",
      duration: "12 Months",
      format: "Hybrid (Online + Campus)",
      location: "IIM Ahmedabad",
      apply_link: "https://exed.iima.ac.in/programme-details.php?id=MTI5OQ==",
      highlights: [
        "Contemporary Business Challenges",
        "Innovation & Entrepreneurship",
        "Digital Transformation",
        "Sustainable Business Practices",
        "Global Business Perspectives"
      ],
      color: "blue", // from-[#2A35CC] to-[#1f2a99]
      published: true,
      order: 3
    }
  ],
  
  // CTA Section
  cta_heading: "Ready to Transform Your Leadership?",
  cta_description: "Join thousands of executives who have enhanced their leadership capabilities through our programs",
  cta_button_text: "Get in Touch",
  cta_button_link: "#contact"
};

async function initializeTrainingsContent() {
  try {
    console.log('Initializing Trainings page content...');
    await setDoc(doc(db, 'content', 'trainings'), trainingsContent);
    console.log('Trainings content successfully initialized!');
    return { success: true, message: 'Trainings content initialized' };
  } catch (error) {
    console.error('Error initializing Trainings content:', error);
    return { success: false, error: error.message };
  }
}

// If running directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeTrainingsContent().then(result => {
    console.log(result);
    process.exit(result.success ? 0 : 1);
  });
}

export { initializeTrainingsContent, trainingsContent };
