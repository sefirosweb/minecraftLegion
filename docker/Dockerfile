FROM node:20.9.0-bullseye as base

FROM base AS deps
WORKDIR /app
COPY . .
RUN node -v
RUN npm run build

FROM base AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

ENV ENVIRONMENT=prod
ENV WEB_SERVER=http://localhost
ENV WEB_SERVER_PORT=80

COPY --from=deps /app/base-types/base-types-1.0.0.tgz /app/base-types/base-types-1.0.0.tgz

COPY --from=deps /app/docker/core.sh /app/core.sh
RUN chmod +x /app/core.sh
COPY --from=deps /app/core/dist /app/core
COPY --from=deps /app/core/package.json /app/core/package.json
COPY --from=deps /app/core/package-lock.json /app/core/package-lock.json
RUN npm install --omit=dev --prefix /app/core/

COPY --from=deps /app/docker/server.sh /app/server.sh
RUN chmod +x /app/server.sh
COPY --from=deps /app/server/dist /app/server
COPY --from=deps /app/server/package.json /app/server/package.json
COPY --from=deps /app/server/package-lock.json /app/server/package-lock.json
RUN npm install --omit=dev --prefix /app/server/

COPY --from=deps /app/docker/supervisord.conf /etc/supervisor/supervisord.conf
COPY --from=deps /app/docker/start-container /usr/local/bin/start-container

CMD /bin/bash -c "chmod +x /usr/local/bin/start-container && /usr/local/bin/start-container;"

EXPOSE 80
