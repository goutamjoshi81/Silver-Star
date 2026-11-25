const http = require('http');

async function run() {
  // 1. Get employees
  const emps = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:5000/api/employees', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  console.log('Total Employees:', emps.length);
  emps.forEach(e => {
    console.log(`- ${e.employeeCode}: ${e.name} (hasAppAccess: ${e.hasAppAccess}, isFieldOfficer: ${e.isFieldOfficer})`);
  });

  // 2. Grant field officer app access to first employee
  if (emps.length > 0) {
    const target = emps[0];
    console.log(`\nTesting Grant Field Officer Access for: ${target.name} (${target.id})...`);

    const payload = JSON.stringify({
      username: target.employeeCode,
      email: target.email || `${target.employeeCode.toLowerCase()}@silverstarindia.net`,
      password: 'Silverstar@123',
      role: 'Operations Manager',
      updateDesignation: true
    });

    const grantRes = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/employees/${target.id}/grant-field-officer`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    console.log('GRANT RESPONSE:', JSON.stringify(grantRes, null, 2));
  }
}

run().catch(console.error);
