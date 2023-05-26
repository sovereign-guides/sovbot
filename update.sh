#!/bin/bash
echo Updating SovBot...

git pull origin main
pm2 restart ecosystem.config.js

echo Update finished!
