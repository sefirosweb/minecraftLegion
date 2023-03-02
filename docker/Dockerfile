FROM node:18-bullseye

RUN apt-get update && apt-get install -y \
    supervisor nginx

ENV ENVIRONMENT=prod
ENV WEB_SERVER=http://localhost
ENV WEB_SERVER_PORT=4001

COPY ./docker/supervisord.conf /etc/supervisor/supervisord.conf

COPY ./docker/default.conf /etc/nginx/sites-available/default
COPY ./web/dist /usr/share/nginx/html

COPY ./docker/core.sh /user/node/core.sh
RUN chmod +x /user/node/core.sh
COPY ./core/dist /user/node/core
COPY ./core/package.json /user/node/core/package.json
COPY ./core/package-lock.json /user/node/core/package-lock.json
RUN npm install --omit=dev --prefix /user/node/core/

COPY ./docker/server.sh /user/node/server.sh
RUN chmod +x /user/node/server.sh
COPY ./server/dist /user/node/server
COPY ./server/package.json /user/node/server/package.json
COPY ./server/package-lock.json /user/node/server/package-lock.json
RUN npm install --omit=dev --prefix /user/node/server/

COPY ./docker/start-container /usr/local/bin/start-container
CMD /bin/bash -c "chmod +x /usr/local/bin/start-container && /usr/local/bin/start-container;"

WORKDIR /user/node