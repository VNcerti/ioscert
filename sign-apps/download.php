<?php
$SIGNED_DIR = 'signed_apps/';
$PLIST_DIR = 'plists/';

// Log download requests
file_put_contents('download_log.txt', date('Y-m-d H:i:s') . ' - ' . $_SERVER['REMOTE_ADDR'] . ' - ' . ($_GET['file'] ?? 'unknown') . PHP_EOL, FILE_APPEND);

if (isset($_GET['file'])) {
    $fileId = preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['file']);
    
    // Check if it's a plist request
    if (isset($_GET['type']) && $_GET['type'] === 'plist') {
        $filePath = $PLIST_DIR . $fileId . '.plist';
        $mimeType = 'application/x-plist';
        $fileName = 'manifest.plist';
    } else {
        // It's an IPA file
        $filePath = $SIGNED_DIR . $fileId . '.ipa';
        $mimeType = 'application/octet-stream';
        $fileName = 'signed_app.ipa';
    }
    
    if (file_exists($filePath)) {
        header('Content-Type: ' . $mimeType);
        header('Content-Disposition: attachment; filename="' . $fileName . '"');
        header('Content-Length: ' . filesize($filePath));
        header('Cache-Control: no-cache, must-revalidate');
        header('Expires: 0');
        
        readfile($filePath);
        exit;
    }
}

// File not found
http_response_code(404);
echo 'File not found';
?>
