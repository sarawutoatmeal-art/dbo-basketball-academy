#!/usr/bin/env bash
# ========================================================
# DBO Basketball Academy - Vercel 2-Editor / 1-Deployer Guard
# Authorized Editors (2 people on dev / preview):
#   1. sarawut.oatmeal@gmail.com (sarawutoatmeal-art) [Owner & Production Deployer]
#   2. wissava.ard@gmail.com                          [Co-Editor (Dev / Preview only)]
#
# Vercel ignoreCommand convention:
#   exit 0 -> SKIP / BLOCK build
#   exit 1 -> PROCEED with build
# ========================================================

AUTHORIZED_OWNER_LOGIN="sarawutoatmeal-art"
AUTHORIZED_OWNER_EMAIL="sarawut.oatmeal@gmail.com"
AUTHORIZED_CO_EDITOR_EMAIL="wissava.ard@gmail.com"

COMMIT_EMAIL=$(git log -1 --pretty=format:'%ae' 2>/dev/null || echo "")
COMMIT_AUTHOR="${VERCEL_GIT_COMMIT_AUTHOR_LOGIN:-}"
BRANCH="${VERCEL_GIT_COMMIT_REF:-}"
ENV_TARGET="${VERCEL_ENV:-}"

echo "Checking deploy authorization: branch=$BRANCH env=$ENV_TARGET author=$COMMIT_AUTHOR email=$COMMIT_EMAIL"

# 1. Production Deployment (main branch): ONLY Owner (sarawut.oatmeal@gmail.com) is allowed
if [ "$ENV_TARGET" = "production" ] || [ "$BRANCH" = "main" ]; then
  if [ "$COMMIT_AUTHOR" = "$AUTHORIZED_OWNER_LOGIN" ] || [ "$COMMIT_EMAIL" = "$AUTHORIZED_OWNER_EMAIL" ]; then
    echo "✅ Authorized Owner ($AUTHORIZED_OWNER_EMAIL) verified. Proceeding with Production Deployment."
    exit 1
  else
    echo "🚫 Production Deployment Blocked: Account '$COMMIT_EMAIL' ($COMMIT_AUTHOR) has Editor permissions only."
    echo "   Only the Owner ($AUTHORIZED_OWNER_EMAIL / $AUTHORIZED_OWNER_LOGIN) can deploy to Production."
    exit 0
  fi
fi

# 2. Preview / Test Demo Deployment (dev branch): Allow ONLY the 2 authorized editors
if [ "$COMMIT_AUTHOR" = "$AUTHORIZED_OWNER_LOGIN" ] || [ "$COMMIT_EMAIL" = "$AUTHORIZED_OWNER_EMAIL" ] || [ "$COMMIT_EMAIL" = "$AUTHORIZED_CO_EDITOR_EMAIL" ]; then
  echo "✅ Authorized Editor ($COMMIT_EMAIL) verified. Proceeding with Test Demo / Preview build on branch '$BRANCH'."
  exit 1
else
  echo "🚫 Unauthorized Commit Email ($COMMIT_EMAIL): Only $AUTHORIZED_OWNER_EMAIL and $AUTHORIZED_CO_EDITOR_EMAIL are permitted to edit."
  exit 0
fi
