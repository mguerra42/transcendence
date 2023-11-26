#!/usr/bin/env sh

# if node_modules not exist then install it
if [ ! -d "node_modules" ]; then
    npm install
fi

# if first params is "dev" then run dev server else run prod server
if [ "$1" = "dev" ]; then
    npm run dev
else
    #npm run build
    npm run start
fi
