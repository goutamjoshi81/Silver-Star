<?php
$token = $_GET['token'] ?? '';
if ($token !== 'silverstar2026') { http_response_code(403); die("Forbidden: Invalid token"); }
chdir('/home/silverstarindia.admin/public_html');
echo "<pre>\n";
passthru("git fetch origin main 2>&1");
passthru("git reset --hard origin/main 2>&1");
passthru("netstat -tlpn 2>&1 | grep 5000 || ss -tulpn 2>&1 | grep 5000");
passthru("ps aux | grep -E 'node|pm2' 2>&1");
echo "</pre>";
