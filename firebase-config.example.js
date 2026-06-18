// Copy this file to `firebase-config.js` and replace the placeholder values.
// Do NOT commit your real `firebase-config.js` to public repositories.

const cfg = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "G-MEASUREMENT_ID"
};

// Expose as a global for non-dynamic-import fallbacks and export as module default.
window.__FIREBASE_CONFIG = cfg;
export default cfg;
