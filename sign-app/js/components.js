// Vue Components
Vue.component('header-component', {
    template: `
        <header class="header">
            <div class="container">
                <div class="header-content">
                    <h1 class="logo">Unlimited IPA Notation Tool</h1>
                </div>
            </div>
        </header>
    `
});

Vue.component('features-component', {
    template: `
        <div class="container">
            <div class="features">
                <div class="features-grid">
                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="fas fa-check"></i>
                        </div>
                        <span>Công cụ ký IPA trực tuyến không cần MacOS</span>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="fas fa-check"></i>
                        </div>
                        <span>Hệ thống tự động 24/7, dễ sử dụng, không quảng cáo</span>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="fas fa-check"></i>
                        </div>
                        <span>Ký/tinh chỉnh file IPA dung lượng lớn không giới hạn</span>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="fas fa-check"></i>
                        </div>
                        <span>An toàn - Bảo mật - Tự động</span>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">
                            <i class="fas fa-check"></i>
                        </div>
                        <span><a href="https://chungchip12.com/" target="_blank" style="color: inherit; text-decoration: none;">Mua chứng chỉ ký iPA tại : Chungchip12.com</a></span>
                    </div>
                </div>
            </div>
        </div>
    `
});

Vue.component('step1-component', {
    template: `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <i class="fas fa-file-upload"></i>
                    Bước 1: Chọn file cần ký
                </h2>
            </div>
            <div class="card-body">
                <div class="grid">
                    <!-- IPA File -->
                    <div class="form-group">
                        <label class="form-label">File IPA</label>
                        <div class="file-input-container">
                            <input type="file" @change="getFile($event)" ref="ipa" required accept=".ipa" class="file-input" id="ipa">
                            <label for="ipa" class="file-input-label" :class="ipaCss">
                                <span class="file-name">{{ ipaText }}</span>
                                <i class="fas fa-cloud-upload-alt file-icon"></i>
                            </label>
                        </div>
                    </div>
                    
                    <!-- P12 File -->
                    <div class="form-group">
                        <label class="form-label">File chứng chỉ (.p12)</label>
                        <div class="file-input-container">
                            <input type="file" @change="getFile($event)" ref="p12" required accept=".p12" class="file-input" id="p12">
                            <label for="p12" class="file-input-label" :class="p12Css">
                                <span class="file-name">{{ p12Text }}</span>
                                <i class="fas fa-certificate file-icon"></i>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Mobile Provision File -->
                    <div class="form-group">
                        <label class="form-label">File Mobile Provision</label>
                        <div class="file-input-container">
                            <input type="file" ref="mob" @change="getFile($event)" required accept=".mobileprovision" class="file-input" id="mobileprovision">
                            <label for="mobileprovision" class="file-input-label" :class="mobCss">
                                <span class="file-name">{{ mobText }}</span>
                                <i class="fas fa-file-contract file-icon"></i>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Password -->
                    <div class="form-group">
                        <label class="form-label">Mật khẩu file .p12</label>
                        <input type="text" v-model="password" ref="pwd" placeholder="Nhập mật khẩu .p12" required class="text-input" :class="pwdCss" @focus="showPasswordSuggestions = true" @blur="hidePasswordSuggestions">
                        <div class="password-suggestions" v-if="showPasswordSuggestions && passwordSuggestions.length > 0">
                            <span class="password-suggestion" v-for="suggestion in passwordSuggestions" :key="suggestion" @click="selectPassword(suggestion)">
                                {{ suggestion }}
                            </span>
                        </div>
                    </div>
                    
                    <!-- Bundle ID -->
                    <div class="form-group">
                        <label class="form-label">Bundle ID mới (tùy chọn)</label>
                        <input type="text" v-model="identifier" ref="identifier" placeholder="Nhập BundleID mới" class="text-input">
                    </div>
                    
                    <!-- App Name -->
                    <div class="form-group">
                        <label class="form-label">Tên App mới (tùy chọn)</label>
                        <input type="text" v-model="name" ref="name" placeholder="Nhập tên App mới" class="text-input">
                    </div>
                </div>
                
                <button class="btn" @click="upload">
                    <i class="fas fa-signature"></i>
                    Ký ngay!
                </button>
            </div>
        </div>
    `,
    data() {
        return {
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
            showPasswordSuggestions: false,
            passwordSuggestions: []
        }
    },
    methods: {
        getFile(e) {
            const file = e.target.files[0] || null;
            if (e.target.accept === '.ipa') {
                this.ipa = file;
                this.ipaCss = file ? 'valid' : 'invalid';
                this.ipaText = file ? file.name : 'Chọn file .ipa...';
                this.$parent.ipa = file;
            } else if (e.target.accept === '.p12') {
                this.p12 = file;
                this.p12Css = file ? 'valid' : 'invalid';
                this.p12Text = file ? file.name : 'Chọn file .p12...';
                this.$parent.p12 = file;
            } else if (e.target.accept === '.mobileprovision') {
                this.mobileprovision = file;
                this.mobCss = file ? 'valid' : 'invalid';
                this.mobText = file ? file.name : 'Chọn file .mobileprovision...';
                this.$parent.mobileprovision = file;
            }
        },
        upload() {
            this.$parent.upload();
        },
        loadPasswordSuggestions() {
            const savedPasswords = localStorage.getItem('ipasign_password_history');
            if (savedPasswords) {
                this.passwordSuggestions = JSON.parse(savedPasswords);
            }
        },
        selectPassword(password) {
            this.password = password;
            this.showPasswordSuggestions = false;
            this.$parent.password = password;
        },
        hidePasswordSuggestions() {
            setTimeout(() => {
                this.showPasswordSuggestions = false;
            }, 200);
        }
    },
    mounted() {
        this.loadPasswordSuggestions();
    },
    watch: {
        password(val) { 
            this.pwdCss = val.length ? 'valid' : 'invalid';
            this.$parent.password = val;
        },
        name(val) {
            this.$parent.name = val;
        },
        identifier(val) {
            this.$parent.identifier = val;
        }
    }
});

