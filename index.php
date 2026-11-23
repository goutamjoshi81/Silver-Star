<?php
/**
 * Silver Star Facility Management - Public VPS Web Host Router
 * Serves the pre-built React applications and proxies /api to Node.js backend.
 *
 * Applications served:
 *  - /                 -> Corporate Website (platform/apps/website/dist)
 *  - /admin            -> Super Admin Panel (platform/apps/super-admin/dist)
 *  - /hr               -> HR & Payroll Panel (platform/apps/hr-panel/dist)
 *  - /ops              -> Operations Panel (platform/apps/operations-panel/dist)
 *  - /client           -> Client Portal (platform/apps/client-mobile/dist)
 *  - /employee         -> Field Officer Mobile (platform/apps/employee-mobile/dist)
 *  - /api/*            -> Backend Express API (http://127.0.0.1:5000/api/*)
 */

$rootDir = __DIR__;
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';

// -------------------------------------------------------------
// Helper: MIME types map
// -------------------------------------------------------------
function getMimeType($file) {
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $mimes = [
        'js'    => 'application/javascript; charset=UTF-8',
        'mjs'   => 'application/javascript; charset=UTF-8',
        'css'   => 'text/css; charset=UTF-8',
        'html'  => 'text/html; charset=UTF-8',
        'json'  => 'application/json; charset=UTF-8',
        'svg'   => 'image/svg+xml',
        'png'   => 'image/png',
        'jpg'   => 'image/jpeg',
        'jpeg'  => 'image/jpeg',
        'gif'   => 'image/gif',
        'webp'  => 'image/webp',
        'ico'   => 'image/x-icon',
        'woff'  => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf'   => 'font/ttf',
        'csv'   => 'text/csv',
        'xlsx'  => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    return $mimes[$ext] ?? 'application/octet-stream';
}

function serveFile($filePath) {
    if (file_exists($filePath) && !is_dir($filePath)) {
        $mime = getMimeType($filePath);
        header('Content-Type: ' . $mime);
        header('Content-Length: ' . filesize($filePath));
        if (strpos($mime, 'text/html') !== false) {
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
            header('Pragma: no-cache');
            header('Expires: 0');
        } else {
            header('Cache-Control: public, max-age=86400');
        }
        readfile($filePath);
        exit;
    }
}

// -------------------------------------------------------------
// 1. API Reverse Proxy -> http://127.0.0.1:5000/api/*
// -------------------------------------------------------------
if (strpos($uri, '/api') === 0) {
    $backendUrl = 'http://127.0.0.1:5000' . $_SERVER['REQUEST_URI'];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $backendUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    
    // Method & Body
    $method = $_SERVER['REQUEST_METHOD'];
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if ($method === 'POST' || $method === 'PUT' || $method === 'PATCH') {
        $body = file_get_contents('php://input');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    
    // Headers
    $headers = [];
    foreach (getallheaders() as $key => $val) {
        if (!in_array(strtolower($key), ['host', 'content-length'])) {
            $headers[] = "$key: $val";
        }
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    $curlErr  = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $hdrSize  = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);
    
    if ($curlErr) {
        http_response_code(502);
        header('Content-Type: application/json');
        echo json_encode([
            'error' => 'Backend API unavailable on port 5000',
            'details' => $curlErr
        ]);
        exit;
    }
    
    $respBody = substr($response, $hdrSize);
    http_response_code($httpCode ?: 200);
    header('Content-Type: application/json');
    echo $respBody;
    exit;
}

// -------------------------------------------------------------
// 2. Direct Root Public Assets (favicons, logos, icons)
// -------------------------------------------------------------
$searchAssetPaths = [
    $rootDir . '/platform/apps/website/dist' . $uri,
    $rootDir . '/platform/apps/super-admin/dist' . $uri,
    $rootDir . '/platform/apps/hr-panel/dist' . $uri,
    $rootDir . '/platform/apps/operations-panel/dist' . $uri,
    $rootDir . '/platform/apps/client-mobile/dist' . $uri,
    $rootDir . '/platform/apps/employee-mobile/dist' . $uri,
];

foreach ($searchAssetPaths as $candidate) {
    if (file_exists($candidate) && !is_dir($candidate)) {
        serveFile($candidate);
    }
}

// -------------------------------------------------------------
// 3. Sub-app routing: /super-admin, /hr-admin, /ops-admin, etc.
// -------------------------------------------------------------
$appRoutes = [
    '/super-admin'   => $rootDir . '/super-admin',
    '/admin'         => $rootDir . '/admin',
    '/hr-admin'      => $rootDir . '/hr-admin',
    '/hr'            => $rootDir . '/hr',
    '/ops-admin'     => $rootDir . '/ops-admin',
    '/ops'           => $rootDir . '/ops',
    '/client-portal' => $rootDir . '/client-portal',
    '/client'        => $rootDir . '/client',
    '/field-officer' => $rootDir . '/field-officer',
    '/employee'      => $rootDir . '/employee',
];

foreach ($appRoutes as $prefix => $distPath) {
    if ($uri === $prefix || strpos($uri, $prefix . '/') === 0) {
        $subPath = substr($uri, strlen($prefix));
        if ($subPath && file_exists($distPath . $subPath) && !is_dir($distPath . $subPath)) {
            serveFile($distPath . $subPath);
        }
        // SPA Fallback for the sub-app
        serveFile($distPath . '/index.html');
    }
}

// -------------------------------------------------------------
// 4. Default Application: Master Portals Hub
// -------------------------------------------------------------
if (file_exists($rootDir . '/index.html')) {
    serveFile($rootDir . '/index.html');
}

// Fallback message if dist has not been pulled yet
http_response_code(503);
echo "<h1>Silver Star Platform - Building Site</h1><p>Website bundles are initializing. Please run git pull or deploy-hook.</p>";
