FROM node:14.16.0

COPY ["package.json", "package-lock.json",  "/usr/src/"]

WORKDIR /usr/src/

RUN npm install

COPY [".", "/usr/src/"]

CMD ["node", "index.js"]
