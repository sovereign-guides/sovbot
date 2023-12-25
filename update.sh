#!/bin/bash
echo Updating SovBot...

git pull origin main

nvm use
yarn install

pm2 restart ecosystem.config.js

echo Update finished!