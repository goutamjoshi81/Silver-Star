const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('==> Syncing build outputs for direct VPS hosting...');

// 1. Sync Corporate Website to Web Root
const websiteDist = path.join(rootDir, 'platform/apps/website/dist');
if (fs.existsSync(websiteDist)) {
  copyDir(websiteDist, rootDir);
  console.log('  [OK] Synced Corporate Website dist to root (index.html, assets, logos)');
}

// 2. Sync Sub-applications to direct subpaths
const subApps = [
  { name: 'admin', src: 'platform/apps/super-admin/dist' },
  { name: 'hr', src: 'platform/apps/hr-panel/dist' },
  { name: 'ops', src: 'platform/apps/operations-panel/dist' },
  { name: 'client', src: 'platform/apps/client-mobile/dist' },
  { name: 'employee', src: 'platform/apps/employee-mobile/dist' },
];

for (const app of subApps) {
  const srcPath = path.join(rootDir, app.src);
  const destPath = path.join(rootDir, app.name);
  if (fs.existsSync(srcPath)) {
    copyDir(srcPath, destPath);
    console.log(`  [OK] Synced ${app.name} to /${app.name}`);
  }
}

console.log('==> Dist sync complete!');
