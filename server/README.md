# minecraftLegionWebServer

This project was part of [minecraftLegion](https://github.com/sefirosweb/minecraftLegion).

This is a bridge for manage the bot.

## Install with docker

1. You need to have installed [docker](https://docs.docker.com/desktop/windows/wsl/), you can go to official docker site and follow the installation guide for you OS
2. Create docker network if you have all services in same computer and if you not have already created

```
docker network create minecraftLegionNetwork
```

3. Clone the repository

```
git clone https://github.com/sefirosweb/minecraftLegionWebServer.git
cd minecraftLegionWebServer
```

4. Copy and edit the .env file

```js
cp .env_example .env

// Listen port of server
LISTEN_PORT=4001
// Password to access to the server
ADMIN_PASSWORD=admin
// The FRONT END URL for avoid CORS error
WEB_CLIENT=http://localhost:3000
```

5. Start docker with node

```
docker run --rm -it --name minecraftLegionWebServer --hostname minecraftLegionWebServer --network minecraftLegionNetwork -p 4001:4001 -v $PWD:/home/app -w /home/app -u node node:16.13-bullseye /bin/bash
```

6. Install dependencies

```
npm install
```

7. Start the server

```
node index.js
```

The server is running and listen in port 4001
You can change it manually, remember to change the port in docker params "-p XXXX:4001"

## Next usages

For start again only you need to start docker and start the node:

```
docker run --rm -it --name minecraftLegionWebServer --hostname minecraftLegionWebServer --network minecraftLegionNetwork -p 4001:4001 -v $PWD:/home/app -w /home/app -u node node:16.13-bullseye /bin/bash
```

```
node index.js
```

## Manual update

You need to "pull" the new code and install the new dependencies

```
git pull
```

Start docker:

```
docker run --rm -it --name minecraftLegionWebServer --hostname minecraftLegionWebServer --network minecraftLegionNetwork -p 4001:4001 -v $PWD:/home/app -w /home/app -u node node:16.13-bullseye /bin/bash
```

Install new dependencies:

```
npm install
```

Start bot

```
node index.js
```
