/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const smtpConfig = functions.config().smtp || {};
const SITE_CONFIG = functions.config().site || {};

const SMTP_USER = smtpConfig.user || '';
const SMTP_PASS = smtpConfig.pass || '';
const SMTP_HOST = smtpConfig.host || '';
const SMTP_PORT = smtpConfig.port ? Number(smtpConfig.port) : 587;
const SMTP_SECURE = smtpConfig.secure === 'true' || smtpConfig.secure === true;
const FROM_ADDRESS = SITE_CONFIG.from || 'No Reply <no-reply@yourdomain.com>';

let transporter;
if (SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST, port: SMTP_PORT, secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
} else if (SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail', auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
} else {
  transporter = null;
  console.warn('No SMTP configuration found.');
}

// ── HELPERS ──────────────────────────────────────────────
async function getAllSubscribers() {
  const snap = await admin.firestore()
    .collection('newsletter_subscribers')
    .where('status', '==', 'active')
    .get();
  return snap.docs.map(d => d.data().email).filter(Boolean);
}

async function sendBulkEmail(subject, html) {
  const emails = await getAllSubscribers();
  if (!emails.length) { console.log('No active subscribers.'); return; }
  if (!transporter) { console.error('No transporter configured.'); return; }
  for (const email of emails) {
    try {
      await transporter.sendMail({ from: FROM_ADDRESS, to: email, subject, html });
      console.log('Sent to', email);
    } catch (err) {
      console.error('Failed to send to', email, err.message);
    }
  }
}

function baseEmailWrapper(content) {
  return `
    <div style="font-family:Georgia,'Times New Roman',serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#111;background:#fff;">
      <div style="border-bottom:3px solid #2A35CC;padding-bottom:16px;margin-bottom:28px;">
        <h2 style="color:#2A35CC;margin:0;font-size:1.4rem;">Prof. Vishal Gupta</h2>
        <p style="color:#888;font-size:0.82rem;margin:4px 0 0;">Professor of Organizational Behavior · IIM Ahmedabad</p>
      </div>
      ${content}
      <hr style="margin:36px 0;border:none;border-top:1px solid #eee;"/>
      <p style="font-size:0.78rem;color:#aaa;line-height:1.6;">
        You are receiving this because you subscribed to updates from Prof. Vishal Gupta's website.
      </p>
    </div>`;
}

// ── 1. WELCOME EMAIL on new subscriber ───────────────────
exports.sendWelcomeEmail = functions
  .region('asia-south1')
  .firestore.document('newsletter_subscribers/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data() || {};
    const email = data.email;
    if (!email) return null;

    const html = baseEmailWrapper(`
      <h1 style="font-size:1.8rem;margin:0 0 16px;">Welcome aboard!</h1>
      <p style="color:#555;line-height:1.75;">Thank you for subscribing to updates from Prof. Vishal Gupta. You'll receive notifications about new articles, courses, and insights on leadership and organizational behavior.</p>
      <p style="color:#555;line-height:1.75;">In gratitude,<br/><strong>Prof. Vishal Gupta</strong><br/>IIM Ahmedabad</p>
    `);

    if (!transporter) {
      return snap.ref.update({ emailSent: false, emailError: 'transporter-not-configured' }).catch(() => null);
    }
    try {
      await transporter.sendMail({ from: FROM_ADDRESS, to: email, subject: 'Welcome — Prof. Vishal Gupta Updates', html });
      return snap.ref.update({ emailSent: true, emailSentAt: admin.firestore.FieldValue.serverTimestamp() });
    } catch (err) {
      return snap.ref.update({ emailSent: false, emailError: err.message }).catch(() => null);
    }
  });

// ── 2. MANUAL BROADCAST ──────────────────────────────────
exports.sendNewsletter = functions
  .region('asia-south1')
  .firestore.document('newsletter_campaigns/{docId}')
  .onCreate(async (snap) => {
    const { subject, body, status } = snap.data() || {};
    if (status !== 'send') return null;
    await sendBulkEmail(subject || 'Update from Prof. Vishal Gupta', baseEmailWrapper(body || ''));
    await snap.ref.update({ status: 'sent', sentAt: admin.firestore.FieldValue.serverTimestamp() });
    return null;
  });

// ── 3. AUTO NOTIFY — New blog published ──────────────────
exports.notifyNewBlog = functions
  .region('asia-south1')
  .firestore.document('blogs/{docId}')
  .onCreate(async (snap) => {
    const blog = snap.data() || {};
    if (!blog.published) return null;
    const content = `
      <p style="color:#f97316;font-size:0.78rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin:0 0 8px;">New Article</p>
      <h1 style="font-size:1.7rem;margin:0 0 16px;">${blog.title || 'New Blog Post'}</h1>
      <p style="color:#555;line-height:1.75;margin:0 0 24px;">${blog.excerpt || ''}</p>
      <a href="https://iima-vishal.vercel.app/blog" style="display:inline-block;padding:13px 28px;background:#2A35CC;color:#fff;text-decoration:none;border-radius:6px;">Read Article →</a>`;
    await sendBulkEmail(`New Article: ${blog.title || 'New Post'}`, baseEmailWrapper(content));
    return null;
  });

// ── 4. AUTO NOTIFY — New course published ────────────────
exports.notifyNewCourse = functions
  .region('asia-south1')
  .firestore.document('courses/{docId}')
  .onCreate(async (snap) => {
    const course = snap.data() || {};
    if (!course.published) return null;
    const content = `
      <p style="color:#f97316;font-size:0.78rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;margin:0 0 8px;">New Course Available</p>
      <h1 style="font-size:1.7rem;margin:0 0 16px;">${course.title || 'New Course'}</h1>
      <p style="color:#555;line-height:1.75;margin:0 0 24px;">${course.description || ''}</p>
      <a href="https://iima-vishal.vercel.app/courses" style="display:inline-block;padding:13px 28px;background:#2A35CC;color:#fff;text-decoration:none;border-radius:6px;">View Course →</a>`;
    await sendBulkEmail(`New Course: ${course.title || 'New Course'}`, baseEmailWrapper(content));
    return null;
  });
