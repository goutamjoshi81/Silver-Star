<?php
header('Content-Type: application/json');

$res = [];

// 1. Check sudo privileges without password
exec('sudo -n -l 2>&1', $sudoL, $codeSudo);
$res['sudo_non_interactive'] = [
    'code' => $codeSudo,
    'output' => implode("\n", $sudoL)
];

// 2. Try connecting as different users
$tryUsers = ['silverstarindia.admin', 'postgres', 'root', 'silverstar'];
foreach ($tryUsers as $u) {
    exec("psql -U $u -d template1 -c 'SELECT 1;' 2>&1", $outP, $codeP);
    $res['try_user_' . $u] = [
        'code' => $codeP,
        'output' => implode("\n", $outP)
    ];
    unset($outP);
}

// 3. Check if any file in /etc/postgresql or similar is readable
$hbaFiles = glob('/etc/postgresql/*/main/pg_hba.conf');
$res['hba_files'] = $hbaFiles;
if (!empty($hbaFiles)) {
    $res['hba_readable'] = is_readable($hbaFiles[0]);
}

echo json_encode($res, JSON_PRETTY_PRINT);
