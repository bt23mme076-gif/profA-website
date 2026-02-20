# Prof. Vishal Gupta - Academic Website Implementation Guide

## 🎯 Overview
This is a professional, academic website for Prof. Vishal Gupta (IIM Ahmedabad) built with React.js and Tailwind CSS. The design follows the exact block-based layout of **drlauriesantos.com** while using the minimalist typography and color palette of **safalniveshak.com**.

---

## 🎨 Design System

### Color Palette
- **Pure White**: `#ffffff` - Main background
- **Charcoal Black**: `#1a1a1a` - Primary text and dark elements
- **Accent Yellow**: `#ffcc00` - Call-to-action buttons, highlights, and accents
- **Neutral Backgrounds**: `#fafaf8`, `#f5f1e8` - Section backgrounds

### Typography
- **Headings**: `Playfair Display` (Serif) - High-contrast, elegant font for all headings
- **Body Text**: `Inter` (Sans-serif) - Clean, readable font for all body text

### Font Usage
```jsx
// In JSX/Tailwind
className="font-['Playfair_Display']"  // For headings
className="font-['Inter']"             // For body text
```

---

## 📐 Page Structure (Top to Bottom)

### 1. **Hero Section**
- **Layout**: Grid (2 columns on desktop, stacked on mobile)
- **Left**: Large serif headings with professional introduction
- **Right**: Professional portrait image with rounded corners and shadow
- **Features**: Framer Motion animations for smooth transitions

### 2. **Courses Section**
- **Layout**: Two symmetrical square blocks side-by-side
- **Style**: Rounded corners (32px), subtle gradient backgrounds
- **Features**: 
  - Aspect ratio maintained: `aspect-square`
  - Hover scale effect
  - "EXPLORE" trigger with border animation
  - Fully responsive (stacks on mobile)

### 3. **Recent Blog/Reflections**
- **Layout**: 3-column grid (1 column on mobile)
- **Features**:
  - High-quality image thumbnails (4:3 aspect ratio)
  - Bold article titles
  - Excerpt text
  - Publication dates
  - "More Articles" CTA button

### 4. **Testimonial**
- **Layout**: Full-width block with yellow background
- **Features**:
  - Large italic serif quote (centered)
  - Navigation arrows (hidden on mobile)
  - Attribution with source
  - High visual impact

### 5. **Books Section**
- **Layout**: 3-column grid (1 column on mobile)
- **Features**:
  - Book cover images (3:4 aspect ratio)
  - Subtle shadows with hover effects
  - Book titles and descriptions
  - "Buy on Amazon" CTAs

### 6. **Speaking Engagements (Digital Avatar)**
- **Layout**: Split-screen (50/50 on desktop, stacked on mobile)
- **Left**: Yellow background with heading, description, and CTA
- **Right**: Wide-angle speaking image
- **Features**: Responsive ordering (image on top for mobile)

### 7. **Newsletter**
- **Layout**: Horizontal minimalist block
- **Features**:
  - Thick yellow top border (8px)
  - 2-column layout (heading left, form right)
  - Email input with inline button
  - Fully responsive

---

## 🔧 Technical Implementation

### EditableText Integration
Every text element is wrapped in the `<EditableText />` component for admin editing:

```jsx
<EditableText
  field="hero_name"                    // Unique field identifier
  defaultValue="Prof. Vishal Gupta"    // Default content
  className="text-6xl font-['Playfair_Display']..."
  multiline={false}                    // Set to true for paragraphs
/>
```

### Responsive Behavior
- **Mobile First**: All sections stack vertically on mobile
- **Breakpoints**: Uses Tailwind's `lg:` prefix (1024px+) for desktop layouts
- **Square Blocks**: Maintain proportions using `aspect-square` and `aspect-[4/3]`
- **Grid System**: `grid-cols-1` on mobile, `md:grid-cols-2` or `md:grid-cols-3` on larger screens

### Animation
- **Framer Motion** is used for:
  - Hero section entrance animations
  - Hover effects on course blocks
  - Smooth transitions

---

## 📦 Required Assets

### Images to Add (Place in `/public` folder)

#### Homepage Images
1. **`/professor-portrait.jpg`** - Professional headshot (Portrait orientation, 3:4 ratio)
2. **`/speaking-image.jpg`** - Prof. speaking at an event (Landscape, 16:9 ratio)

#### Blog Thumbnails (Landscape, 4:3 ratio)
3. **`/blog-1.jpg`** - Blog post 1 thumbnail
4. **`/blog-2.jpg`** - Blog post 2 thumbnail
5. **`/blog-3.jpg`** - Blog post 3 thumbnail

#### Book Covers (Portrait, 3:4 ratio)
6. **`/book-1.jpg`** - First book cover
7. **`/book-2.jpg`** - Second book cover
8. **`/book-3.jpg`** - Third book cover

