<?php
/**
 * Silver Star Platform - GitHub Webhook Deployment Script
 * Location on VPS: /home/silverstarindia.admin/public_html/deploy-hook.php
 * Webhook URL: http://129.121.170.111/deploy-hook.php?token=silverstar2026
 */

$token = $_GET['token'] ?? ($_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '');
if ($token !== 'silverstar2026') {
    http_response_code(403);
    die("Forbidden: Invalid deployment token.");
}

$projectDir = '/home/silverstarindia.admin/public_html';
if (!is_dir($projectDir)) {
    $projectDir = __DIR__;
}

chdir($projectDir);

echo "<pre>\n";
echo "====================================================\n";
echo "Silver Star Auto-Deploy: " . date('Y-m-d H:i:s') . "\n";
echo "====================================================\n\n";

// 1. Fetch & Hard Reset to ensure all pre-built dist folders are synced
echo "==> Pulling latest changes from GitHub origin/main...\n";
passthru("git fetch origin main 2>&1");
passthru("git reset --hard origin/main 2>&1");

// 2. Database migrations (if node and postgres are present)
echo "\n==> Checking database migrations...\n";
if (file_exists("$projectDir/platform/backend/src/db/migrate.js")) {
    passthru("node platform/backend/src/db/migrate.js 2>&1");
}

// 3. PM2 Process Management for Backend (port 5000)
echo "\n==> Reloading PM2 backend process...\n";
passthru("pm2 reload silverstar-backend || pm2 start ecosystem.config.cjs || pm2 restart all 2>&1");

echo "\n====================================================\n";
echo "Deployment Finished Successfully!\n";
echo "Visit: http://129.121.170.111/\n";
echo "====================================================\n";
echo "</pre>";
