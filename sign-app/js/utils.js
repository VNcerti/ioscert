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

// API URLs - QUAN TRỌNG: Thêm các biến global này
window.SignUrl = 'https://sign.ipasign.cc/api/sign';
window.StatusUrl = 'https://sign.ipasign.cc/api/status'; 
window.DownloadUrl = 'https://sign.ipasign.cc/api/download';
