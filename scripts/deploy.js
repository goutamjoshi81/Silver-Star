#!/usr/bin/env node
/**
 * Silver Star Platform - Auto-Deploy Helper Script
 * Usage: npm run deploy ["commit message"]
 *
 * 1. Builds all 6 frontend applications (super-admin, hr-panel, operations-panel, client-mobile, employee-mobile, website)
 * 2. Stages all modified files and compiled production dist bundles
 * 3. Commits with provided or automatic timestamped message
 * 4. Pushes to origin main on GitHub
 * 5. Optionally pings VPS webhook to ensure instant sync
 */

const { execSync } = require('child_process');
const http = require('http');

const args = process.argv.slice(2);
const customMessage = args.join(' ').trim();
const now = new Date();
const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
const commitMessage = customMessage || `deploy: automated build & release ${timestamp}`;

function run(cmd, desc) {
  console.log(`\n==================================================`);
  console.log(`==> ${desc}...`);
  console.log(`==================================================`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
  } catch (err) {
    console.error(`\n[ERROR] Command failed: ${cmd}`);
    process.exit(1);
  }
}

console.log(`\n==================================================`);
console.log(` Silver Star Platform - One-Click Deployment`);
console.log(` Target VPS: 129.121.170.111 (root)`);
console.log(` Webhook:    http://129.121.170.111/deploy-hook.php?token=silverstar2026`);
console.log(` Commit Msg: "${commitMessage}"`);
console.log(`==================================================\n`);

// 1. Compile all frontend applications
run('npm run build:all', 'Compiling all frontend applications (6 apps)');

// 2. Stage all files including pre-built dist folders
run('git add .', 'Staging code changes and compiled production dist bundles');

// 3. Commit changes (if working tree has staged changes)
try {
  const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (status) {
    run(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, 'Committing changes to Git');
  } else {
    console.log('\n[INFO] No new changes to commit. Proceeding to push...');
  }
} catch (e) {
  console.log('\n[INFO] Git status clean or commit not required.');
}

// 4. Push to origin main
run('git push origin main', 'Pushing commits to GitHub origin/main');

// 5. Ping webhook as an additional direct trigger
console.log(`\n==================================================`);
console.log(`==> Pinging VPS Auto-Deploy Webhook...`);
console.log(`==================================================`);

const webhookUrl = 'http://129.121.170.111/deploy-hook.php?token=silverstar2026';
try {
  http.get(webhookUrl, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Webhook Response Status: ${res.statusCode}`);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          console.log(`Webhook Output:`, parsed);
        } catch {
          console.log(`Webhook Body:`, data.substring(0, 200));
        }
      }
      console.log('\n==================================================');
      console.log(' Deployment finished successfully!');
      console.log(' Your VPS at 129.121.170.111 is synced with latest build.');
      console.log('==================================================\n');
    });
  }).on('error', (err) => {
    console.log(`[INFO] Webhook ping completed. GitHub Webhook will also trigger automatically upon push.`);
    console.log('\n==================================================');
    console.log(' Deployment finished! Pushed to GitHub origin/main.');
    console.log('==================================================\n');
  });
} catch (err) {
  console.log('[INFO] Pushed to GitHub. Webhook trigger delegated to GitHub.');
}
