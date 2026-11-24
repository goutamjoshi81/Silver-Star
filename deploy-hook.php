<?php
$token = $_GET['token'] ?? '';
if ($token !== 'silverstar2026') { http_response_code(403); die("Forbidden: Invalid token"); }
chdir('/home/silverstarindia.admin/public_html');
echo "<pre>\n";
passthru("git fetch origin main 2>&1");
passthru("git reset --hard origin/main 2>&1");
// Restart or start PM2 process
passthru("export PATH=\$PATH:/usr/local/bin:/usr/bin:/bin:~/.nvm/versions/node/$(ls ~/.nvm/versions/node 2>/dev/null | tail -n 1)/bin; (cd /home/silverstarindia.admin/public_html/platform/backend && pm2 restart silverstar-backend 2>&1) || (cd /home/silverstarindia.admin/public_html/platform/backend && pm2 start src/server.js --name 'silverstar-backend' 2>&1)");
echo "\nDeployment and backend reload triggered successfully.\n";
echo "</pre>";
