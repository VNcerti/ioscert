new Vue({
    el: '#app',
    data() {
        return {
            showStep1: true,
            showStep2: false,
            showStep3: false,
            showStep4: false,
            showDirectDownload: false,
            progressBar: 0,
            uploadStep: 1,
            
            // File inputs
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
            
            // App selection
            selectedApp: '',
            uploadMode: 'manual', // 'manual' or 'preset'
            
            // Preset apps - DÙNG RAW URL CHUẨN
            presetApps: {
                'esign': {
                    name: 'ESign',
                    url: 'https://github.com/VNcerti/ioscert/raw/refs/heads/main/esign.ipa',
                    filename: 'esign.ipa'
                },
                'scarlet': {
                    name: 'Scarlet', 
                    url: 'https://github.com/VNcerti/ioscert/raw/refs/heads/main/scarlet.ipa',
                    filename: 'scarlet.ipa'
                },
                'gbox': {
                    name: 'Gbox',
                    url: 'https://github.com/VNcerti/ioscert/raw/refs/heads/main/gbox.ipa',
                    filename: 'gbox.ipa'
                }
            },
            
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
            copySuccess: false
        }
    },
    mounted() {
        // Load password suggestions from localStorage
        this.loadPasswordSuggestions();
        
        // Check if there's a download parameter in URL
        this.checkDirectDownload();
    },
    methods: {
        loadPasswordSuggestions() {
            const savedPasswords = localStorage.getItem('ipasign_password_history');
            if (savedPasswords) {
                this.passwordSuggestions = JSON.parse(savedPasswords);
            }
        },
        
        savePasswordToHistory(password) {
            if (!password) return;
            
            // Remove password if already exists
            const index = this.passwordSuggestions.indexOf(password);
            if (index > -1) {
                this.passwordSuggestions.splice(index, 1);
            }
            
            // Add to beginning of array
            this.passwordSuggestions.unshift(password);
            
            // Keep only last 5 passwords
            if (this.passwordSuggestions.length > 5) {
                this.passwordSuggestions = this.passwordSuggestions.slice(0, 5);
            }
            
            // Save to localStorage
            localStorage.setItem('ipasign_password_history', JSON.stringify(this.passwordSuggestions));
        },
        
        selectPassword(password) {
            this.password = password;
            this.showPasswordSuggestions = false;
        },
        
        hidePasswordSuggestions() {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => {
                this.showPasswordSuggestions = false;
            }, 200);
        },
        
        // App selection methods
        onAppSelect() {
            if (this.selectedApp) {
                this.uploadMode = 'preset';
                // Tự động điền tên app
                if (!this.name) {
                    this.name = this.getAppName(this.selectedApp);
                }
                
                // TỰ ĐỘNG LẤY FILE IPA KHI CHỌN APP
                this.autoGetPresetIpa(this.selectedApp);
            } else {
                this.uploadMode = 'manual';
            }
        },

        getAppName(appKey) {
            return this.presetApps[appKey]?.name || appKey;
        },

        async autoGetPresetIpa(appKey) {
            const app = this.presetApps[appKey];
            if (!app) return;
            
            try {
                this.statusText = `Đang tải ${app.name}...`;
                
                // Hiển thị loading
                this.ipaText = `Đang tải ${app.name}...`;
                this.ipaCss = 'valid';
                
                // Dùng axios để tải file từ Raw URL
                const response = await axios.get(app.url, {
                    responseType: 'blob',
                    timeout: 60000, // 60 giây timeout
                    onDownloadProgress: (progressEvent) => {
                        if (progressEvent.lengthComputable) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            this.ipaText = `Đang tải ${app.name}... ${percent}%`;
                        }
                    }
                });
                
                if (response.status !== 200) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const blob = response.data;
                
                // Kiểm tra file
                if (blob.size === 0) {
                    throw new Error('File tải về trống');
                }
                
                // Tạo File object từ blob
                const ipaFile = new File([blob], app.filename, {
                    type: 'application/octet-stream'
                });
                
                // Tự động gán file IPA
                this.ipa = ipaFile;
                this.ipaText = `${app.name} (${(ipaFile.size / 1024 / 1024).toFixed(1)}MB)`;
                this.ipaCss = 'valid';
                
                this.statusText = `${app.name} đã sẵn sàng!`;
                
                console.log(`✅ Tải thành công ${app.name}: ${ipaFile.size} bytes`);
                
            } catch (error) {
                console.error('Lỗi tải file tự động:', error);
                this.ipaText = 'Chọn file .ipa...';
                this.ipaCss = 'invalid';
                this.statusText = '';
                
                alert(`❌ Không thể tự động tải ${app.name}\n\n` +
                      `Vui lòng tải file thủ công từ:\n${app.url}`);
            }
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
                const docRef = db.collection('signed_apps').doc(docId);
                const doc = await docRef.get();
                
                if (doc.exists) {
                    const data = doc.data();
                    this.directDownloadUrl = data.download_url;
                    this.showDirectDownload = true;
                    this.showStep1 = false;
                    this.showStep2 = false;
                    this.showStep3 = false;
                    this.showStep4 = false;
                    
                    // Generate QR code for direct download
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
                // Generate short ID (6 characters)
                const shortId = generateShortId();
                
                // Create document in Firestore with short ID
                await db.collection('signed_apps').doc(shortId).set({
                    download_url: downloadUrl,
                    created_at: firebase.firestore.FieldValue.serverTimestamp(),
                    app_name: this.name || 'Unknown App',
                    bundle_id: this.identifier || 'Unknown Bundle ID'
                });
                
                this.firestoreDocId = shortId;
                this.shareUrl = `${window.location.origin}${window.location.pathname}?download=${shortId}`;
                return shortId;
            } catch (error) {
                console.error('Error saving to Firestore:', error);
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
            let ipaFile = this.ipa;
            
            // Validate required fields
            if (!ipaFile || !this.p12 || !this.mobileprovision || !this.password) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
                return;
            }
            
            // Save password to history
            this.savePasswordToHistory(this.password);
            
            this.showStep1 = false;
            this.showStep2 = true;
            this.progressBar = 0;
            this.uploadStep = 1;
            this.statusText = 'Đang bắt đầu upload...';
            
            // Simulate upload steps
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
            fd.append('ipa', ipaFile);
            fd.append('p12', this.p12);
            fd.append('mp', this.mobileprovision);
            fd.append('password', this.password);
            fd.append('app_name', this.name);
            fd.append('bundle_id', this.identifier);
            
            try {
                this.statusText = 'Đang upload file lên server...';
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
                this.statusText = 'Đang xử lý ký file...';
                this.pollStatus();
            } catch (err) {
                clearInterval(progressInterval);
                alert(err.response?.data?.error || 'Gửi file thất bại. Vui lòng kiểm tra mạng hoặc dữ liệu.');
                this.showStep1 = true;
                this.showStep2 = false;
                this.statusText = '';
            }
        },
        
        async pollStatus() {
            this.statusText = 'Đang chờ xử lý...';
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
                        
                        // Save to Firestore and get share URL
                        const docId = await this.saveToFirestore(base);
                        if (docId) {
                            this.showStep3 = false;
                            this.showStep4 = true;
                            this.statusText = 'Hoàn thành!';
                            
                            // Generate QR Code
                            setTimeout(() => {
                                new QRCode(document.getElementById('qrcode'), {
                                    width: 130,
                                    height: 130,
                                    colorDark: "#000000",
                                    colorLight: "#ffffff",
                                    correctLevel: QRCode.CorrectLevel.H
                                }).makeCode(this.download);
                            }, 100);
                        } else {
                            alert('Có lỗi khi tạo link chia sẻ!');
                            this.index();
                        }
                        
                    } else if (d.status === 'FAILURE') {
                        clearInterval(timer);
                        alert('Ký IPA thất bại');
                        this.index();
                    }
                } catch (err) {
                    clearInterval(timer);
                    alert('Không thể lấy trạng thái. Vui lòng kiểm tra mạng.');
                    this.index();
                }
            }, 3000);
        },
        
        copyShareUrl() {
            const input = this.$refs.shareUrlInput;
            input.select();
            document.execCommand('copy');
            
            // Show success message
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
