<?php
$token = $_GET['token'] ?? '';
if ($token !== 'silverstar2026') { http_response_code(403); die("Forbidden: Invalid token"); }
chdir('/home/silverstarindia.admin/public_html');
echo "<pre>\n";
passthru("git fetch origin main 2>&1");
passthru("git reset --hard origin/main 2>&1");
passthru("grep -n 'ENFORCEMENT' platform/backend/src/routes/auth.js 2>&1");
passthru("grep -n -C 5 'targetPersona ===' platform/backend/src/routes/auth.js 2>&1");
echo "</pre>";
