/**
 * Firebase Configuration & Initialization
 * 
 * IMPORTANT: Replace the dummy values below with your actual Firebase Project configuration.
 * You can find this in the Firebase Console -> Project Settings -> General -> Your apps.
 */
const firebaseConfig = {
  apiKey: "AIzaSyYOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

let db = null;
let auth = null;

try {
  // Only initialize if the user has actually provided a real config
  if (firebaseConfig.apiKey !== "AIzaSyYOUR_API_KEY_HERE" && firebaseConfig.projectId !== "your-project-id") {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    console.log("🔥 Firebase Initialized");
  } else {
    console.warn("🔥 Firebase config is using dummy values. Falling back to local data mode.");
  }
} catch (e) {
  console.error("🔥 Firebase Initialization Error.", e);
}
