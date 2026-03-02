import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiExternalLink, FiShoppingCart, FiAward, FiVideo, FiMic, FiEdit2, FiTrash2, FiPlus, FiBookOpen } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { db, storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { uploadToCloudinary } from '../utils/cloudinaryUpload';

// Hardcoded initial data extracted from the Google Sites HTML.
// You can later move this to Firebase Firestore just like your Courses.
const INITIAL_BOOKS = [
  {
    id: 1,
    title: "Organizational Theory, Design and Change",
    authors: "Jones, Gareth R., Gupta, Vishal & Gopakumar, KV",
    year: "2024",
    publisher: "Pearson: New Delhi",
    coverUrl: "https://via.placeholder.com/400x600/e6e8ff/1a1a1a?text=Organizational+Theory", // Replace with actual cover image
    amazonLink: "https://www.amazon.in/Organizational-Theory-Design-Change-Revised/dp/9361597256",
    flipkartLink: "",
    reviews: [
      {
        text: "Read the book review by Deepak Bhatt, Group Senior Vice-President, Gujarat, BW Businessworld Media Private Limited",
        link: "https://www.deepakbbhatt.com/post/book-review-75-amazing-indians-who-made-a-difference-a-tribute-to-india-s-trailblazers"
      }
    ],
    media: [],
    awards: []
  },
  {
    id: 2,
    title: "75 Amazing Indians Who Made a Difference",
    authors: "Gupta, Vishal K. & Gupta, Vishal",
    year: "2024",
    publisher: "Vitasta Publishing: New Delhi",
    coverUrl: "https://via.placeholder.com/400x600/fff7ed/1a1a1a?text=75+Amazing+Indians", // Replace with actual cover image
    amazonLink: "https://www.amazon.in/Amazing-Indians-Who-Made-Difference/dp/811967099X",
    flipkartLink: "https://www.flipkart.com/75-amazing-indians-made-difference/p/itm8606d83f38c0b?pid=9788119670994",
    reviews: [],
    media: [
      { type: 'video', text: "Conversation on the book at IIM Ahmedabad (August, 2021)", link: "https://www.youtube.com/watch?v=GNp7Z_75cRM" },
      { type: 'podcast', text: "Podcast on the book with Secrets of Storytellers (December, 2021)", link: "https://open.spotify.com/embed-podcast/episode/3Lg5ID3kgYuFYtBdrKwFF9" },
      { type: 'video', text: "Talk on the book at IIM Ranchi", link: "https://www.youtube.com/watch?v=toiEi6lzZwE&t=36s" }
    ],
    awards: []
  },
  {
    id: 3,
    title: "Demystifying Leadership: Unveiling the Mahabharata Code",
    authors: "Kaul, A. & Gupta, V.",
    year: "2021",
    publisher: "Bloomsbury: New Delhi",
    coverUrl: "https://via.placeholder.com/400x600/e6e8ff/1a1a1a?text=Demystifying+Leadership", // Replace with actual cover image
    amazonLink: "https://www.amazon.in/Demystifying-Leadership-Unveiling-Mahabharata-Code-ebook/dp/B095RFN1XC",
    flipkartLink: "",
    reviews: [],
    media: [],
    awards: [
      { text: "Business Book of the Year award in 'Business Management' category by FICCI (2022)", link: "https://ficci.in/pressrelease-page.asp?nid=4501" }
    ]
  },
  {
    id: 4,
    title: "First Among Equals: TREAT Leadership for LEAP in a Knowledge-based World",
    authors: "Gupta, V.",
    year: "2020",
    publisher: "Bloomsbury: New Delhi",
    coverUrl: "https://via.placeholder.com/400x600/fff7ed/1a1a1a?text=First+Among+Equals", // Replace with actual cover image
    amazonLink: "https://www.bloomsbury.com/in/first-among-equals-9789387471207/",
    flipkartLink: "",
    reviews: [
      { text: "Book review published in the South Asian Journal of Human Resources Management (SAJHRM)", link: "https://journals.sagepub.com/doi/full/10.1177/23220937211010231" },
      { text: "Book review published in People Matters", link: "https://www.peoplematters.in/blog/sports-books-movies/first-among-equals-t-r-e-a-t-leadership-for-l-e-a-p-in-a-knowledge-based-world-27720" },
      { text: "Book review published in BusinessWorld", link: "http://bwpeople.businessworld.in/article/First-Among-Equals-T-R-E-A-T-Leadership-for-L-E-A-P-in-a-Knowledge-Based-World-Prof-Vishal-Gupta-IIM-Ahmedabad-/16-07-2021-396895/" }
    ],
    media: [
      { type: 'video', text: "Conversation on the book at Ahmedabad University (July 31, 2021)", link: "https://www.youtube.com/watch?v=3nN_AF7NTEg" }
    ],
    awards: []
  }
];

// Function to fetch books from Firestore
const fetchBooks = async () => {
  const booksRef = collection(db, 'books');
  const q = query(booksRef, where('published', '==', true));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Function to add a new book
const addBook = async (book, file) => {
  try {
    let coverUrl = '';
    if (file) {
      coverUrl = await uploadToCloudinary(file, 'books');
    }
    await addDoc(collection(db, 'books'), { ...book, coverUrl, published: true });
  } catch (error) {
    console.error('Error adding book:', error);
  }
};

// Function to update a book
const updateBook = async (id, updatedBook, file) => {
  try {
    let coverUrl = updatedBook.coverUrl;
    if (file) {
      coverUrl = await uploadToCloudinary(file, 'books');
    }
    await updateDoc(doc(db, 'books', id), { ...updatedBook, coverUrl });
  } catch (error) {
    console.error('Error updating book:', error);
  }
};

// Function to delete a book
const deleteBook = async (id) => {
  try {
    await deleteDoc(doc(db, 'books', id));
  } catch (error) {
    console.error('Error deleting book:', error);
  }
};

// Admin editing functionality
const AdminBookControls = ({ book, onEdit, onDelete }) => (
  <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
    <button
      onClick={() => onEdit(book)}
      className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow"
    >
      <FiEdit2 size={16} />
    </button>
    <button
      onClick={() => onDelete(book.id)}
      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow"
    >
      <FiTrash2 size={16} />
    </button>
  </div>
);

export default function Books() {
  const { isAdmin } = useAuth() || {};
  const [books, setBooks] = useState(INITIAL_BOOKS);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const viewportOptions = {
    once: true,
    margin: "0px 0px -50px 0px",
    amount: 0.1
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#e6e8ff] to-[#fff7ed] py-20 px-6 lg:px-16 border-b border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="w-20 h-1 bg-[#f97316] mb-8 rounded-full mx-auto"></div>
            <h1 className="text-5xl lg:text-7xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-6">
              Books Authored
            </h1>
            <p className="text-xl lg:text-2xl font-['Inter'] text-gray-600 max-w-3xl mx-auto">
              Explore my published works bridging organizational theory, leadership dynamics, and ancient wisdom for the modern world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content - Safal Niveshak Layout Style */}
      <section className="py-16 px-6 lg:px-16 bg-white">
        <div className="max-w-5xl mx-auto">
          
          {isAdmin && (
            <div className="flex justify-end mb-12">
              <button className="flex items-center gap-2 bg-[#2A35CC] hover:bg-[#1f2a99] text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md">
                <FiPlus /> Add New Book
              </button>
            </div>
          )}

          <div className="space-y-24">
            {books.map((book, index) => (
              <motion.div 
                key={book.id}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOptions}
                variants={fadeInUp}
                className="flex flex-col md:flex-row gap-10 lg:gap-16 pb-24 border-b border-gray-200 last:border-b-0 relative group"
              >
                {/* Admin Controls */}
                {isAdmin && (
                  <AdminBookControls
                    book={book}
                    onEdit={(book) => setEditingBook(book)}
                    onDelete={deleteBook}
                  />
                )}

                {/* Left Column: Book Cover */}
                <div className="w-full md:w-1/3 lg:w-1/4 shrink-0">
                  <div className="rounded-xl overflow-hidden shadow-2xl transition-transform duration-300 hover:-translate-y-2 border border-gray-100 bg-gray-50 aspect-[2/3] relative">
                    <img 
                      src={book.coverUrl} 
                      alt={book.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Right Column: Book Details */}
                <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col justify-center">
                  <h2 className="text-3xl lg:text-4xl font-['Playfair_Display'] font-bold text-[#1a1a1a] mb-4 leading-tight">
                    {book.title}
                  </h2>
                  
                  <div className="mb-6 space-y-2 font-['Inter']">
                    <p className="text-lg text-gray-800">
                      <span className="font-semibold text-gray-900">Authors:</span> {book.authors}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Published:</span> {book.publisher} ({book.year})
                    </p>
                  </div>

                  {/* Badges/Awards */}
                  {book.awards && book.awards.length > 0 && (
                    <div className="mb-6">
                      {book.awards.map((award, i) => (
                        <div key={i} className="inline-flex items-start gap-2 p-4 bg-[#fff7ed] border-l-4 border-[#f97316] rounded-r-lg">
                          <FiAward className="w-6 h-6 text-[#f97316] shrink-0 mt-0.5" />
                          <a href={award.link} target="_blank" rel="noopener noreferrer" className="text-[#1a1a1a] font-['Inter'] font-medium hover:text-[#f97316] transition-colors">
                            {award.text}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reviews List */}
                  {book.reviews && book.reviews.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FiBookOpen className="text-[#2A35CC]" /> Selected Reviews
                      </h4>
                      <ul className="space-y-2">
                        {book.reviews.map((review, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2A35CC] mt-2.5 shrink-0"></div>
                            <a href={review.link} target="_blank" rel="noopener noreferrer" className="text-gray-700 font-['Inter'] hover:text-[#2A35CC] transition-colors leading-relaxed">
                              {review.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Media / Talks List */}
                  {book.media && book.media.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FiVideo className="text-[#f97316]" /> Talks & Media
                      </h4>
                      <ul className="space-y-2">
                        {book.media.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            {item.type === 'video' ? (
                              <FiVideo className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                            ) : (
                              <FiMic className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                            )}
                            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-gray-700 font-['Inter'] hover:text-[#f97316] transition-colors leading-relaxed">
                              {item.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 mt-auto pt-6">
                    {book.amazonLink && (
                      <a
                        href={book.amazonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#2A35CC] hover:bg-[#1f2a99] text-white font-['Inter'] font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                      >
                        <FiShoppingCart /> Get it on Amazon
                      </a>
                    )}
                    {book.flipkartLink && (
                      <a
                        href={book.flipkartLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#2A35CC] text-[#2A35CC] hover:bg-[#e6e8ff] font-['Inter'] font-semibold rounded-lg transition-all"
                      >
                        <FiShoppingCart /> Get it on Flipkart
                      </a>
                    )}
                  </div>
                  
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}