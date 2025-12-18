const API_ENDPOINT = 'https://ckapi.ipasign.cc/checkcert';

// API Certificate Service
class APICertificateService {
    constructor() {
        this.apiEndpoint = API_ENDPOINT;
    }

    async checkCertificate(p12File, mobileProvisionFile, password) {
        try {
            const formData = new FormData();
            formData.append('p12', p12File);
            
            if (mobileProvisionFile) {
                formData.append('mp', mobileProvisionFile);
            }
            
            formData.append('password', password);
            
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.code === 0) {
                return {
                    success: true,
                    data: data
                };
            } else {
                // Xử lý thông báo lỗi mật khẩu không chính xác
                let errorMessage = data.msg || 'Không thể kiểm tra chứng chỉ';
                if (errorMessage.includes('Incorrect Password') || errorMessage.includes('password') || errorMessage.includes('Password')) {
                    errorMessage = 'Mật khẩu không chính xác. Vui lòng kiểm tra lại.';
                }
                return {
                    success: false,
                    error: errorMessage
                };
            }
            
        } catch (error) {
            console.error('❌ Lỗi API:', error);
            return {
                success: false,
                error: 'Lỗi kết nối đến server. Vui lòng thử lại sau.'
            };
        }
    }

    extractFromZip(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async function(e) {
                try {
                    const zip = new JSZip();
                    const zipData = await zip.loadAsync(e.target.result);
                    
                    let p12File = null;
                    let mobileProvisionFile = null;
                    
                    for (const fileName in zipData.files) {
                        const fileObj = zipData.files[fileName];
                        
                        if (!fileObj.dir) {
                            if (fileName.toLowerCase().endsWith('.p12')) {
                                const blob = await fileObj.async('blob');
                                p12File = new File([blob], fileName, { type: 'application/x-pkcs12' });
                            } else if (fileName.toLowerCase().endsWith('.mobileprovision')) {
                                const blob = await fileObj.async('blob');
                                mobileProvisionFile = new File([blob], fileName, { type: 'application/x-apple-aspen-config' });
                            }
                        }
                    }
                    
                    resolve({ p12File, mobileProvisionFile });
                    
                } catch (error) {
                    reject(new Error('Không thể đọc file ZIP: ' + error.message));
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Không thể đọc file'));
            };
            
            reader.readAsArrayBuffer(file);
        });
    }
}
