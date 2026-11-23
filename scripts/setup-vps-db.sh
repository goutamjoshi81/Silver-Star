#!/bin/bash
# ============================================================
# Silver Star Platform - Automated Database & Backend Setup
# Run this single script as root on your Ubuntu VPS:
#   bash /home/silverstarindia.admin/public_html/scripts/setup-vps-db.sh
# ============================================================

set -e

echo "=========================================================="
echo " Silver Star Platform - Initializing Database & Backend"
echo " Target VPS: 129.121.170.111"
echo "=========================================================="

PROJECT_DIR="/home/silverstarindia.admin/public_html"
if [ ! -d "$PROJECT_DIR" ]; then
  PROJECT_DIR="$(pwd)"
fi

cd "$PROJECT_DIR"

# ------------------------------------------------------------
# 1. Authorize Antigravity SSH Key for direct automation
# ------------------------------------------------------------
echo ""
echo "==> 1. Configuring Antigravity SSH Access & Webhook..."
mkdir -p /root/.ssh && chmod 700 /root/.ssh
touch /root/.ssh/authorized_keys
if ! grep -q "antigravity-vps" /root/.ssh/authorized_keys 2>/dev/null; then
  echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOAvP5Sg3GK5Bt0ySS9/rIDjo8xtHNPnVvtW6VkhcsA1 antigravity-vps" >> /root/.ssh/authorized_keys
  chmod 600 /root/.ssh/authorized_keys
  echo "  [OK] Antigravity SSH key authorized."
else
  echo "  [OK] SSH key already authorized."
fi

# Upgrade deploy-hook.php to automatically force-sync origin/main
cat << 'EOF' > deploy-hook.php
<?php
$token = $_GET['token'] ?? '';
if ($token !== 'silverstar2026') { http_response_code(403); die("Forbidden: Invalid token"); }
chdir('/home/silverstarindia.admin/public_html');
echo "<pre>\n";
passthru("git fetch origin main 2>&1");
passthru("git reset --hard origin/main 2>&1");
echo "</pre>";
EOF
chmod 644 deploy-hook.php
echo "  [OK] Upgraded deploy-hook.php for clean auto-sync."

# ------------------------------------------------------------
# 2. Configure PostgreSQL: Set password and create silverstardb
# ------------------------------------------------------------
echo ""
echo "==> 2. Initializing PostgreSQL 'silverstardb'..."
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '1234';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'silverstardb'" | grep -q 1 || sudo -u postgres psql -c "CREATE DATABASE silverstardb;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE silverstardb TO postgres;"
echo "  [OK] Database 'silverstardb' and user 'postgres' ready."

# ------------------------------------------------------------
# 3. Create platform/backend/.env file
# ------------------------------------------------------------
echo ""
echo "==> 3. Generating platform/backend/.env..."
cat << 'EOF' > platform/backend/.env
PORT=5000
NODE_ENV=production
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=1234
DB_NAME=silverstardb
EOF
echo "  [OK] platform/backend/.env created."

# ------------------------------------------------------------
# 4. Install backend dependencies & Run Database Migrations
# ------------------------------------------------------------
echo ""
echo "==> 4. Running schema migrations..."
cd platform/backend
if [ ! -d "node_modules/pg" ]; then
  npm install --omit=dev
fi
node src/db/migrate.js
cd "$PROJECT_DIR"
echo "  [OK] Database schema initialized with all tables & seeds."

# ------------------------------------------------------------
# 5. Fix file permissions for LiteSpeed web server
# ------------------------------------------------------------
echo ""
echo "==> 5. Setting web directory permissions..."
chown -R silverstarindia.admin:silverstarindia.admin "$PROJECT_DIR" 2>/dev/null || true
chmod -R 755 "$PROJECT_DIR" 2>/dev/null || true
echo "  [OK] Permissions set."

# ------------------------------------------------------------
# 6. Start / Reload Backend Service with PM2
# ------------------------------------------------------------
echo ""
echo "==> 6. Starting backend with PM2 on port 5000..."
command -v pm2 >/dev/null 2>&1 || npm install -g pm2
pm2 reload silverstar-backend || pm2 start ecosystem.config.cjs || pm2 restart all
pm2 save
echo "  [OK] PM2 service 'silverstar-backend' running on port 5000."

echo ""
echo "=========================================================="
echo " Database and Backend successfully configured!"
echo " Testing local endpoint:"
curl -s http://127.0.0.1:5000/api/services | head -c 200
echo ""
echo " Public Gateway: http://129.121.170.111/"
echo "=========================================================="
