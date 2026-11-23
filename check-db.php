<?php
header('Content-Type: application/json');

$res = [
    'time' => date('c'),
    'psql_version' => null,
    'has_silverstardb' => false,
    'databases' => [],
    'tables_in_silverstardb' => []
];

exec('psql --version 2>&1', $outVer);
$res['psql_version'] = $outVer[0] ?? '';

// Check databases list using postgres system user
exec('sudo -u postgres psql -lqt 2>&1 | cut -d \| -f 1 | grep -w silverstardb', $outDb);
$res['has_silverstardb'] = !empty($outDb);

exec('sudo -u postgres psql -lqt 2>&1 | cut -d \| -f 1', $allDbs);
$res['databases'] = array_values(array_filter(array_map('trim', $allDbs)));

// If silverstardb exists, check table count
if ($res['has_silverstardb']) {
    exec('sudo -u postgres psql -d silverstardb -c "\dt" 2>&1', $outTables);
    $res['tables_in_silverstardb'] = $outTables;
}

echo json_encode($res, JSON_PRETTY_PRINT);
