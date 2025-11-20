// protect.js - Bảo vệ website khỏi sao chép code
// Created by [Tên bạn]

document.addEventListener('DOMContentLoaded', function() {
    console.log('Protection script loaded successfully!');
    
    // Chặn menu chuột phải
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        console.log('Right-click disabled');
    });
    
    // Chặn các phím tắt developer tools
    document.addEventListener('keydown', function(e) {
        // Chặn F12
        if (e.key === 'F12') {
            e.preventDefault();
            console.log('F12 disabled');
            return false;
        }
        
        // Chặn Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            console.log('Ctrl+Shift+I disabled');
            return false;
        }
        
        // Chặn Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            console.log('Ctrl+Shift+J disabled');
            return false;
        }
        
        // Chặn Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            console.log('Ctrl+U disabled');
            return false;
        }
        
        // Chặn Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            console.log('Ctrl+Shift+C disabled');
            return false;
        }
    });
    
    // Thêm bảo vệ chống mở DevTools
    let devToolsOpened = false;
    
    // Kiểm tra kích thước window (phát hiện DevTools)
    function checkDevTools() {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        
        if ((widthThreshold || heightThreshold) && !devToolsOpened) {
            devToolsOpened = true;
            console.log('DevTools detected - protection active');
            // Có thể thêm hành động khác ở đây
        }
    }
    
    // Kiểm tra định kỳ
    setInterval(checkDevTools, 1000);
});

console.log('Protection script initialized');
