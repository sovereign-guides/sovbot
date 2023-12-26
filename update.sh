#!/bin/bash
echo Updating SovBot...

git pull origin main

export NVM_DIR=$HOME/.nvm;
source $NVM_DIR/nvm.sh;

yarn install

pm2 restart ecosystem.config.js

echo Update finished!