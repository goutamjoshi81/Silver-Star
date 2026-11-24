<?php
$token = $_GET['token'] ?? '';
if ($token !== 'silverstar2026') { http_response_code(403); die("Forbidden: Invalid token"); }
chdir('/home/silverstarindia.admin/public_html');
echo "<pre>\n";
passthru("git fetch origin main 2>&1");
passthru("git reset --hard origin/main 2>&1");
// Restart PM2 forcefully
passthru("export PATH=\$PATH:/usr/local/bin:/usr/bin:/bin; pm2 restart silverstar-backend --update-env 2>&1");
sleep(1);
// Direct fetch test inside VPS
passthru("node -e \"
const f = async () => {
  const r = await fetch('http://127.0.0.1:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'infosys_client', password: '+91 80 2852 0261', persona: 'field' })
  });
  console.log('LOCAL SERVER STATUS:', r.status, await r.json());
};
f();
\" 2>&1");
passthru("export PATH=\$PATH:/usr/local/bin:/usr/bin:/bin; pm2 logs silverstar-backend --lines 20 --nostream 2>&1");
echo "</pre>";
