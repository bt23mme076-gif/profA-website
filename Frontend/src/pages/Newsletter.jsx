import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiCheck, FiEdit2 } from 'react-icons/fi';
import { useFirestoreDoc } from '../hooks/useFirestoreDoc';
import EditableText from '../components/EditableText';
import { useAuth } from '../context/AuthContext';
import { subscribeToNewsletter } from '../utils/newsletter';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

if (typeof document !== 'undefined') {
  const _nlLink = document.createElement('link');
  _nlLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap';
  _nlLink.rel = 'stylesheet';
  document.head.appendChild(_nlLink);
}

export default function Newsletter() {
  const { isAdmin } = useAuth() || {};
  const [email, setEmail] = useState('');
  const [emailBottom, setEmailBottom] = useState('');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [statusBottom, setStatusBottom] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingBottom, setIsSubmittingBottom] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(null);

  const { data: pageData } = useFirestoreDoc('content', 'newsletter_page', {
    hero_heading: "“The best resource on Leadership and Organizational Behavior.”",
    hero_description: "The Wisdom Newsletter, subscribed by thousands of people worldwide, contains the best ideas on mindful leadership, behavioral science, and self-improvement to help you live the life you deserve.",
    hero_bonus: "Join now and also receive an exclusive series containing a leadership framework as practiced by the world's best.",
    button_text: "VISHAL, SEND ME YOUR NEWSLETTER",
    quote_text: "I constantly see people rise in life who are not the smartest, sometimes not even the most diligent, but they are learning machines. They go to bed every night a little wiser than they were when they got up...",
    quote_author: "Charlie Munger",
    secondary_text: "Follow me as I uncover the wisdom behind the working of organizations and the human brain. Some of my ideas will inspire you. Some will make you uncomfortable. All will challenge you to think outside the box.",
    testimonials_heading: "What Subscribers Are Saying",
    t1_text: "Any professional (including experienced ones) would benefit from Vishal’s work. I certainly have.",
    t1_author: "Prof. Sanjay Bakshi",
    t2_text: "If you want to become a serious, long-term leader, this newsletter is a gold mine for you.",
    t2_author: "Chetan Parikh",
    t3_text: "Vishal’s passion to teach is contagious and his definitive style of teaching is par excellence.",
    t3_author: "Gautamjit Singh",
    bonus_heading: "Subscription Bonus: Free E-Books",
    bonus_text: "When you subscribe to The Wisdom Newsletter, apart from all the insights, you also get instant access to several e-books. All for FREE!",
    sub_button_text: "SUBSCRIBE NOW (IT'S FREE)",
    spam_notice: "No spam. Just the highest quality ideas you will find on the web.",
    hero_image: "https://res.cloudinary.com/dzs0nmbxw/image/upload/v1744158434/o6ryp4rtm5i9lhlr53f3.png", 
    bonus_image: "https://res.cloudinary.com/dzs0nmbxw/image/upload/v1744158580/sn-ebooks_y2v361.png"
  });

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(field);
    try {
      const url = await uploadToCloudinary(file, 'newsletter');
      const docRef = doc(db, 'content', 'newsletter_page');
      await updateDoc(docRef, { [field]: url });
    } catch (err) {
      alert("Failed to upload image. Please try again.");
      console.error('Image upload missing config:', err);
    } finally {
      setUploadingImage(null);
    }
  };

  const handleSubmitTop = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ message: '', type: '' });
    try {
      const result = await subscribeToNewsletter(email);
      setStatus({ message: result.message, type: result.success ? 'success' : 'error' });
      if (result.success) {
        setEmail('');
        setTimeout(() => setStatus({ message: '', type: '' }), 5000);
      }
    } catch (err) {
      setStatus({ message: 'Something went wrong. Please try again.', type: 'error' });
    }
    setIsSubmitting(false);
  };

  const handleSubmitBottom = async (e) => {
    e.preventDefault();
    setIsSubmittingBottom(true);
    setStatusBottom({ message: '', type: '' });
    try {
      const result = await subscribeToNewsletter(emailBottom);
      setStatusBottom({ message: result.message, type: result.success ? 'success' : 'error' });
      if (result.success) {
        setEmailBottom('');
        setTimeout(() => setStatusBottom({ message: '', type: '' }), 5000);
      }
    } catch (err) {
      setStatusBottom({ message: 'Something went wrong. Please try again.', type: 'error' });
    }
    setIsSubmittingBottom(false);
  };

  return (
    <div className="min-h-screen bg-white text-[#111111] font-['Inter']">
      {/* 1. HERO SECTION */}
      <section className="pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left: Hero Image / Blog Mockup */}
          <div className="relative group mx-auto w-full max-w-[320px] sm:max-w-[380px] rounded-[2rem] overflow-hidden shadow-2xl bg-white border-[8px] border-gray-100">
            <img 
              src={pageData?.hero_image || "https://res.cloudinary.com/dzs0nmbxw/image/upload/v1744158434/o6ryp4rtm5i9lhlr53f3.png"} 
              alt="Newsletter Preview" 
              className="w-full h-auto object-cover"
            />
            {isAdmin && (
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <label className="cursor-pointer bg-[#F5C400] text-black px-5 py-3 rounded-md shadow-lg text-sm font-bold flex items-center gap-2 hover:bg-[#ffe066] transition-colors">
                    {uploadingImage === 'hero_image' ? 'Uploading...' : <><FiEdit2 /> Change Image</>}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'hero_image')} disabled={uploadingImage} />
                 </label>
               </div>
            )}
          </div>

          {/* Right: Intro Text & Top Form */}
          <div className="text-left space-y-6">
            <EditableText
              collection="content" docId="newsletter_page" field="hero_heading"
              defaultValue={pageData?.hero_heading}
              className="font-['Playfair_Display'] text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-[#004B8D] leading-tight block"
            />

            <EditableText
              collection="content" docId="newsletter_page" field="hero_description"
              defaultValue={pageData?.hero_description}
              className="text-base sm:text-lg text-gray-700 leading-relaxed block"
              multiline={true}
            />

            <EditableText
              collection="content" docId="newsletter_page" field="hero_bonus"
              defaultValue={pageData?.hero_bonus}
              className="text-base sm:text-lg text-gray-700 leading-relaxed font-medium block"
              multiline={true}
            />

            <form onSubmit={handleSubmitTop} className="flex flex-col gap-4 mt-8 bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full px-5 py-4 border border-gray-300 rounded focus:outline-none focus:border-[#004B8D] focus:ring-2 focus:ring-[#004B8D]/20 text-left text-base bg-white"
              />
              <div className="relative">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#004B8D] hover:bg-[#003666] text-white font-bold px-8 py-5 rounded text-sm sm:text-base uppercase tracking-wide transition-all shadow-md active:scale-[0.98]"
                >
                  {isSubmitting ? 'Subscribing...' : (!isAdmin ? (pageData?.button_text || "VISHAL, SEND ME YOUR NEWSLETTER") : <span className="opacity-0">Btn</span>)}
                </button>
                {isAdmin && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer"
                    onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                  >
                    <EditableText
                      collection="content" docId="newsletter_page" field="button_text"
                      defaultValue={pageData?.button_text}
                      className="text-white font-bold uppercase tracking-wide px-4"
                    />
                  </div>
                )}
              </div>

              {status.message && (
                <div className={`p-4 rounded flex items-center gap-2 mt-2 ${status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {status.type === 'success' && <FiCheck className="flex-shrink-0" />}
                  <span className="text-sm font-medium">{status.message}</span>
                </div>
              )}
            </form>
          </div>

        </div>
      </section>

      {/* 3. TESTIMONIALS */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h2 className="text-center font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#004B8D] mb-16">
          <EditableText
            collection="content" docId="newsletter_page" field="testimonials_heading"
            defaultValue={pageData?.testimonials_heading}
          />
        </h2>

        <div className="grid md:grid-cols-3 gap-12 items-start text-center md:text-left">
            <div className="space-y-6">
              <EditableText
                collection="content" docId="newsletter_page" field="t1_text"
                defaultValue={pageData?.t1_text}
                className="text-gray-600 block italic leading-relaxed text-lg"
                multiline={true}
              />
              <div className="font-bold text-[#111111] text-lg pt-6 border-t border-gray-200">
                <EditableText
                  collection="content" docId="newsletter_page" field="t1_author"
                  defaultValue={pageData?.t1_author}
                />
              </div>
            </div>

            <div className="space-y-6">
              <EditableText
                collection="content" docId="newsletter_page" field="t2_text"
                defaultValue={pageData?.t2_text}
                className="text-gray-600 block italic leading-relaxed text-lg"
                multiline={true}
              />
              <div className="font-bold text-[#111111] text-lg pt-6 border-t border-gray-200">
                <EditableText
                  collection="content" docId="newsletter_page" field="t2_author"
                  defaultValue={pageData?.t2_author}
                />
              </div>
            </div>

            <div className="space-y-6">
              <EditableText
                collection="content" docId="newsletter_page" field="t3_text"
                defaultValue={pageData?.t3_text}
                className="text-gray-600 block italic leading-relaxed text-lg"
                multiline={true}
              />
              <div className="font-bold text-[#111111] text-lg pt-6 border-t border-gray-200">
                <EditableText
                  collection="content" docId="newsletter_page" field="t3_author"
                  defaultValue={pageData?.t3_author}
                />
              </div>
            </div>
        </div>
      </section>

      {/* 4. BONUS & BOTTOM FORM */}
      <section className="py-24 bg-[#004B8D]/[0.02] px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          
          {/* Left / Top : Book/Bonus Image */}
          <div className="relative group mx-auto w-full max-w-[250px] md:max-w-[320px] order-2 md:order-1">
            <img 
              src={pageData?.bonus_image || "https://res.cloudinary.com/dzs0nmbxw/image/upload/v1744158580/sn-ebooks_y2v361.png"} 
              alt="Free E-Books" 
              className="w-full h-auto object-contain drop-shadow-2xl hover:scale-[1.01] transition-transform duration-500"
            />
            {isAdmin && (
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                 <label className="cursor-pointer bg-[#F5C400] text-black px-5 py-3 rounded-md shadow-lg text-sm font-bold flex items-center gap-2 hover:bg-[#ffe066] transition-colors">
                    {uploadingImage === 'bonus_image' ? 'Uploading...' : <><FiEdit2 /> Change Image</>}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'bonus_image')} disabled={uploadingImage} />
                 </label>
               </div>
            )}
          </div>

          {/* Right / Bottom : Bonus Text & Form */}
          <div className="text-left space-y-6 order-1 md:order-2">
            <EditableText
              collection="content" docId="newsletter_page" field="bonus_heading"
              defaultValue={pageData?.bonus_heading}
              className="font-['Playfair_Display'] text-3xl sm:text-4xl font-bold text-[#004B8D] leading-tight block"
            />
            <EditableText
              collection="content" docId="newsletter_page" field="bonus_text"
              defaultValue={pageData?.bonus_text}
              className="text-base md:text-lg text-gray-700 leading-relaxed block"
              multiline={true}
            />

            <form onSubmit={handleSubmitBottom} className="flex flex-col gap-4 mt-8">
              <input
                type="email"
                value={emailBottom}
                onChange={(e) => setEmailBottom(e.target.value)}
                placeholder="Enter your email here"
                required
                className="w-full px-5 py-4 border border-gray-300 rounded bg-[#fcfcfc] focus:outline-none focus:border-[#004B8D] focus:ring-2 focus:ring-[#004B8D]/20 text-left text-base"
              />
              <div className="relative">
                <button
                  type="submit"
                  disabled={isSubmittingBottom}
                  className="w-full bg-[#004B8D] hover:bg-[#003666] text-white font-bold px-8 py-5 rounded text-sm sm:text-base uppercase tracking-wide transition-all shadow-md active:scale-[0.98]"
                >
                  {isSubmittingBottom ? 'Subscribing...' : (!isAdmin ? (pageData?.sub_button_text || "SUBSCRIBE NOW (IT'S FREE)") : <span className="opacity-0">Btn</span>)}
                </button>
                {isAdmin && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center pointer-events-auto cursor-pointer"
                    onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                  >
                    <EditableText
                      collection="content" docId="newsletter_page" field="sub_button_text"
                      defaultValue={pageData?.sub_button_text}
                      className="text-white font-bold uppercase tracking-wide px-4"
                    />
                  </div>
                )}
              </div>

              {statusBottom.message && (
                <div className={`p-4 rounded flex items-center gap-2 mt-2 ${statusBottom.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {statusBottom.type === 'success' && <FiCheck className="flex-shrink-0" />}
                  <span className="text-sm font-medium">{statusBottom.message}</span>
                </div>
              )}
            </form>

            <EditableText
              collection="content" docId="newsletter_page" field="spam_notice"
              defaultValue={pageData?.spam_notice}
              className="text-sm text-gray-500 block italic pt-2"
            />
          </div>

        </div>
      </section>
    </div>
  );
}