Vue.component('step2-component', {
    template: `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <i class="fas fa-cloud-upload-alt"></i>
                    Bước 2: Đang tải file lên
                </h2>
            </div>
            <div class="card-body">
                <div class="upload-steps">
                    <div class="step-item" :class="{ active: uploadStep >= 1, completed: uploadStep > 1 }">
                        <div class="step-icon">
                            <i class="fas fa-file-upload"></i>
                        </div>
                        <span class="step-text">Tải IPA</span>
                    </div>
                    <div class="step-dot"></div>
                    <div class="step-item" :class="{ active: uploadStep >= 2, completed: uploadStep > 2 }">
                        <div class="step-icon">
                            <i class="fas fa-file-download"></i>
                        </div>
                        <span class="step-text">Nhận IPA</span>
                    </div>
                    <div class="step-dot"></div>
                    <div class="step-item" :class="{ active: uploadStep >= 3, completed: uploadStep > 3 }">
                        <div class="step-icon">
                            <i class="fas fa-signature"></i>
                        </div>
                        <span class="step-text">Bắt đầu ký</span>
                    </div>
                    <div class="step-dot"></div>
                    <div class="step-item" :class="{ active: uploadStep >= 4, completed: uploadStep > 4 }">
                        <div class="step-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <span class="step-text">Hoàn tất</span>
                    </div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-label">
                        <span>Đang tải lên...</span>
                        <span>{{ progressBar }}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{width: progressBar + '%'}"></div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            uploadStep: 1,
            progressBar: 0
        }
    },
    mounted() {
        this.uploadStep = this.$parent.uploadStep;
        this.progressBar = this.$parent.progressBar;
        
        // Watch for changes in parent data
        this.$parent.$watch('uploadStep', (newVal) => {
            this.uploadStep = newVal;
        });
        
        this.$parent.$watch('progressBar', (newVal) => {
            this.progressBar = newVal;
        });
    }
});

Vue.component('step3-component', {
    template: `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <i class="fas fa-cog"></i>
                    Bước 3: Đang xử lý
                </h2>
            </div>
            <div class="card-body">
                <div class="processing-container">
                    <i class="fas fa-cog spinner"></i>
                    <p class="processing-text">Đang xử lý file của bạn, vui lòng chờ...</p>
                    <p>Trạng thái: {{ statusText }}</p>
                    
                    <div class="log-container" v-if="logText">
                        {{ logText }}
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            statusText: '',
            logText: ''
        }
    },
    mounted() {
        this.statusText = this.$parent.statusText;
        this.logText = this.$parent.logText;
        
        // Watch for changes in parent data
        this.$parent.$watch('statusText', (newVal) => {
            this.statusText = newVal;
        });
        
        this.$parent.$watch('logText', (newVal) => {
            this.logText = newVal;
        });
    }
});

