FROM node:18-bullseye
WORKDIR /app

RUN apt-get update && apt-get install -y \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

ENV ENVIRONMENT=prod
ENV WEB_SERVER=http://localhost
ENV WEB_SERVER_PORT=80

COPY ./base-types/base-types-1.0.0.tgz /app/base-types/base-types-1.0.0.tgz

COPY ./docker/core.sh /app/core.sh
RUN chmod +x /app/core.sh
COPY ./core/dist /app/core
COPY ./core/package.json /app/core/package.json
COPY ./core/package-lock.json /app/core/package-lock.json
RUN npm install --omit=dev --prefix /app/core/

COPY ./docker/server.sh /app/server.sh
RUN chmod +x /app/server.sh
COPY ./server/dist /app/server
COPY ./server/package.json /app/server/package.json
COPY ./server/package-lock.json /app/server/package-lock.json
RUN npm install --omit=dev --prefix /app/server/

COPY ./docker/supervisord.conf /etc/supervisor/supervisord.conf
COPY ./docker/start-container /usr/local/bin/start-container

CMD /bin/bash -c "chmod +x /usr/local/bin/start-container && /usr/local/bin/start-container;"
