const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

(async ()=>{
  try {
    const blogId = process.argv[2] || 'AP2izAN3EmA1Aws8qTIp';
    console.log('Fetching comments for', blogId);
    const snap = await db.collection('blog_comments').where('blogId','==',blogId).get();
    console.log('docs:', snap.size);
    snap.docs.forEach(d => {
      const data = d.data();
      console.log('doc id', d.id, 'approved', data.approved, 'createdAt', data.createdAt);
      if (data.createdAt && data.createdAt.toDate) console.log('toDate ok', data.createdAt.toDate());
    });
  } catch (err) {
    console.error('ERR', err);
  }
  process.exit(0);
})();