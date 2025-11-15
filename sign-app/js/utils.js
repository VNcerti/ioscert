// Utility Functions

// Hàm tạo ID ngắn (6 ký tự)
function generateShortId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// API URLs - ĐẢM BẢO ĐÂY LÀ GLOBAL VARIABLES
var SignUrl = 'https://sign.ipasign.cc/api/sign';
var StatusUrl = 'https://sign.ipasign.cc/api/status'; 
var DownloadUrl = 'https://sign.ipasign.cc/api/download';

// Debug: Log để kiểm tra
console.log('API URLs loaded:', { SignUrl, StatusUrl, DownloadUrl });
