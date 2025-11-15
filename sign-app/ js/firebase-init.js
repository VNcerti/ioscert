// Firebase initialization
// Initialize Firebase với config từ file config.js
try {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
}
