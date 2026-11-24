<?php
$token = $_GET['token'] ?? '';
if ($token !== 'silverstar2026') { http_response_code(403); die("Forbidden: Invalid token"); }
chdir('/home/silverstarindia.admin/public_html');
echo "<pre>\n";
passthru("git fetch origin main 2>&1");
passthru("git reset --hard origin/main 2>&1");
passthru("export PATH=\$PATH:/usr/local/bin:/usr/bin:/bin; (cd /home/silverstarindia.admin/public_html/platform/backend && pm2 restart silverstar-backend --update-env 2>&1) || (cd /home/silverstarindia.admin/public_html/platform/backend && pm2 start src/server.js --name 'silverstar-backend' 2>&1)");
passthru("export PATH=\$PATH:/usr/local/bin:/usr/bin:/bin; pm2 logs silverstar-backend --lines 10 --nostream 2>&1");
echo "</pre>";
