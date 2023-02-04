# Creating a ubuntu image docker
docker run -itd --name app -v /home/sefi:/home/sefi -p 3000:3000 -p 4001:4001 ubuntu:20.04 /bin/sh
docker rm app
docker exec -it app bash

# Install dependencies for execute bot

# Node.js v16.x
apt-get update &&
apt-get install curl -y &&
curl -fsSL https://deb.nodesource.com/setup_16.x | bash - &&
apt-get install -y nodejs &&
npm install -g npm-check-updates

# Node.js v14.x
apt-get update &&
apt-get install curl -y &&
curl -fsSL https://deb.nodesource.com/setup_14.x | bash - &&
apt-get install -y nodejs &&
npm install -g npm-check-updates
