// Configuration file for API URLs and constants
const SignUrl = 'https://sign.ipasign.cc/sign';
const StatusUrl = 'https://sign.ipasign.cc/status';
const DownloadUrl = 'https://sign.ipasign.cc/download';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBeKh-_VbiM9F9S4iRdGllx3ypze0Gp4hw",
    authDomain: "ioscert-signer.firebaseapp.com",
    projectId: "ioscert-signer",
    storageBucket: "ioscert-signer.firebasestorage.app",
    messagingSenderId: "31766936132",
    appId: "1:31766936132:web:acf88a5f88396033ac1a11",
    measurementId: "G-7GYFBFWLHE"
};

// Utility function to generate short ID
function generateShortId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
