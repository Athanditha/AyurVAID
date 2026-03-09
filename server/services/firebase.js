const admin = require('firebase-admin');

// Ensure that you have generated your Firebase service account key
// from Project Settings > Service Accounts > Generate new private key
// and place it in the server directory as "firebase-service-account.json"
// Also make sure it is added to your .gitignore so it isn't committed remotely.

try {
  const serviceAccount = require('../firebase-service-account.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('🔥 Firebase Admin initialized successfully');
} catch (error) {
  console.warn('⚠️ Firebase Admin Initialization Warning: Could not find firebase-service-account.json file.');
  console.warn('Please download it from Firebase Console and place it in the server directory.');
}

const db = admin.firestore?.() || null;

module.exports = {
  admin,
  db
};
