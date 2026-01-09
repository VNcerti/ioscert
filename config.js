// File cấu hình Firebase đã mã hóa
// Bạn có thể mã hóa thông tin cấu hình Firebase tại đây

// Hàm giải mã cấu hình Firebase (ví dụ)
function decodeFirebaseConfig() {
  // Thực hiện giải mã ở đây
  // Đây chỉ là ví dụ - bạn cần thay thế bằng logic mã hóa/tháo mã thực tế
  const encodedConfig = {
    apiKey: "QUl6YVN5QjRFYnlVREFoRTVCSm11VFl4RzR5UlNfQVZnS2daMkU=",
    authDomain: "aW9zY2VydC1uZXd2Mi5maXJlYmFzZWFwcC5jb20=",
    projectId: "aW9zY2VydC1uZXd2Mg==",
    storageBucket: "aW9zY2VydC1uZXd2Mi5maXJlYmFzZXN0b3JhZ2UuYXBw",
    messagingSenderId: "ODMzODY2NjczMTAy",
    appId: "MToxODMzODY2NjczMTAyOndlYjoyZmQ2MWEzYTU1YTY2ZWQ2OTE5OTlm",
    measurementId: "Ry1TWlRQVkJRWlpY"
  };

  // Giải mã Base64 (ví dụ đơn giản)
  const decodeBase64 = (str) => atob(str);
  
  return {
    apiKey: decodeBase64(encodedConfig.apiKey),
    authDomain: decodeBase64(encodedConfig.authDomain),
    projectId: decodeBase64(encodedConfig.projectId),
    storageBucket: decodeBase64(encodedConfig.storageBucket),
    messagingSenderId: decodeBase64(encodedConfig.messagingSenderId),
    appId: decodeBase64(encodedConfig.appId),
    measurementId: decodeBase64(encodedConfig.measurementId)
  };
}

// Xuất cấu hình đã giải mã
export const firebaseConfig = decodeFirebaseConfig();
