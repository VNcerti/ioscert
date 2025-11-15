// Main Vue.js application
document.addEventListener('DOMContentLoaded', function() {
    // Đảm bảo các biến global đã được load
    if (typeof SignUrl === 'undefined' || typeof StatusUrl === 'undefined' || typeof DownloadUrl === 'undefined') {
        console.error('API URLs chưa được khai báo. Vui lòng kiểm tra file config.js và index.js');
        return;
    }

    new Vue({
        el: '#app',
        data: {
            showStep1: true,
            showStep2: false,
            showStep3: false,
            showStep4: false,
            showDirectDownload: false,
            progressBar: 0,
            uploadStep: 1,
            ipa: null,
            ipaCss: 'invalid',
            ipaText: 'Chọn file .ipa...',
            p12: null,
            p12Css: 'invalid',
            p12Text: 'Chọn file .p12...',
            mobileprovision: null,
            mobCss: 'invalid',
            mobText: 'Chọn file .mobileprovision...',
            password: '',
            pwdCss: 'invalid',
            name: '',
            identifier: '',
            jobId: '',
            statusText: '',
            logText: '',
            download: '',
            download_ipa: '',
            shareUrl: '',
            directDownloadUrl: '',
            firestoreDocId: '',
            showPasswordSuggestions: false,
            passwordSuggestions: [],
            copySuccess: false,
            isFirebaseAvailable: false,
            firestoreInitialized: false
        },
        mounted() {
            console.log('App mounted, API URLs:', { SignUrl, StatusUrl, DownloadUrl });
            
            // Kiểm tra Firebase availability - CHỜ FIREBASE LOAD XONG
            this.initializeFirebase();
            
            // Load password suggestions from localStorage
            this.loadPasswordSuggestions();
            
            // Check if there's a download parameter in URL
            this.checkDirectDownload();
        },
        methods: {
            async initializeFirebase() {
                try {
                    console.log('🔄 Initializing Firebase...');
                    
                    // Đợi Firebase SDK load hoàn toàn
                    if (typeof firebase === 'undefined') {
                        console.log('⏳ Waiting for Firebase SDK to load...');
                        setTimeout(() => this.initializeFirebase(), 500);
                        return;
                    }
                    
                    // Kiểm tra xem Firebase đã được khởi tạo chưa
                    if (!firebase.apps.length) {
                        console.log('🚀 Initializing Firebase app...');
                        firebase.initializeApp(firebaseConfig);
                    }
                    
                    // Kiểm tra Firestore
                    if (typeof firebase.firestore === 'undefined') {
                        console.log('⏳ Waiting for Firestore to load...');
                        setTimeout(() => this.initializeFirebase(), 500);
                        return;
                    }
                    
                    // Test Firestore connection
                    const db = firebase.firestore();
                    await db.collection('test').limit(1).get();
                    
                    this.isFirebaseAvailable = true;
                    this.firestoreInitialized = true;
                    console.log('✅ Firebase is available and initialized');
                    
                } catch (error) {
                    console.error('❌ Firebase initialization failed:', error);
                    this.isFirebaseAvailable = false;
                    this.firestoreInitialized = false;
                    
                    // Thử lại sau 1 giây
                    setTimeout(() => this.initializeFirebase(), 1000);
                }
            },
            
            async checkFirebaseAvailability() {
                try {
                    if (typeof firebase === 'undefined') {
                        this.isFirebaseAvailable = false;
                        return false;
                    }
                    
                    const db = firebase.firestore();
                    // Test với query đơn giản
                    await db.collection('signed_apps').limit(1).get();
                    
                    this.isFirebaseAvailable = true;
                    console.log('✅ Firebase check passed');
                    return true;
                } catch (error) {
                    console.error('❌ Firebase check failed:', error);
                    this.isFirebaseAvailable = false;
                    return false;
                }
            },
            
            loadPasswordSuggestions() {
                const savedPasswords = localStorage.getItem('ipasign_password_history');
                if (savedPasswords) {
                    this.passwordSuggestions = JSON.parse(savedPasswords);
                }
            },
            
            savePasswordToHistory(password) {
                if (!password) return;
                
                const index = this.passwordSuggestions.indexOf(password);
                if (index > -1) {
                    this.passwordSuggestions.splice(index, 1);
                }
                
                this.passwordSuggestions.unshift(password);
                
                if (this.passwordSuggestions.length > 5) {
                    this.passwordSuggestions = this.passwordSuggestions.slice(0, 5);
                }
                
                localStorage.setItem('ipasign_password_history', JSON.stringify(this.passwordSuggestions));
            },
            
            selectPassword(password) {
                this.password = password;
                this.showPasswordSuggestions = false;
            },
            
            hidePasswordSuggestions() {
                setTimeout(() => {
                    this.showPasswordSuggestions = false;
                }, 200);
            },
            
            checkDirectDownload() {
                const urlParams = new URLSearchParams(window.location.search);
                const downloadId = urlParams.get('download');
                
                if (downloadId) {
                    this.loadFromFirestore(downloadId);
                }
            },
            
            async loadFromFirestore(docId) {
    try {
        if (!await this.checkFirebaseAvailability()) {
            console.log('Firebase not available, skipping Firestore load');
            return;
        }
        
        const db = firebase.firestore();
        const docRef = db.collection('signed_apps').doc(docId);
        const doc = await docRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            // Lấy link tải thực tế từ Firestore
            this.directDownloadUrl = data.download_url;
            this.showDirectDownload = true;
            this.showStep1 = false;
            this.showStep2 = false;
            this.showStep3 = false;
            this.showStep4 = false;
            
            setTimeout(() => {
                new QRCode(document.getElementById('directQrcode'), {
                    width: 130,
                    height: 130,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                }).makeCode(this.directDownloadUrl);
            }, 100);
        } else {
            alert('Link tải không tồn tại hoặc đã hết hạn!');
        }
    } catch (error) {
        console.error('Error loading from Firestore:', error);
        alert('Có lỗi xảy ra khi tải thông tin!');
    }
},
            
        async saveToFirestore(downloadUrl) {
    try {
        console.log('🔄 Starting Firestore save...');
        
        // Kiểm tra Firebase availability
        const isAvailable = await this.checkFirebaseAvailability();
        if (!isAvailable) {
            console.log('❌ Firebase not available for saving');
            return null;
        }
        
        const db = firebase.firestore();
        const shortId = generateShortId();
        
        console.log('📝 Saving to Firestore with ID:', shortId, 'URL:', downloadUrl);
        
        // Tạo document trong Firestore
        const docData = {
            download_url: downloadUrl, // Đây là link tải file IPA thực tế
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            app_name: this.name || 'Unknown App',
            bundle_id: this.identifier || 'Unknown Bundle ID',
            original_filename: this.ipa ? this.ipa.name : 'Unknown'
        };
        
        await db.collection('signed_apps').doc(shortId).set(docData);
        
        // Xác nhận document đã được lưu
        const docRef = db.collection('signed_apps').doc(shortId);
        const savedDoc = await docRef.get();
        
        if (savedDoc.exists) {
            this.firestoreDocId = shortId;
            
            // QUAN TRỌNG: Sửa thành domain chính xác của bạn
            this.shareUrl = `https://ioscert.site/sign-app/?download=${shortId}`;
            
            console.log('✅ Successfully saved to Firestore');
            console.log('🔗 Share URL:', this.shareUrl);
            console.log('📊 Document data:', savedDoc.data());
            
            return shortId;
        } else {
            console.error('❌ Document not found after save');
            return null;
        }
        
    } catch (error) {
        console.error('❌ Error saving to Firestore:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        return null;
    }
},
            
            getFile(e) {
                const file = e.target.files[0] || null;
                if (e.target.accept === '.ipa') {
                    this.ipa = file;
                    this.ipaCss = file ? 'valid' : 'invalid';
                    this.ipaText = file ? file.name : 'Chọn file .ipa...';
                } else if (e.target.accept === '.p12') {
                    this.p12 = file;
                    this.p12Css = file ? 'valid' : 'invalid';
                    this.p12Text = file ? file.name : 'Chọn file .p12...';
                } else if (e.target.accept === '.mobileprovision') {
                    this.mobileprovision = file;
                    this.mobCss = file ? 'valid' : 'invalid';
                    this.mobText = file ? file.name : 'Chọn file .mobileprovision...';
                }
            },
            
            async upload() {
                if (!this.ipa || !this.p12 || !this.mobileprovision || !this.password) {
                    alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
                    return;
                }
                
                this.savePasswordToHistory(this.password);
                
                this.showStep1 = false;
                this.showStep2 = true;
                this.progressBar = 0;
                this.uploadStep = 1;
                
                const progressInterval = setInterval(() => {
                    if (this.progressBar < 20) {
                        this.uploadStep = 1;
                    } else if (this.progressBar < 36) {
                        this.uploadStep = 2;
                    } else if (this.progressBar < 70) {
                        this.uploadStep = 3;
                    } else if (this.progressBar < 99) {
                        this.uploadStep = 4;
                    }
                    
                    if (this.progressBar >= 100) {
                        clearInterval(progressInterval);
                    }
                }, 100);
                
                const fd = new FormData();
                fd.append('ipa', this.ipa);
                fd.append('p12', this.p12);
                fd.append('mp', this.mobileprovision);
                fd.append('password', this.password);
                fd.append('app_name', this.name);
                fd.append('bundle_id', this.identifier);
                
                try {
                    console.log('Sending request to:', SignUrl);
                    const resp = await axios.post(SignUrl, fd, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                        onUploadProgress: e => {
                            if (e.lengthComputable) {
                                this.progressBar = Math.round(e.loaded / e.total * 100);
                            }
                        }
                    });
                    
                    this.jobId = resp.data.task_id;
                    this.showStep2 = false;
                    this.showStep3 = true;
                    this.pollStatus();
                } catch (err) {
                    clearInterval(progressInterval);
                    console.error('Upload error:', err);
                    alert(err.response?.data?.error || 'Gửi file thất bại. Vui lòng kiểm tra mạng hoặc dữ liệu.');
                    this.showStep1 = true;
                    this.showStep2 = false;
                }
            },
            
            async pollStatus() {
    this.statusText = 'Đang chờ';
    this.logText = '';
    const timer = setInterval(async () => {
        try {
            const res = await axios.get(`${StatusUrl}/${this.jobId}`);
            const d = res.data;
            this.statusText = d.status;
            this.logText = d.msg || '';
            
            if (d.status === 'SUCCESS') {
                const base = `${DownloadUrl}/${this.jobId}`;
                this.download = base;
                this.download_ipa = base;
                clearInterval(timer);
                
                console.log('✅ Signing successful, download URL:', base);
                
                // Hiển thị kết quả thành công NGAY LẬP TỨC
                this.showStep3 = false;
                this.showStep4 = true;
                
                // Tạo QR Code với link tải thực tế
                setTimeout(() => {
                    try {
                        new QRCode(document.getElementById('qrcode'), {
                            width: 130,
                            height: 130,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.H
                        }).makeCode(this.download);
                        console.log('QR code generated successfully');
                    } catch (qrError) {
                        console.error('QR code generation error:', qrError);
                    }
                }, 100);
                
                // THỬ LƯU VÀO FIRESTORE ĐỂ TẠO LINK CHIA SẺ
                console.log('🔄 Attempting to save to Firestore for sharing...');
                
                try {
                    const docId = await this.saveToFirestore(base);
                    if (docId) {
                        // THÀNH CÔNG: Tạo link chia sẻ dạng https://ioscert.site/sign-app/?download=abc123
                        this.shareUrl = `https://ioscert.site/sign-app/?download=${docId}`;
                        console.log('🎉 SUCCESS: Firestore save successful!');
                        console.log('🔗 Share URL:', this.shareUrl);
                    } else {
                        // THẤT BẠI: Dùng link trực tiếp
                        this.shareUrl = this.download;
                        console.log('⚠️ Firestore save failed, using direct URL');
                    }
                } catch (firestoreError) {
                    console.error('❌ Firestore operation error:', firestoreError);
                    this.shareUrl = this.download;
                }
                
                console.log('📋 FINAL shareUrl:', this.shareUrl);
                
            } else if (d.status === 'FAILURE') {
                clearInterval(timer);
                alert('Ký IPA thất bại');
                this.index();
            }
        } catch (err) {
            clearInterval(timer);
            console.error('Status polling error:', err);
            alert('Không thể lấy trạng thái. Vui lòng kiểm tra mạng.');
            this.index();
        }
    }, 3000);
},
            
            copyShareUrl() {
                const input = this.$refs.shareUrlInput;
                input.select();
                document.execCommand('copy');
                
                this.copySuccess = true;
                setTimeout(() => {
                    this.copySuccess = false;
                }, 3000);
            },
            
            index() { 
                window.location.href = window.location.pathname;
            },
            
            goToHome() {
                window.location.href = window.location.pathname;
            }
        },
        watch: {
            password(val) { 
                this.pwdCss = val.length ? 'valid' : 'invalid'; 
            }
        }
    });
});
