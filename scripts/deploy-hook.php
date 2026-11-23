<?php
/**
 * Silver Star Platform - GitHub Webhook Auto-Deployment Script
 * Location on VPS: /home/silverstarindia.admin/public_html/deploy-hook.php
 *
 * Webhook URL: http://129.121.170.111/deploy-hook.php?token=silverstar2026
 */

$SECRET_TOKEN = 'silverstar2026';
$PROJECT_DIR  = '/home/silverstarindia.admin/public_html';

// Verify secret token from query string or headers
$receivedToken = $_GET['token'] ?? ($_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '');
if ($receivedToken !== $SECRET_TOKEN) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Forbidden: Invalid or missing token']);
    exit;
}

if (!is_dir($PROJECT_DIR)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => "Directory not found: $PROJECT_DIR"]);
    exit;
}

chdir($PROJECT_DIR);

$log = [];
$log[] = "Deployment started at " . date('Y-m-d H:i:s');

// 1. Fetch and reset to latest origin/main
exec("git fetch origin main 2>&1", $log);
exec("git reset --hard origin/main 2>&1", $log);

// 2. Install backend dependencies (production only)
if (is_dir("$PROJECT_DIR/platform/backend")) {
    exec("cd platform/backend && npm install --omit=dev 2>&1", $log);
    // Run database migrations if postgres is available
    exec("cd platform/backend && npm run migrate 2>&1", $log);
}

// 3. Reload or start PM2 process 'silverstar-backend'
exec("pm2 reload silverstar-backend || pm2 start ecosystem.config.cjs || (cd platform/backend && pm2 start src/server.js --name 'silverstar-backend') 2>&1", $log);
exec("pm2 save 2>&1", $log);

$log[] = "Deployment completed successfully at " . date('Y-m-d H:i:s');

header('Content-Type: application/json');
echo json_encode([
    'status' => 'success',
    'timestamp' => date('c'),
    'project' => 'Silver Star Facility Management',
    'output' => $log
], JSON_PRETTY_PRINT);
