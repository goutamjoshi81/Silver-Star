#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

COMMIT_MSG="$1"
if [ -z "$COMMIT_MSG" ]; then
  echo "❌ Error: Please provide a commit message."
  echo "Usage: ./scripts/git-push.sh \"your commit message\""
  exit 1
fi

CURRENT_BRANCH=$(git branch --show-current)

echo "🔄 Step 1: Pulling latest changes from origin/$CURRENT_BRANCH first..."
git pull --rebase origin "$CURRENT_BRANCH"

echo "📝 Step 2: Staging changed files..."
git add -A

echo "💾 Step 3: Committing changes..."
git commit -m "$COMMIT_MSG"

echo "🚀 Step 4: Pushing changes to origin/$CURRENT_BRANCH..."
git push origin "$CURRENT_BRANCH"

echo "✅ SUCCESS! Changes pushed to GitHub successfully."

