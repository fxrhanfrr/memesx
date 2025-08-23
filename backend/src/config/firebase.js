import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Check if Firebase environment variables are set
let db, auth, storage, adminExport;

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.warn('⚠️  Firebase environment variables not set. Backend will run without Firebase functionality.');
  console.warn('   Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in your .env file');
  
  // Create mock exports for development
  db = {
    collection: () => ({
      where: () => ({ orderBy: () => ({ offset: () => ({ limit: () => ({ get: () => Promise.resolve({ docs: [], empty: true }) }) }) }) }),
      doc: () => ({ get: () => Promise.resolve({ exists: false, data: () => ({}) }) }),
      batch: () => ({
        set: () => ({ update: () => ({ delete: () => ({ commit: () => Promise.resolve() }) }) }),
        update: () => ({ commit: () => Promise.resolve() }),
        delete: () => ({ commit: () => Promise.resolve() })
      })
    })
  };
  auth = {
    verifyIdToken: () => Promise.resolve({ uid: 'mock-user-id' })
  };
  storage = {
    bucket: () => ({ file: () => ({ save: () => Promise.resolve() }) })
  };
  adminExport = { firestore: { FieldValue: { increment: (n) => n, arrayUnion: (arr) => arr, arrayRemove: (arr) => arr } } };
} else {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });
  }

  db = admin.firestore();
  auth = admin.auth();
  storage = admin.storage();
  adminExport = admin;
}

export { db, auth, storage };
export default adminExport;