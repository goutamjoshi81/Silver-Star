<?php
$token = $_GET['token'] ?? '';
if ($token !== 'silverstar2026') { http_response_code(403); die("Forbidden: Invalid token"); }
chdir('/home/silverstarindia.admin/public_html');
echo "<pre>\n";
passthru("git fetch origin main 2>&1");
passthru("git reset --hard origin/main 2>&1");
// Restart PM2 process or reload node server
passthru("export PATH=\$PATH:/usr/local/bin:/usr/bin:/bin; pm2 restart silverstar-backend 2>&1 || pm2 reload silverstar-backend 2>&1 || pm2 restart all 2>&1 || pkill -f 'node src/server.js' 2>&1");
echo "\nDeployment and backend reload triggered successfully.\n";
echo "</pre>";
