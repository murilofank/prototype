#!/bin/sh
npx prisma generate
npx prisma migrate deploy
npm run "$1"