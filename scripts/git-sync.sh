#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔄 [Git Collaboration Sync] Silver Star Facility Management"

# Ensure git remote is configured
REMOTE_BRANCH=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "origin/main")

echo "📥 Fetching latest commits from remote ($REMOTE_BRANCH)..."
git fetch origin

CURRENT_BRANCH=$(git branch --show-current)

# Check if there are local uncommitted changes
HAS_UNCOMMITTED=0
if ! git diff-index --quiet HEAD --; then
  HAS_UNCOMMITTED=1
  echo "⚠️ Detected local uncommitted changes. Stashing before pulling..."
  git stash push -m "git-sync-autostash-$(date +%s)"
fi

echo "⬇️ Pulling and rebasing on top of remote changes..."
git pull --rebase origin "$CURRENT_BRANCH"

if [ $HAS_UNCOMMITTED -eq 1 ]; then
  echo "♻️ Restoring your local uncommitted changes..."
  git stash pop
fi

echo "✅ Your local workspace is now synchronized with the latest changes from your team!"
git status -s

