<?php
$token = $_GET['token'] ?? '';
if ($token !== 'silverstar2026') { http_response_code(403); die("Forbidden: Invalid token"); }
chdir('/home/silverstarindia.admin/public_html');
echo "<pre>\n";
passthru("git fetch origin main 2>&1");
passthru("git reset --hard origin/main 2>&1");
passthru("lsof -i :5000 2>&1");
passthru("fuser 5000/tcp 2>&1");
passthru("ss -lptn 'sport = :5000' 2>&1");
echo "</pre>";
