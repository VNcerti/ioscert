// Firebase initialization
// Initialize Firebase với config từ file config.js
let db = null;
let firebaseAvailable = false;

try {
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.firestore();
        firebaseAvailable = true;
        console.log('Firebase initialized successfully');
    } else {
        console.log('Firebase is not available');
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
    firebaseAvailable = false;
}
