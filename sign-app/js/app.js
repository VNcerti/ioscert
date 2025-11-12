// THÊM 3 DÒNG NÀY
const SignUrl = 'https://sign.ipasign.cc/api/sign';
const StatusUrl = 'https://sign.ipasign.cc/api/status';
const DownloadUrl = 'https://sign.ipasign.cc/api/download';

new Vue({
    el: '#app',
    data: {
        showStep1: true,
        showStep2: false,
        showStep3: false,
        showStep4: false,
        progressBar: 0,
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
        download_ipa: ''
    },
    methods: {
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
            // Validate required fields
            if (!this.ipa || !this.p12 || !this.mobileprovision || !this.password) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
                return;
            }
            
            this.showStep1 = false;
            this.showStep2 = true;
            this.progressBar = 0;
            
            const fd = new FormData();
            fd.append('ipa', this.ipa);
            fd.append('p12', this.p12);
            fd.append('mp', this.mobileprovision);
            fd.append('password', this.password);
            fd.append('app_name', this.name);
            fd.append('bundle_id', this.identifier);
            
            try {
                const resp = await axios.post(SignUrl, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: e => {
                        if (e.lengthComputable) this.progressBar = Math.round(e.loaded / e.total * 100);
                    }
                });
                
                this.jobId = resp.data.task_id;
                this.showStep2 = false;
                this.showStep3 = true;
                this.pollStatus();
            } catch (err) {
                alert(err.response?.data?.error || 'Gửi file thất bại. Vui lòng kiểm tra mạng hoặc dữ liệu.');
                this.showStep1 = true;
                this.showStep2 = false;
            }
        },
        pollStatus() {
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
                        this.showStep3 = false;
                        this.showStep4 = true;
                        
                        // Generate QR Code
                        setTimeout(() => {
                            new QRCode(document.getElementById('qrcode'), {
                                width: 150,
                                height: 150,
                                colorDark: "#000000",
                                colorLight: "#ffffff",
                                correctLevel: QRCode.CorrectLevel.H
                            }).makeCode(this.download);
                        }, 100);
                        
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
        index() { 
            window.location.reload(); 
        }
    },
    watch: {
        password(val) { 
            this.pwdCss = val.length ? 'valid' : 'invalid'; 
        }
    }
});