### Creating Placeholder Images
Until you have real images, you can use placeholder services:
```html
<!-- Example using placeholder.com -->
<img src="https://via.placeholder.com/800x1000/1a1a1a/ffffff?text=Prof.+Gupta" />
```

---

## 🔑 Content Fields for Admin Editing

All editable fields are stored in Firebase Firestore under:
- **Collection**: `content`
- **Document**: `home`

### Complete Field List

#### Hero Section
- `hero_greeting` - "Hey there! Meet"
- `hero_name` - "Prof. Vishal Gupta"
- `hero_subtitle` - "IIM Ahmedabad Professor..."
- `hero_description` - Main introductory paragraph

#### Courses
- `courses_heading` - "Management Courses"
- `course1_title` - "The Science of Leadership"
- `course1_description` - Course 1 description
- `course2_title` - "Strategy for Executives"
- `course2_description` - Course 2 description

#### Blog Section
- `blog_heading` - "Recent Reflections"
- `blog1_title`, `blog1_excerpt`
- `blog2_title`, `blog2_excerpt`
- `blog3_title`, `blog3_excerpt`

#### Testimonial
- `testimonial_quote` - Main quote text
- `testimonial_author` - Attribution

#### Books
- `books_heading` - "Published Works"
- `book1_title`, `book1_description`
- `book2_title`, `book2_description`
- `book3_title`, `book3_description`

#### Speaking
- `speaking_heading` - "Speaking Engagements..."
- `speaking_description` - Description paragraph

#### Newsletter
- `newsletter_heading` - "Wisdom delivered to your inbox."
- `newsletter_description` - Call-to-action text

---

## 🚀 Running the Application

### Development Mode
```bash
cd Frontend
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 📱 Responsive Design Checklist

### Mobile (< 768px)
- ✅ Single column layouts
- ✅ Stacked hero section
- ✅ Course blocks stack vertically
- ✅ Blog grid becomes single column
- ✅ Books grid becomes single column
- ✅ Speaking section: Image on top, content below
- ✅ Newsletter: Vertical layout

### Tablet (768px - 1023px)
- ✅ 2-column course grid
- ✅ 2-column blog grid
- ✅ 3-column books grid

### Desktop (1024px+)
- ✅ Full 2-column hero
- ✅ Side-by-side course blocks
- ✅ 3-column blog grid
- ✅ 3-column books grid
- ✅ Split-screen speaking section
- ✅ 2-column newsletter

---

## 🎯 Key Features

### 1. **Admin Editable Content**
- Every text element can be edited inline by authenticated admins
- No code changes needed for content updates

### 2. **Professional Design**
- Clean, academic aesthetic
- High-contrast typography
- Generous whitespace
- Consistent spacing and rhythm

### 3. **Performance Optimized**
- Lazy loading for images
- Optimized animations
- Minimal bundle size

### 4. **Accessibility**
- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Keyboard navigable

---

## 🛠️ Customization Guide

### Changing Colors
Edit in `tailwind.config.js`:
```javascript
colors: {
  primary: '#ffcc00',      // Yellow accent
  charcoal: '#1a1a1a',     // Dark text
  // Add more...
}
```

### Adding New Sections
1. Create a new `<section>` block in `Home.jsx`
2. Use consistent spacing: `py-24 px-6 lg:px-16`
3. Wrap all text in `<EditableText />`
4. Follow grid patterns from existing sections

### Modifying Course Blocks
The course blocks use `aspect-square` to maintain perfect squares. To change:
```jsx
// Replace aspect-square with custom ratio
className="aspect-[4/3]"  // 4:3 ratio
className="aspect-video"  // 16:9 ratio
```

---

## 📊 Browser Support
- ✅ Chrome/Edge (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🐛 Troubleshooting

### Fonts Not Loading
Ensure Google Fonts import is in `index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&family=Inter:wght@300;400;600;700&display=swap');
```

### Images Not Displaying
Check:
1. Images are in `/public` folder
2. Paths start with `/` (e.g., `/blog-1.jpg`)
3. File extensions match exactly

### EditableText Not Working
Verify:
1. Firebase is configured (`firebase/config.js`)
2. Admin is logged in (`AuthContext`)
3. Firestore collection `content` exists

---

## 📞 Support
For issues or questions, check:
- `FIREBASE_ADMIN_CREATE.md` - Admin setup
- `FIRESTORE_SETUP.md` - Database configuration
- `INSTALLATION.md` - Installation guide

---

## ✨ Credits
- **Design Inspiration**: drlauriesantos.com, safalniveshak.com
- **Fonts**: Google Fonts (Playfair Display, Inter)
- **Framework**: React.js + Tailwind CSS
- **Animations**: Framer Motion

---

**Built with ❤️ for Prof. Vishal Gupta @ IIM Ahmedabad**
