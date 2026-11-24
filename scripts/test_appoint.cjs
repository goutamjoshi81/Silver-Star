const http = require('http');

const data = JSON.stringify({
  officerId: 'EMP222392',
  clientId: 'CLI001',
  siteId: 'SITE001',
  visitFrequency: 'Daily',
  shift: 'Day Shift (06:00 - 14:00)',
  notes: 'Frontline roll-call audit and security compliance verification'
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/field-officers/appoint',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('RESPONSE:', body);
  });
});

req.on('error', console.error);
req.write(data);
req.end();
