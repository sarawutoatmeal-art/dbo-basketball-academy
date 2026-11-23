#!/usr/bin/env bash
# ========================================================
# DBO Basketball Academy - Vercel Production Deploy Guard
# Vercel ignoreCommand convention:
#   exit 0 -> SKIP / BLOCK build
#   exit 1 -> PROCEED with build
# ========================================================

AUTHORIZED_OWNER_LOGIN="sarawutoatmeal-art"
AUTHORIZED_OWNER_EMAIL="sarawut.oatmeal@gmail.com"

COMMIT_EMAIL=$(git log -1 --pretty=format:'%ae' 2>/dev/null || echo "")
COMMIT_AUTHOR="${VERCEL_GIT_COMMIT_AUTHOR_LOGIN:-}"
BRANCH="${VERCEL_GIT_COMMIT_REF:-}"
ENV_TARGET="${VERCEL_ENV:-}"

echo "Checking deploy authorization: branch=$BRANCH env=$ENV_TARGET author=$COMMIT_AUTHOR email=$COMMIT_EMAIL"

# For Production deployments (main branch), ONLY allow the owner
if [ "$ENV_TARGET" = "production" ] || [ "$BRANCH" = "main" ]; then
  if [ "$COMMIT_AUTHOR" = "$AUTHORIZED_OWNER_LOGIN" ] || [ "$COMMIT_EMAIL" = "$AUTHORIZED_OWNER_EMAIL" ]; then
    echo "✅ Authorized Owner ($AUTHORIZED_OWNER_LOGIN) verified. Proceeding with Production Deployment."
    exit 1
  else
    echo "🚫 Production Deployment Blocked: Only $AUTHORIZED_OWNER_LOGIN ($AUTHORIZED_OWNER_EMAIL) can deploy to Production."
    exit 0
  fi
fi

# For dev / preview branches, allow both editors to build isolated Test Demo previews
echo "✅ Preview / Test Demo build allowed on branch '$BRANCH'."
exit 1
