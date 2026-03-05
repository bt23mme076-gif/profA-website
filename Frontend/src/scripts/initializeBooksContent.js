import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config.js';

const INITIAL_BOOKS = [
  {
    id: 'organizational-theory-2024',
    title: "Organizational Theory, Design and Change",
    authors: "Jones, Gareth R., Gupta, Vishal & Gopakumar, KV",
    year: "2024",
    publisher: "Pearson: New Delhi",
    coverUrl: "https://placehold.co/400x600/e6e8ff/1a1a1a?text=Organizational+Theory",
    amazonLink: "https://www.amazon.in/Organizational-Theory-Design-Change-Revised/dp/9361597256",
    flipkartLink: "",
    reviews: [
      {
        text: "Read the book review by Deepak Bhatt, Group Senior Vice-President, Gujarat, BW Businessworld Media Private Limited",
        link: "https://www.deepakbbhatt.com/post/book-review-75-amazing-indians-who-made-a-difference-a-tribute-to-india-s-trailblazers"
      }
    ],
    media: [],
    awards: [],
    published: true,
    createdAt: new Date().toISOString(),
    order: 1
  },
  {
    id: '75-amazing-indians-2024',
    title: "75 Amazing Indians Who Made a Difference",
    authors: "Gupta, Vishal K. & Gupta, Vishal",
    year: "2024",
    publisher: "Vitasta Publishing: New Delhi",
    coverUrl: "https://placehold.co/400x600/fff7ed/1a1a1a?text=75+Amazing+Indians",
    amazonLink: "https://www.amazon.in/Amazing-Indians-Who-Made-Difference/dp/811967099X",
    flipkartLink: "https://www.flipkart.com/75-amazing-indians-made-difference/p/itm8606d83f38c0b?pid=9788119670994",
    reviews: [],
    media: [
      { type: 'video', text: "Conversation on the book at IIM Ahmedabad (August, 2021)", link: "https://www.youtube.com/watch?v=GNp7Z_75cRM" },
      { type: 'podcast', text: "Podcast on the book with Secrets of Storytellers (December, 2021)", link: "https://open.spotify.com/embed-podcast/episode/3Lg5ID3kgYuFYtBdrKwFF9" },
      { type: 'video', text: "Talk on the book at IIM Ranchi", link: "https://www.youtube.com/watch?v=toiEi6lzZwE&t=36s" }
    ],
    awards: [],
    published: true,
    createdAt: new Date().toISOString(),
    order: 2
  },
  {
    id: 'demystifying-leadership-2021',
    title: "Demystifying Leadership: Unveiling the Mahabharata Code",
    authors: "Kaul, A. & Gupta, V.",
    year: "2021",
    publisher: "Bloomsbury: New Delhi",
    coverUrl: "https://placehold.co/400x600/e6e8ff/1a1a1a?text=Demystifying+Leadership",
    amazonLink: "https://www.amazon.in/Demystifying-Leadership-Unveiling-Mahabharata-Code-ebook/dp/B095RFN1XC",
    flipkartLink: "",
    reviews: [],
    media: [],
    awards: [
      { text: "Business Book of the Year award in 'Business Management' category by FICCI (2022)", link: "https://ficci.in/pressrelease-page.asp?nid=4501" }
    ],
    published: true,
    createdAt: new Date().toISOString(),
    order: 3
  },
  {
    id: 'first-among-equals-2020',
    title: "First Among Equals: TREAT Leadership for LEAP in a Knowledge-based World",
    authors: "Gupta, V.",
    year: "2020",
    publisher: "Bloomsbury: New Delhi",
    coverUrl: "https://placehold.co/400x600/fff7ed/1a1a1a?text=First+Among+Equals",
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
    awards: [],
    published: true,
    createdAt: new Date().toISOString(),
    order: 4
  }
];

async function initializeBooksContent() {
  try {
    console.log('Initializing books content...');

    // Check if books collection already has data
    const booksRef = collection(db, 'books');
    const snapshot = await getDocs(booksRef);
    
    if (!snapshot.empty) {
      console.log(`Books collection already has ${snapshot.size} documents.`);
    }

    // Add books to Firestore
    for (const book of INITIAL_BOOKS) {
      const { id, ...bookData } = book;
      await setDoc(doc(db, 'books', id), bookData);
      console.log(`✓ Added: ${book.title}`);
    }

    return {
      success: true,
      message: `${INITIAL_BOOKS.length} books initialized successfully`
    };
    
  } catch (error) {
    console.error('Error initializing books:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the initialization if executed directly
if (typeof window !== 'undefined') {
  initializeBooksContent()
    .then((result) => {
      console.log(result.success ? '✅ Done!' : '❌ Failed:', result.message || result.error);
    })
    .catch((error) => {
      console.error('❌ Initialization failed:', error);
    });
}

export { initializeBooksContent };
