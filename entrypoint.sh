#!/bin/sh
npx prisma generate --schema=./prisma/schema.prisma
npx prisma migrate deploy
npm run "$1"