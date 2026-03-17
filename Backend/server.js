const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

// Initialize Firebase Admin
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error.message);
  console.log('Please add serviceAccountKey.json file to Backend folder');
}

const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// YouTube API endpoint
app.get('/api/youtube/videos', async (req, res) => {
  try {
    const { channelId } = req.query;
    
    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    
    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    // Fetch latest videos from channel
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          key: YOUTUBE_API_KEY,
          channelId: channelId,
          part: 'snippet',
          order: 'date',
          maxResults: 3,
          type: 'video'
        }
      }
    );

    // Transform the response to a simpler format
    const videos = response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    res.json({ success: true, videos });
    
  } catch (error) {
    console.error('YouTube API Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch YouTube videos',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Contact form endpoint - Save to Firestore
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Save to Firestore
    const contactData = {
      name,
      email,
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'unread'
    };

    const docRef = await db.collection('contactMessages').add(contactData);
    console.log('Contact form saved with ID:', docRef.id);
    
    res.json({ 
      success: true, 
      message: 'Message received. We will get back to you soon!',
      id: docRef.id
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Notify admin about new comment (used by frontend after comment submission)
app.post('/api/notify/comment', async (req, res) => {
  try {
    const { name, email, comment, blogTitle, blogId, blogSlug } = req.body;

    if (!name || !comment || !(blogTitle || blogId)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.GMAIL_USER;
    if (!adminEmail) {
      return res.status(500).json({ error: 'Admin email not configured' });
    }

    const subject = `New comment on: ${blogTitle || blogSlug}`;
    const body = `<p>A new comment was posted on <strong>${blogTitle || blogSlug}</strong>.</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email || 'N/A'}</p>
      <p><strong>Comment:</strong></p>
      <blockquote style="background:#f8f9fb;padding:12px;border-left:3px solid #004B8D;">${comment}</blockquote>
      <p>Approve or moderate comments in Firestore collection <code>blog_comments</code> (document for blogId: ${blogId}).</p>`;

    await transporter.sendMail({
      from: `"Prof. Vishal Gupta | IIM Ahmedabad" <${process.env.GMAIL_USER}>`,
      to: adminEmail,
      subject,
      html: body,
      text: `${name} (${email || 'no-email'}) commented on ${blogTitle || blogSlug}:\n\n${comment}`
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Comment notification error:', err);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Public endpoint to fetch approved comments for a blog (uses Admin SDK so bypasses client rules)
app.get('/api/comments', async (req, res) => {
  try {
    const blogId = req.query.blogId;
    if (!blogId) return res.status(400).json({ error: 'Missing blogId query parameter' });

    // Query only by blogId to avoid requiring a composite index; filter and sort in code
    const snap = await db.collection('blog_comments')
      .where('blogId', '==', blogId)
      .get();

    console.log('Fetched comments snapshot size:', snap.size);

    // Filter approved comments and sort by createdAt ascending
    const comments = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(c => c.approved === true)
      .sort((a, b) => {
        const at = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate().getTime() : (new Date(a.createdAt || 0)).getTime();
        const bt = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate().getTime() : (new Date(b.createdAt || 0)).getTime();
        return at - bt;
      });
    res.json({ success: true, comments });
  } catch (err) {
    console.error('Error fetching comments via admin SDK:', err);
    console.error(err.stack || err);
    res.status(500).json({ error: 'Failed to fetch comments', details: err.message });
  }
});

// Newsletter subscription endpoint - Save to Firestore
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if email already exists
    const existingSubscriber = await db.collection('newsletter_subscribers')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingSubscriber.empty) {
      return res.status(400).json({ 
        error: 'This email is already subscribed!' 
      });
    }

    // Save to Firestore
    const subscriberData = {
      email,
      subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'active'
    };

    const docRef = await db.collection('newsletter_subscribers').add(subscriberData);
    console.log('Newsletter subscriber saved with ID:', docRef.id);
    
    res.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter!',
      id: docRef.id
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Newsletter send route
app.post('/api/newsletter/send', async (req, res) => {
  const { subject, body, subscribers } = req.body;

  if (!subject || !body || !subscribers?.length) {
    return res.status(400).json({ error: 'Missing required fields: subject, body, subscribers' });
  }

  // Wrap body in a fully branded HTML email template
  const htmlTemplate = (content) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#004B8D;padding:28px 36px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">IIM Ahmedabad</p>
              <h1 style="margin:6px 0 0;color:#ffffff;font-size:24px;font-weight:700;">Prof. Vishal Gupta</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Professor of Organizational Behavior</p>
            </td>
          </tr>
          <!-- Orange accent bar -->
          <tr><td style="height:4px;background:#f97316;"></td></tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px;color:#333333;font-size:15px;line-height:1.7;">
              ${content}
            </td>
          </tr>
          <!-- Divider -->
          <tr><td style="padding:0 36px;"><hr style="border:none;border-top:1px solid #e5e5e5;margin:0;" /></td></tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 36px;text-align:center;color:#999;font-size:12px;line-height:1.6;">
              <p style="margin:0 0 8px;">You are receiving this because you subscribed at <strong>iima-professor.com</strong></p>
              <p style="margin:0;">Prof. Vishal Gupta · IIM Ahmedabad · Vastrapur, Ahmedabad 380015</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const sent = [];
  const failed = [];

  for (const email of subscribers) {
    try {
      await transporter.sendMail({
        from: `"Prof. Vishal Gupta | IIM Ahmedabad" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: subject,
        html: htmlTemplate(body),
        // Plain text fallback (strip HTML tags)
        text: body.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      });
      sent.push(email);
      console.log(`Newsletter sent to: ${email}`);
    } catch (err) {
      console.error(`Failed to send to ${email}:`, err.message);
      failed.push({ email, error: err.message });
    }
  }

  console.log(`Newsletter: ${sent.length} sent, ${failed.length} failed`);
  res.json({ success: true, sent: sent.length, failed: failed.length, failedList: failed });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
