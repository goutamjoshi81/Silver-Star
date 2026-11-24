<?php
$token = $_GET['token'] ?? '';
if ($token !== 'silverstar2026') { http_response_code(403); die("Forbidden: Invalid token"); }
chdir('/home/silverstarindia.admin/public_html');
echo "<pre>\n";
passthru("git fetch origin main 2>&1");
passthru("git reset --hard origin/main 2>&1");
echo "Whoami: " . exec('whoami') . "\n";
echo "Processes:\n";
passthru("ps aux | grep node 2>&1");
echo "\nPort 5000:\n";
passthru("fuser 5000/tcp 2>&1 || lsof -i :5000 2>&1 || netstat -tlpn | grep 5000 2>&1");
passthru("export PATH=\$PATH:/usr/local/bin:/usr/bin:/bin; pm2 logs silverstar-backend --lines 20 --nostream 2>&1");
echo "</pre>";
