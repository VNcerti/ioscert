<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cấu hình
$UPLOAD_DIR = 'uploads/';
$SIGNED_DIR = 'signed_apps/';
$TEMP_DIR = 'temp/';
$PLIST_DIR = 'plists/';
$MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Tạo thư mục nếu chưa tồn tại
$directories = [$UPLOAD_DIR, $SIGNED_DIR, $TEMP_DIR, $PLIST_DIR];
foreach ($directories as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Hàm response chuẩn
function response($success, $message = '', $data = []) {
    http_response_code($success ? 200 : 400);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'download_url' => $data['download_url'] ?? '',
        'plist_url' => $data['plist_url'] ?? ''
    ]);
    exit;
}

// Hàm log
function logMessage($message, $type = 'INFO') {
    $log = date('Y-m-d H:i:s') . " [$type] " . $message . PHP_EOL;
    file_put_contents('app_signing.log', $log, FILE_APPEND);
}

// Hàm xóa thư mục
function deleteDirectory($dir) {
    if (!is_dir($dir)) return true;
    
    $files = array_diff(scandir($dir), ['.', '..']);
    foreach ($files as $file) {
        $path = $dir . $file;
        is_dir($path) ? deleteDirectory($path) : unlink($path);
    }
    return rmdir($dir);
}

// Hàm tạo file plist
function generateManifestPlist($appUrl, $bundleId, $title, $version = "1.0") {
    $plistTemplate = '<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>items</key>
    <array>
        <dict>
            <key>assets</key>
            <array>
                <dict>
                    <key>kind</key>
                    <string>software-package</string>
                    <key>url</key>
                    <string>{APP_URL}</string>
                </dict>
                <dict>
                    <key>kind</key>
                    <string>display-image</string>
                    <key>url</key>
                    <string>https://yourdomain.com/icon57.png</string>
                </dict>
                <dict>
                    <key>kind</key>
                    <string>full-size-image</string>
                    <key>url</key>
                    <string>https://yourdomain.com/icon512.png</string>
                </dict>
            </array>
            <key>metadata</key>
            <dict>
                <key>bundle-identifier</key>
                <string>{BUNDLE_ID}</string>
                <key>bundle-version</key>
                <string>{VERSION}</string>
                <key>kind</key>
                <string>software</string>
                <key>title</key>
                <string>{TITLE}</string>
            </dict>
        </dict>
    </array>
</dict>
</plist>';

    return str_replace(
        ['{APP_URL}', '{BUNDLE_ID}', '{VERSION}', '{TITLE}'],
        [$appUrl, $bundleId, $version, $title],
        $plistTemplate
    );
}

// Hàm ký app (DEMO - cần tích hợp zsign thật)
function signAppDemo($inputPath, $outputPath, $p12Path, $password, $mobileprovisionPath) {
    logMessage("Starting app signing demo...");
    
    // Trong thực tế, bạn cần tích hợp zsign ở đây
    // $command = "zsign -k {$p12Path} -p {$password} -m {$mobileprovisionPath} -o {$outputPath} {$inputPath}";
    // exec($command, $output, $returnCode);
    
    // Tạm thời tạo file demo
    $demoContent = "SIGNED_IPA_DEMO\n";
    $demoContent .= "Signed at: " . date('Y-m-d H:i:s') . "\n";
    $demoContent .= "App: " . basename($inputPath) . "\n";
    $demoContent .= "Certificate: " . basename($p12Path) . "\n";
    
    if (file_put_contents($outputPath, $demoContent)) {
        logMessage("Demo app created successfully: " . $outputPath);
        return true;
    } else {
        logMessage("ERROR: Failed to create demo app", "ERROR");
        return false;
    }
}

