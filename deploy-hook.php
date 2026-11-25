<?php
$token = $_GET['token'] ?? '';
if ($token !== 'silverstar2026') { http_response_code(403); die("Forbidden: Invalid token"); }
chdir('/home/silverstarindia.admin/public_html');
echo "<pre>\n";
passthru("git fetch origin main 2>&1");
passthru("git reset --hard origin/main 2>&1");
passthru("echo '1234' | sudo -S whoami 2>&1");
passthru("echo '1234' | sudo -S pm2 restart all 2>&1");
echo "</pre>";
