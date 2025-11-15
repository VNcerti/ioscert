// Firebase initialization
// Initialize Firebase với config từ file config.js
let db = null;
let firebaseAvailable = false;

try {
    if (typeof firebase !== 'undefined') {
        // Kiểm tra xem Firebase đã được khởi tạo chưa
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('Firebase initialized successfully');
        } else {
            console.log('Firebase already initialized');
        }
        db = firebase.firestore();
        firebaseAvailable = true;
        console.log('Firestore initialized successfully');
    } else {
        console.error('Firebase SDK not loaded');
        firebaseAvailable = false;
    }
} catch (error) {
    console.error('Firebase initialization error:', error);
    firebaseAvailable = false;
}