try {
    logMessage("=== NEW SIGNING REQUEST STARTED ===");
    
    // Kiểm tra method
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        response(true, 'CORS preflight');
    }
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method không được hỗ trợ. Chỉ chấp nhận POST.');
    }

    // Kiểm tra file upload
    if (!isset($_FILES['p12']) || !isset($_FILES['mobileprovision'])) {
        throw new Exception('Vui lòng upload đầy đủ file P12 và mobileprovision');
    }

    $p12File = $_FILES['p12'];
    $mobileprovisionFile = $_FILES['mobileprovision'];
    $password = $_POST['password'] ?? '';
    $ipaName = $_POST['ipa_name'] ?? 'Esign.ipa';

    logMessage("Processing files: P12={$p12File['name']}, Mobileprovision={$mobileprovisionFile['name']}, App={$ipaName}");

    // Validate file upload errors
    if ($p12File['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Lỗi upload file P12: ' . $p12File['error']);
    }

    if ($mobileprovisionFile['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Lỗi upload file mobileprovision: ' . $mobileprovisionFile['error']);
    }

    // Validate file size
    if ($p12File['size'] > $MAX_FILE_SIZE) {
        throw new Exception('File P12 quá lớn (>100MB)');
    }

    if ($mobileprovisionFile['size'] > $MAX_FILE_SIZE) {
        throw new Exception('File mobileprovision quá lớn (>100MB)');
    }

    // Validate file type
    $p12Ext = strtolower(pathinfo($p12File['name'], PATHINFO_EXTENSION));
    $mobileprovisionExt = strtolower(pathinfo($mobileprovisionFile['name'], PATHINFO_EXTENSION));
    
    if ($p12Ext !== 'p12') {
        throw new Exception('File P12 phải có đuôi .p12');
    }

    if ($mobileprovisionExt !== 'mobileprovision') {
        throw new Exception('File provisioning phải có đuôi .mobileprovision');
    }

    // Tạo thư mục làm việc tạm
    $sessionId = 'esign_' . uniqid();
    $workDir = $TEMP_DIR . $sessionId . '/';
    
    if (!mkdir($workDir, 0755, true)) {
        throw new Exception('Không thể tạo thư mục làm việc tạm');
    }

    logMessage("Created working directory: " . $workDir);

    // Lưu file upload
    $p12Path = $workDir . 'cert.p12';
    $mobileprovisionPath = $workDir . 'embedded.mobileprovision';
    
    if (!move_uploaded_file($p12File['tmp_name'], $p12Path)) {
        throw new Exception('Không thể lưu file P12');
    }

    if (!move_uploaded_file($mobileprovisionFile['tmp_name'], $mobileprovisionPath)) {
        throw new Exception('Không thể lưu file mobileprovision');
    }

    logMessage("Files saved successfully");

    // Kiểm tra password P12
    $certData = [];
    if (!openssl_pkcs12_read(file_get_contents($p12Path), $certData, $password)) {
        throw new Exception('Mật khẩu P12 không đúng hoặc file bị lỗi');
    }

    logMessage("P12 password verified successfully");

    // Lấy thông tin certificate
    $certInfo = openssl_x509_parse($certData['cert']);
    $subject = $certInfo['subject'] ?? [];
    $certName = $subject['CN'] ?? 'Unknown Certificate';
    
    logMessage("Certificate info: " . $certName);

    // Đường dẫn app gốc (trong thực tế, bạn cần có các file IPA thật)
    $originalAppPath = 'sample_apps/' . $ipaName;
    
    // Nếu không có app thật, tạo file demo
    if (!file_exists($originalAppPath)) {
        $originalAppPath = $workDir . 'demo.ipa';
        file_put_contents($originalAppPath, "DEMO_IPA_FILE - " . date('Y-m-d H:i:s'));
        logMessage("Created demo IPA file: " . $originalAppPath);
    }

    // Đường dẫn app đã ký
    $signedIpaPath = $SIGNED_DIR . $sessionId . '.ipa';

    // === THỰC HIỆN KÝ APP ===
    logMessage("Starting app signing process...");
    if (!signAppDemo($originalAppPath, $signedIpaPath, $p12Path, $password, $mobileprovisionPath)) {
        throw new Exception('Lỗi trong quá trình ký ứng dụng');
    }

    logMessage("App signed successfully: " . $signedIpaPath);

    // Tạo URLs
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
    $host = $_SERVER['HTTP_HOST'];
    $baseUrl = "{$protocol}://{$host}/";
    
    $ipaUrl = $baseUrl . $signedIpaPath;
    
    // Tạo file .plist
    $plistFilename = $sessionId . '.plist';
    $plistPath = $PLIST_DIR . $plistFilename;
    
    // Bundle IDs tương ứng
    $bundleIds = [
        'Esign.ipa' => 'com.esign.esignapp',
        'GBox.ipa' => 'com.gbox.gboxapp', 
        'Scarlet.ipa' => 'com.scarlet.scarletapp',
        'Zsign.ipa' => 'com.zsign.zsignapp'
    ];
    
    $bundleId = $bundleIds[$ipaName] ?? 'com.esign.esignapp';
    $appTitle = pathinfo($ipaName, PATHINFO_FILENAME);
    
    $plistContent = generateManifestPlist($ipaUrl, $bundleId, $appTitle);
    if (!file_put_contents($plistPath, $plistContent)) {
        throw new Exception('Không thể tạo file plist');
    }
    
    logMessage("Plist file created: " . $plistPath);
    
    $plistUrl = $baseUrl . $plistPath;
    $itmsUrl = "itms-services://?action=download-manifest&url=" . urlencode($plistUrl);

    // Dọn dẹp thư mục tạm (giữ lại file đã ký và plist)
    deleteDirectory($workDir);
    logMessage("Temporary directory cleaned: " . $workDir);

    logMessage("=== SIGNING REQUEST COMPLETED SUCCESSFULLY ===");

    response(true, 'Ứng dụng đã được ký thành công!', [
        'download_url' => $itmsUrl,
        'plist_url' => $plistUrl
    ]);

} catch (Exception $e) {
    logMessage("ERROR: " . $e->getMessage(), "ERROR");
    
    // Dọn dẹp nếu có lỗi
    if (isset($workDir) && is_dir($workDir)) {
        deleteDirectory($workDir);
    }
    
    response(false, $e->getMessage());
}
?>
