// Utility functions

// Hàm tạo ID ngắn (6 ký tự)
function generateShortId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// API URLs từ file index.js gốc
const SignUrl = 'https://sign.ipasign.cc/api/sign';
const StatusUrl = 'https://sign.ipasign.cc/api/status';
const DownloadUrl = 'https://sign.ipasign.cc/api/download';
