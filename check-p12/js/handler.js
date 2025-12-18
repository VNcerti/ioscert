// UI Handler Module
class UIHandler {
    constructor() {
        this.certService = null;
        this.apiService = null;
    }

    initializeServices() {
        try {
            this.certService = new FirebaseCertificateService();
            this.apiService = new APICertificateService();
            console.log('🚀 Services đã khởi tạo');
        } catch (error) {
            console.error('❌ Lỗi khởi tạo:', error);
        }
    }

    initializeEventListeners() {
        // File input events
        document.getElementById('p12File').addEventListener('change', this.handleFileSelect.bind(this));

        document.getElementById('password').addEventListener('input', this.handlePasswordInput.bind(this));

        // Đảo ngược chức năng hiển thị/ẩn mật khẩu
        document.getElementById('togglePassword').addEventListener('click', this.togglePasswordVisibility.bind(this));

        // Button events
        document.getElementById('checkButton').addEventListener('click', this.handleCheckCertificate.bind(this));
        document.getElementById('backButton').addEventListener('click', this.handleBackButton.bind(this));
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        const fileLabel = document.getElementById('p12FileLabel');
        const fileText = document.getElementById('fileText');
        
        if (file) {
            fileText.textContent = file.name;
            fileLabel.classList.add('has-file');
            
            // Animation feedback
            fileLabel.querySelector('i').style.transform = 'translateY(-5px) scale(1.1)';
            setTimeout(() => {
                fileLabel.querySelector('i').style.transform = '';
            }, 300);
        } else {
            fileText.textContent = 'Chọn file .p12 hoặc .zip';
            fileLabel.classList.remove('has-file');
        }
    }

    handlePasswordInput(event) {
        if (event.target.value.length > 0) {
            event.target.classList.add('has-value');
        } else {
            event.target.classList.remove('has-value');
        }
    }

    togglePasswordVisibility(event) {
        const passwordInput = document.getElementById('password');
        const icon = event.target.querySelector('i');
        
        // Đảo ngược: nếu đang là text (hiển thị) thì chuyển sang password (ẩn) và ngược lại
        const type = passwordInput.getAttribute('type') === 'text' ? 'password' : 'text';
        passwordInput.setAttribute('type', type);
        
        if (type === 'password') {
            icon.className = 'fas fa-eye';
        } else {
            icon.className = 'fas fa-eye-slash';
        }
        
        // Animation feedback
        event.target.style.transform = 'translateY(-50%) scale(1.1)';
        setTimeout(() => {
            event.target.style.transform = 'translateY(-50%)';
        }, 200);
    }

    async handleCheckCertificate() {
        const p12File = document.getElementById('p12File').files[0];
        const password = document.getElementById('password').value;

        if (!p12File || !password) {
            this.showError('Vui lòng chọn file P12 và nhập mật khẩu!');
            return;
        }

        this.hideError();
        this.hideSuccess();
        
        const checkButton = document.getElementById('checkButton');
        checkButton.disabled = true;
        checkButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang kiểm tra...';

        try {
            this.showLoadingSection();
            this.updateProgressBar(25, 'Đang tải file...');
            
            // Xử lý file ZIP nếu cần
            let p12FileToCheck = p12File;
            let mobileProvisionFile = null;
            
            if (p12File.name.toLowerCase().endsWith('.zip')) {
                this.updateProgressBar(40, 'Đang giải nén ZIP...');
                
                const extractedFiles = await this.apiService.extractFromZip(p12File);
                p12FileToCheck = extractedFiles.p12File;
                mobileProvisionFile = extractedFiles.mobileProvisionFile;
                
                if (!p12FileToCheck) {
                    throw new Error('Không tìm thấy file P12 trong file ZIP');
                }
            }
            
            this.updateProgressBar(60, 'Đang kết nối Apple Developer...');
            
            // Kiểm tra certificate với API
            const result = await this.apiService.checkCertificate(p12FileToCheck, mobileProvisionFile, password);
            
            this.updateProgressBar(90, 'Đang xử lý kết quả...');
            
            if (result.success) {
                const certInfo = result.data;
                
                // Tính toán thời gian còn lại
                if (certInfo.notAfter) {
                    const expiryDate = new Date(certInfo.notAfter);
                    const now = new Date();
                    const timeDiff = expiryDate - now;
                    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                    certInfo.daysLeft = daysLeft > 0 ? daysLeft : 0;
                }
                
                // Lưu vào Firebase
                if (this.certService) {
                    const shortId = await this.certService.saveCertificate(certInfo);
                    
                    // Tạo URL chia sẻ
                    const newUrl = `${window.location.origin}${window.location.pathname}?order=${shortId}`;
                    window.history.pushState({}, '', newUrl);
                    
                    this.showSuccess('✅ Đã lưu kết quả kiểm tra. Bạn có thể chia sẻ URL này cho người khác!');
                }
                
                // Hiển thị kết quả
                this.displayCertificateInfo(certInfo);
                this.showResultSection();
                
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            this.showCheckSection();
            this.showError(`❌ ${error.message}`);
            
        } finally {
            const checkButton = document.getElementById('checkButton');
            checkButton.disabled = false;
            checkButton.innerHTML = '<i class="fas fa-search"></i> Kiểm Tra Ngay';
        }
    }

    handleBackButton() {
        const baseUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.pushState({}, '', baseUrl);
        
        this.showCheckSection();
        this.resetForm();
        this.hideError();
        this.hideSuccess();
    }

    resetForm() {
        document.getElementById('p12File').value = '';
        document.getElementById('fileText').textContent = 'Chọn file .p12 hoặc .zip';
        document.getElementById('p12FileLabel').classList.remove('has-file');
        document.getElementById('password').value = '';
        document.getElementById('password').classList.remove('has-value');
        // Reset về hiển thị mật khẩu (text)
        document.getElementById('password').setAttribute('type', 'text');
        document.getElementById('togglePassword').innerHTML = '<i class="fas fa-eye-slash"></i>';
    }

    async handleOrderURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order');
        
        if (orderId && orderId.length === 8) {
            console.log('🔍 Đang tải certificate với Order ID:', orderId);
            
            try {
                if (!this.certService) {
                    this.certService = new FirebaseCertificateService();
                }
                
                this.showLoadingSection();
                this.updateProgressBar(50, 'Đang tải dữ liệu...');
                
                const certInfo = await this.certService.getCertificate(orderId);
                
                if (certInfo) {
                    console.log('✅ Tìm thấy certificate');
                    
                    // Tính toán thời gian còn lại nếu chưa có
                    if (certInfo.notAfter && !certInfo.daysLeft) {
                        const expiryDate = new Date(certInfo.notAfter);
                        const now = new Date();
                        const timeDiff = expiryDate - now;
                        certInfo.daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                    }
                    
                    this.displayCertificateInfo(certInfo);
                    this.showResultSection();
                } else {
                    console.log('❌ Không tìm thấy certificate hoặc đã hết hạn');
                    this.showCheckSection();
                    this.showError('Liên kết không tồn tại hoặc đã hết hạn (24 giờ)');
                }
                
            } catch (error) {
                console.error('Lỗi tải certificate:', error);
                this.showCheckSection();
                this.showError('Lỗi kết nối đến server. Vui lòng thử lại.');
            }
        } else {
            this.showCheckSection();
        }
    }

