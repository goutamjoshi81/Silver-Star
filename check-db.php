<?php
header('Content-Type: application/json');

$res = [
    'time' => date('c'),
    'psql_version' => null,
    'tcp_connect_5432' => false,
    'local_user_test' => null
];

exec('psql --version 2>&1', $outVer);
$res['psql_version'] = $outVer[0] ?? '';

// Test TCP connect to 127.0.0.1:5432
$fp = @fsockopen('127.0.0.1', 5432, $errno, $errstr, 2);
if ($fp) {
    $res['tcp_connect_5432'] = true;
    fclose($fp);
}

// Test with PGPASSWORD=1234 psql -U postgres -h 127.0.0.1
exec('PGPASSWORD=1234 psql -U postgres -h 127.0.0.1 -lqt 2>&1', $outConn);
$res['local_user_test'] = implode("\n", $outConn);

echo json_encode($res, JSON_PRETTY_PRINT);
