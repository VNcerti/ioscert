// Firebase Configuration
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBCv_8gkQi2YPbXp0PyLZIp73NcNWMuZJ8",
    authDomain: "ios-cert-check-p12.firebaseapp.com",
    projectId: "ios-cert-check-p12",
    storageBucket: "ios-cert-check-p12.firebasestorage.app",
    messagingSenderId: "39487670631",
    appId: "1:39487670631:web:2362f3c305647d7acc87c2",
    measurementId: "G-47VMZZPJWX"
};

// Firebase Service Class
class FirebaseCertificateService {
    constructor() {
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        
        this.db = firebase.firestore();
        this.collectionName = 'certificates';
        this.ttl = 24 * 60 * 60 * 1000; // 24 giờ
    }

    generateShortId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    async saveCertificate(certInfo) {
        const shortId = this.generateShortId();
        const expiresAt = new Date(Date.now() + this.ttl);

        try {
            const certificateData = {
                data: certInfo,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                expiresAt: firebase.firestore.Timestamp.fromDate(expiresAt),
                views: 0,
                source: 'apple_api'
            };

            await this.db.collection(this.collectionName).doc(shortId).set(certificateData);
            console.log('✅ Đã lưu certificate với ID:', shortId);
            return shortId;
        } catch (error) {
            console.error('❌ Lỗi lưu certificate:', error);
            throw new Error('Không thể lưu dữ liệu lên server');
        }
    }

    async getCertificate(shortId) {
        try {
            const doc = await this.db.collection(this.collectionName).doc(shortId).get();
            
            if (!doc.exists) {
                console.log('❌ Không tìm thấy document với ID:', shortId);
                return null;
            }

            const data = doc.data();
            const now = new Date();
            const expiresAt = data.expiresAt.toDate();
            
            if (now > expiresAt) {
                console.log('🗑️ Certificate đã hết hạn, đang xóa...');
                await this.deleteCertificate(shortId);
                return null;
            }

            await this.db.collection(this.collectionName).doc(shortId).update({
                views: firebase.firestore.FieldValue.increment(1)
            });

            console.log('✅ Đã tải certificate:', data.data.certName);
            return data.data;
        } catch (error) {
            console.error('❌ Lỗi lấy certificate:', error);
            return null;
        }
    }

    async deleteCertificate(shortId) {
        try {
            await this.db.collection(this.collectionName).doc(shortId).delete();
            console.log('🗑️ Đã xóa certificate:', shortId);
        } catch (error) {
            console.error('❌ Lỗi xóa certificate:', error);
        }
    }
}
