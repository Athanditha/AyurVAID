const admin = require('firebase-admin');

// Ensure that you have generated your Firebase service account key
// from Project Settings > Service Accounts > Generate new private key
// and place it in the server directory as "firebase-service-account.json"
// Also make sure it is added to your .gitignore so it isn't committed remotely.

try {
  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // If running in a hosted environment, read from the environment variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    // Local development: read from the local file
    serviceAccount = require('../firebase-service-account.json');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log('🔥 Firebase Admin initialized successfully');
} catch (error) {
  console.warn('⚠️ Firebase Admin Initialization Warning: Could not initialize Firebase Admin SDK.');
  console.warn('Ensure FIREBASE_SERVICE_ACCOUNT environment variable is set or place firebase-service-account.json in the server directory.');
  console.error('Error detail:', error.message);
}

const db = admin.firestore?.() || null;

module.exports = {
  admin,
  db
};
