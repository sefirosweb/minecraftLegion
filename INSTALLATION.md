# Production using docker

I recommend that you use docker to run this bot, because it takes a lot of steps to prepare and build all the configuration files.

Example of docker-compose.yml file:
```yml
version: "3"
services:
  app:
    image: @sefirosweb/minecraft-legion
    environment:
      SERVER: localhost # Minecraft Server
      PORT: 25565 # Minecraft Port
      MASTERS: player1,player2 # Names of master players, separated with comma
      WEB_SERVER_PASSWORD: admin # Password to login into front end
      AUTO_RESTART: true # If bot crashes they auto reload again
      ORIGIN_CORS: "*" # To avoid CORS enter here your public domain

    volumes:
      - "./botConfig:/user/node/core/botConfig"

    ports:
      - "80:80"
      - "4001:4001"

```

# How to install:

1. Clone or download the repositorio `git clone && cd minecraftLegion/`
2. Install all the dependencies:

- A) Using node

```
cd core/ && npm install && cd ../web/ && npm install && ../server/ && npm install && cd ..
```

- B) Using docker

```
docker run --rm -it -v $PWD/core:/home/app -w /home/app -u node node:18 npm install &&
docker run --rm -it -v $PWD/server:/home/app -w /home/app -u node node:18 npm install &&
docker run --rm -it -v $PWD/web:/home/app -w /home/app -u node node:18 npm install &&
docker run --rm -it -v $PWD/web:/home/app -w /home/app -u node node:18 npm run build
```

3. Go to server folder and create `.env` file with password

Example:
```
WEB_SERVER_PORT=4001
WEB_SERVER_PASSWORD=admin
WEB_CLIENT=http://localhost:3000
```

4. Go to core and create `config.ts` file

Example:
```ts
const config = {
  server: '127.0.0.1', // Minecraft Server
  port: 25565, // Minecraft Port
  masters: [{ name: 'PlayerName' }],
  webServer: 'http://localhost', // Web Server
  webServerPort: '4001', // Sebsocket SERVER port
  webServerPassword: 'admin', //  Sebsocket SERVER password
  debugMode: false,
  customStart: false,
  autoRestart: true // Auto restart on break
}

export default config
```

5. Start services:

server:
docker-compose up -d