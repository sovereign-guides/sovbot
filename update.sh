echo Updating SovBot...

echo Stopping PM2 instance,
pm2 stop 2

echo Pulling commits,
git pull

echo Running build script,
yarn run build

echo Starting PM2 instance,
pm2 start 2

echo Update finished!
