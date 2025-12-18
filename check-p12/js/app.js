// Main Application
class CertificateCheckerApp {
    constructor() {
        this.uiHandler = new UIHandler();
    }

    initialize() {
        // Initialize services
        this.uiHandler.initializeServices();
        
        // Initialize event listeners
        this.uiHandler.initializeEventListeners();
        
        // Handle URL parameters on startup
        setTimeout(() => {
            this.uiHandler.handleOrderURL();
        }, 500);
        
        // Setup global event listeners
        this.setupGlobalListeners();
        
        console.log('✅ Ứng dụng đã khởi tạo thành công');
    }

    setupGlobalListeners() {
        // Xử lý popstate (khi người dùng nhấn back/forward)
        window.addEventListener('popstate', () => {
            console.log('🔄 URL đã thay đổi');
            this.uiHandler.handleOrderURL();
        });

        // Xử lý khi trang load
        window.addEventListener('load', () => {
            this.uiHandler.handleOrderURL();
        });
    }
}

// Khởi chạy ứng dụng khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    const app = new CertificateCheckerApp();
    app.initialize();
});
