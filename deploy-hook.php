<?php
$token = $_GET['token'] ?? '';
if ($token !== 'silverstar2026') { http_response_code(403); die("Forbidden: Invalid token"); }
chdir('/home/silverstarindia.admin/public_html');
echo "<pre>\n";
// Find port 5000 in hex (5000 = 0x1388)
$hexPort = "1388";
$tcp = file_get_contents('/proc/net/tcp');
$lines = explode("\n", $tcp);
$inode = null;
foreach ($lines as $line) {
    if (strpos($line, ":$hexPort ") !== false) {
        $parts = preg_split('/\s+/', trim($line));
        $inode = $parts[9] ?? null;
        echo "Found socket on port 5000, inode: $inode\n";
        break;
    }
}

if ($inode) {
    // Search /proc for this socket inode
    $pids = glob('/proc/[0-9]*');
    foreach ($pids as $p) {
        $pid = basename($p);
        $cmd = @file_get_contents("$p/cmdline");
        $status = @file_get_contents("$p/status");
        if (preg_match('/Uid:\s*(\d+)/', $status, $m)) {
            $uid = $m[1];
        } else {
            $uid = 'unknown';
        }
        $fds = @glob("$p/fd/*");
        if ($fds) {
            foreach ($fds as $fd) {
                $target = @readlink($fd);
                if ($target === "socket:[$inode]") {
                    echo "MATCH! PID: $pid, UID: $uid, CMD: $cmd\n";
                }
            }
        }
    }
}
echo "</pre>";