    showCheckSection() {
        document.getElementById('checkSection').style.display = 'block';
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'none';
    }

    showLoadingSection() {
        document.getElementById('checkSection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'block';
        document.getElementById('resultSection').style.display = 'none';
    }

    showResultSection() {
        document.getElementById('checkSection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('resultSection').style.display = 'block';
    }

    updateProgressBar(percent, stepName) {
        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = percent + '%';
        progressBar.textContent = Math.round(percent) + '%';
        
        const steps = document.querySelectorAll('.loading-step');
        let activeStep = 1;
        
        if (percent <= 25) activeStep = 1;
        else if (percent <= 50) activeStep = 2;
        else if (percent <= 75) activeStep = 3;
        else activeStep = 4;
        
        steps.forEach((step, index) => {
            const indicator = step.querySelector('.loading-step-indicator');
            
            if (index + 1 < activeStep) {
                step.classList.add('completed');
                step.classList.remove('active');
                indicator.textContent = '✓';
            } else if (index + 1 === activeStep) {
                step.classList.add('active');
                step.classList.remove('completed');
                indicator.textContent = index + 1;
            } else {
                step.classList.remove('active', 'completed');
                indicator.textContent = index + 1;
            }
        });
    }

    displayCertificateInfo(certInfo) {
        // Tên chứng chỉ
        document.getElementById('certName').textContent = certInfo.certName || 'Không rõ';
        
        // Ngày hết hạn
        if (certInfo.notAfter) {
            const expiryDate = new Date(certInfo.notAfter);
            document.getElementById('expiryDate').textContent = expiryDate.toLocaleDateString('vi-VN') + ' ' + expiryDate.toLocaleTimeString('vi-VN');
        } else {
            document.getElementById('expiryDate').textContent = 'Không rõ';
        }
        
        // Kiểm tra trạng thái
        const isRevoked = certInfo.revokedDate && certInfo.revokedDate.trim() !== '';
        const isExpired = certInfo.notAfter && new Date(certInfo.notAfter) < new Date();
        
        // Trạng thái
        let statusText, statusClass;
        if (isRevoked) {
            statusText = '🔴 Đã thu hồi';
            statusClass = 'status-revoked';
        } else if (certInfo.state === 'good' && !isExpired) {
            statusText = '🟢 Hoạt động';
            statusClass = 'status-active';
        } else if (isExpired) {
            statusText = '⚠️ Đã hết hạn';
            statusClass = 'status-expired';
        } else {
            statusText = '❓ Không xác định';
            statusClass = 'status-warning';
        }
        
        document.getElementById('status').textContent = statusText;
        document.getElementById('status').className = `info-value ${statusClass}`;
        
        // Thời gian còn lại
        const daysLeft = certInfo.daysLeft || 0;
        const daysLeftElement = document.getElementById('daysLeft');
        
        if (daysLeft > 0) {
            daysLeftElement.textContent = daysLeft;
            
            // Đặt màu theo trạng thái
            if (isRevoked) {
                daysLeftElement.style.color = '#ff5a5f';
            } else if (certInfo.state === 'good' && !isExpired) {
                daysLeftElement.style.color = '#00c853';
            } else if (isExpired) {
                daysLeftElement.style.color = '#ffb347';
            } else {
                daysLeftElement.style.color = 'var(--text-primary)';
            }
        } else {
            daysLeftElement.textContent = '0';
            
            // Đặt màu theo trạng thái
            if (isRevoked) {
                daysLeftElement.style.color = '#ff5a5f';
            } else {
                daysLeftElement.style.color = '#ff5a5f';
            }
        }
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
    }

    showSuccess(message) {
        const successElement = document.getElementById('successMessage');
        successElement.textContent = message;
        successElement.style.display = 'block';
    }

    hideSuccess() {
        document.getElementById('successMessage').style.display = 'none';
    }
}
