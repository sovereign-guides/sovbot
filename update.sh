#!/bin/bash
echo Updating SovBot...

git pull origin main

yarn install

pm2 restart ecosystem.config.js

echo Update finished!