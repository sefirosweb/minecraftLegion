# minecraftLegionWebClient

This project was part of [minecraftLegion](https://github.com/sefirosweb/minecraftLegion).

This is a frontend to manage the bot. This frontend needs to connect to the backend: [minecraftLegionWebServer](https://github.com/sefirosweb/minecraftLegionWebServer).

## Install with docker

1. You need to have installed [docker](https://docs.docker.com/desktop/windows/wsl/), you can go to official docker site and follow the installation guide for you OS
2. Create docker network if you have all services in same computer and if you not have already created

```
docker network create minecraftLegionNetwork
```

3. Clone the repository

```
git clone https://github.com/sefirosweb/minecraftLegionWebClient.git
cd minecraftLegionWebClient
```

4. Install dependencies

```
 docker run --rm -v $PWD:/home/app -w /home/app -u node node:16.13-bullseye npm install
```

5. Build & prepare the web

```
docker run --rm -v $PWD:/home/app -w /home/app -u node node:16.13-bullseye npm run build
```

6. Start the web server (nginx with react build files)

```
docker-compose up -d
```

The frontend is ready to listen in port 80 \
Open url http://localhost/


You can change the port of web server, modify docker-compose.yml 80 to any you want

Set "Web Socket Server Password" password of "server" \
Set "Web Socket Server URL" the "server" ip \
Set "Web Socket Server Port" the port of "server"

Set "Master" your name in minecraft, it is used for "follow" your orders in game

Set "Server Bots (Used for connect to Bots Viewers)" it is used for see the inventory / view what does the bot

Now you must have connected to the server

![image](https://raw.githubusercontent.com/sefirosweb/minecraftLegionWebClient/master/docs/conection.png)

## Next usages

For start again only you need to start docker and start the node:

```
docker run --rm -it --name minecraftLegionWebClient -p 3000:3000 --network minecraftLegionNetwork  -v $PWD:/home/app -w /home/app -u node node:16.13-bullseye /bin/bash
```

```
npm start
```

## Manual update

You need to "pull" the new code and install the new dependencies

```
git pull
```

Start docker:

```
docker run --rm -it --name minecraftLegionWebClient -p 3000:3000 --network minecraftLegionNetwork  -v $PWD:/home/app -w /home/app -u node node:16.13-bullseye /bin/bash
```

Install new dependencies:

```
npm install
```

Start bot

```
npm start
```

# Easy method without building

1. You need to have installed [docker](https://docs.docker.com/desktop/windows/wsl/), you can go to official docker site and follow the installation guide for you OS
2. Create docker network if you have all services in same computer and if you not have already created

```
docker network create minecraftLegionNetwork
```

3. Clone the repository
```
git clone https://github.com/sefirosweb/minecraftLegionWebClient.git
cd minecraftLegionWebClient
```

4. Change of branch already builded
```
git fetch
git checkout gh-pages
git pull
```
5. Start docker
```
docker-compose up -d
```
or:
```
docker run --rm --name minecraftLegionWebClient -p 80:3000 --network minecraftLegionNetwork -v $PWD:/usr/share/nginx/html -v $PWD/default.conf:/etc/nginx/conf.d/default.conf nginx
```