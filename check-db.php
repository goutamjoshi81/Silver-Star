<?php
header('Content-Type: application/json');

$res = [
    'time' => date('c'),
    'has_psql' => false,
    'psql_version' => null,
    'is_ready' => null,
    'service_status' => null,
    'env_db' => getenv('DATABASE_URL') ?: 'none'
];

exec('which psql 2>&1', $outPsql, $codePsql);
if ($codePsql === 0 && !empty($outPsql[0])) {
    $res['has_psql'] = true;
    exec('psql --version 2>&1', $outVer);
    $res['psql_version'] = $outVer[0] ?? '';
}

exec('pg_isready 2>&1', $outReady, $codeReady);
$res['is_ready'] = [
    'code' => $codeReady,
    'output' => implode("\n", $outReady)
];

exec('systemctl is-active postgresql 2>&1', $outService);
$res['service_status'] = implode("\n", $outService);

echo json_encode($res, JSON_PRETTY_PRINT);
