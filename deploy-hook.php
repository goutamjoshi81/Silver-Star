<?php
$token = $_GET['token'] ?? '';
if ($token !== 'silverstar2026') { http_response_code(403); die("Forbidden: Invalid token"); }
chdir('/home/silverstarindia.admin/public_html');
echo "<pre>\n";

// 1. Git pull
exec("git fetch origin main 2>&1", $gitOut);
exec("git reset --hard origin/main 2>&1", $gitOut);
exec("git status 2>&1", $gitOut);
echo implode("\n", $gitOut) . "\n";

// 2. Kill whatever process is holding port 5000
$hexPort = "1388";
$tcp = @file_get_contents('/proc/net/tcp');
$lines = explode("\n", $tcp ?: '');
$inode = null;
foreach ($lines as $line) {
    if (strpos($line, ":$hexPort ") !== false) {
        $parts = preg_split('/\s+/', trim($line));
        $inode = $parts[9] ?? null;
        break;
    }
}

if ($inode) {
    $pids = glob('/proc/[0-9]*');
    foreach ($pids as $p) {
        $pid = basename($p);
        $fds = @glob("$p/fd/*");
        if ($fds) {
            foreach ($fds as $fd) {
                if (@readlink($fd) === "socket:[$inode]") {
                    echo "Killing existing server on PID $pid...\n";
                    @exec("kill -9 $pid 2>&1");
                    break 2;
                }
            }
        }
    }
}

// 3. Restart backend
sleep(1);
exec("pm2 describe 0 2>&1", $pm2Desc);
echo implode("\n", $pm2Desc) . "\n";
exec("pm2 restart 0 --update-env 2>&1", $pm2Out);
echo implode("\n", $pm2Out) . "\n";
echo "Deployment & Server Restart Completed Successfully at " . date('Y-m-d H:i:s') . "\n";
echo "</pre>";
