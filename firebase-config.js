// Firebase Configuration for AGL Maintenance Tracker
// Using Firebase v8 compat syntax (required for your app)

const firebaseConfig = {
  apiKey: "AIzaSyCCjDHGaAFnXP05CaswFEh3OlRMMrqQmN8",
  authDomain: "agl-tracking-26r.firebaseapp.com",
  databaseURL: "https://agl-tracking-26r-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "agl-tracking-26r",
  storageBucket: "agl-tracking-26r.firebasestorage.app",
  messagingSenderId: "78066725789",
  appId: "1:78066725789:web:742370c20d055414feb574",
  measurementId: "G-GVJ65XM3ED"
};

// Initialize Firebase (v8 compat syntax)
firebase.initializeApp(firebaseConfig);

console.log('✅ Firebase config loaded for AGL Tracking');
console.log('📍 Database URL:', firebaseConfig.databaseURL);
