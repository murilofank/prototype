#!/bin/sh
npx playwright install-deps
npx playwright install
npx prisma migrate deploy
npm run "$1"