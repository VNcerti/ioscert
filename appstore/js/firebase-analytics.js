// Firebase Configuration - Sử dụng config của bạn
const firebaseConfig = {
    apiKey: "AIzaSyC9VMDowjZ05A-ZqycaFYI5CtRcjazdZm4",
    authDomain: "ioscert-appstore.firebaseapp.com",
    projectId: "ioscert-appstore",
    storageBucket: "ioscert-appstore.firebasestorage.app",
    messagingSenderId: "798453453536",
    appId: "1:798453453536:web:965eeebcbf3b043ea1b685",
    measurementId: "G-EP3FHT2B4B"
};

// Initialize Firebase
let analytics;
let db;

try {
    const app = firebase.initializeApp(firebaseConfig);
    analytics = firebase.analytics();
    db = firebase.firestore();
    
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// Track page view
function trackPageView() {
    if (typeof firebase === 'undefined') {
        console.log('Firebase not loaded');
        return;
    }
    
    const visitData = {
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: {
            width: screen.width,
            height: screen.height
        },
        url: window.location.href,
        referrer: document.referrer || 'direct',
        sessionId: getSessionId(),
        pageTitle: document.title
    };

    // Save to Firestore
    db.collection('visits').add(visitData)
        .then((docRef) => {
            console.log('Visit recorded with ID: ', docRef.id);
            
            // Update daily stats
            updateDailyStats();
        })
        .catch((error) => {
            console.error('Error recording visit: ', error);
        });

    // Log analytics event
    analytics.logEvent('page_view', {
        page_location: window.location.href,
        page_title: document.title,
        page_referrer: document.referrer
    });
}

// Generate or get session ID
function getSessionId() {
    let sessionId = sessionStorage.getItem('firebase_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('firebase_session_id', sessionId);
    }
    return sessionId;
}

// Update daily visit statistics
function updateDailyStats() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const statsRef = db.collection('stats').doc('daily').collection('dates').doc(today);
    
    statsRef.get().then((doc) => {
        if (doc.exists) {
            // Update existing document
            statsRef.update({
                totalVisits: firebase.firestore.FieldValue.increment(1),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Create new document
            statsRef.set({
                date: today,
                totalVisits: 1,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }).catch((error) => {
        console.error('Error updating stats:', error);
    });
}

// Track custom events
function trackCustomEvent(eventName, eventParams = {}) {
    if (typeof firebase !== 'undefined' && analytics) {
        analytics.logEvent(eventName, eventParams);
        
        // Also save to Firestore for detailed analysis
        db.collection('events').add({
            event: eventName,
            params: eventParams,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            url: window.location.href
        });
    }
}

// Track app downloads
function trackAppDownload(appName, appId) {
    trackCustomEvent('app_download', {
        app_name: appName,
        app_id: appId
    });
}

// Track search events
function trackSearch(searchTerm, resultsCount) {
    trackCustomEvent('search', {
        search_term: searchTerm,
        results_count: resultsCount
    });
}

// Get total visits count
async function getTotalVisits() {
    try {
        const visitsRef = db.collection('visits');
        const snapshot = await visitsRef.count().get();
        return snapshot.data().count;
    } catch (error) {
        console.error('Error getting total visits:', error);
        return 0;
    }
}

// Get today's visits count
async function getTodayVisits() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const todayStart = new Date(today + 'T00:00:00.000Z');
        const todayEnd = new Date(today + 'T23:59:59.999Z');
        
        const visitsRef = db.collection('visits');
        const snapshot = await visitsRef
            .where('timestamp', '>=', todayStart)
            .where('timestamp', '<=', todayEnd)
            .count()
            .get();
            
        return snapshot.data().count;
    } catch (error) {
        console.error('Error getting today visits:', error);
        return 0;
    }
}

// Initialize tracking when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for Firebase to initialize
    setTimeout(() => {
        trackPageView();
    }, 1000);
});

// Track when user leaves the page
window.addEventListener('beforeunload', function() {
    const duration = Date.now() - performance.timing.navigationStart;
    trackCustomEvent('session_end', {
        session_duration: duration,
        page: window.location.pathname
    });
});