Vue.component('step4-component', {
    template: `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <i class="fas fa-check-circle"></i>
                    Bước 4: Hoàn tất
                </h2>
            </div>
            <div class="card-body">
                <div class="result-container">
                    <i class="fas fa-check-circle success-icon"></i>
                    <h3 class="result-title">Ký IPA thành công!</h3>
                    
                    <div class="result-content">
                        <div class="qr-container">
                            <p class="qr-title">Quét mã QR để cài đặt</p>
                            <div class="qr-code" id="qrcode"></div>
                        </div>
                        
                        <div class="link-container">
                            <p class="link-title">Bấm vào link để cài đặt</p>
                            <a :href="download" target="_blank" class="download-link">{{ download }}</a>
                        </div>
                    </div>

                    <!-- Share Section -->
                    <div class="share-section">
                        <h4 class="share-title">Chia sẻ ứng dụng</h4>
                        <div class="share-url">
                            <input type="text" :value="shareUrl" readonly class="share-url-input" ref="shareUrlInput">
                            <button class="copy-btn" @click="copyShareUrl">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <div class="copy-success" :class="{ show: copySuccess }" ref="copySuccess">
                            Đã sao chép thành công
                        </div>
                        <p style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">
                            Gửi link này cho người khác để họ cài đặt trực tiếp mà không cần ký lại!
                        </p>
                    </div>
                    
                    <button class="btn" @click="index">
                        <i class="fas fa-redo"></i>
                        Bắt đầu lại
                    </button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            download: '',
            shareUrl: '',
            copySuccess: false
        }
    },
    methods: {
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
            this.$parent.index();
        }
    },
    mounted() {
        this.download = this.$parent.download;
        this.shareUrl = this.$parent.shareUrl;
        
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
    }
});

Vue.component('direct-download-component', {
    template: `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">
                    <i class="fas fa-download"></i>
                    Cài đặt ứng dụng
                </h2>
            </div>
            <div class="card-body">
                <div class="result-container">
                    <i class="fas fa-mobile-alt success-icon"></i>
                    <h3 class="result-title">Ứng dụng đã sẵn sàng!</h3>
                    
                    <div class="result-content">
                        <div class="qr-container">
                            <p class="qr-title">Quét mã QR để cài đặt</p>
                            <div class="qr-code" id="directQrcode"></div>
                        </div>
                        
                        <div class="link-container">
                            <p class="link-title">Bấm vào link để cài đặt</p>
                            <a :href="directDownloadUrl" target="_blank" class="download-link">{{ directDownloadUrl }}</a>
                        </div>
                    </div>
                    
                    <button class="btn btn-secondary" @click="goToHome">
                        <i class="fas fa-home"></i>
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            directDownloadUrl: ''
        }
    },
    methods: {
        goToHome() {
            this.$parent.goToHome();
        }
    },
    mounted() {
        this.directDownloadUrl = this.$parent.directDownloadUrl;
        
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
    }
});

Vue.component('footer-component', {
    template: `
        <footer class="footer">
            <div class="container">
                <p>© 2023 VNCERT - Công cụ ký IPA trực tuyến</p>
            </div>
        </footer>
    `
});
