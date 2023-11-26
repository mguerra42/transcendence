#!/usr/bin/env sh

# if node_modules not exist then install it
if [ ! -d "node_modules" ]; then
    npm install
fi
# if no prisma client then generate it
npx prisma db push
#if [ ! -d "node_modules/.prisma/client" ]; then
#    npx prisma db seed
#fi

# if first params is "dev" then run dev server else run prod server
if [ "$1" = "dev" ]; then
    npm run start:dev
else
    #npm run build
    npm run start:prod
fi
