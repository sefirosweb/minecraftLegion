FROM node:14.16.0
WORKDIR /usr/src/
COPY ["package.json", "package-lock.json",  "/usr/src/"]
RUN npm install
COPY [".", "/usr/src/"]
EXPOSE 4001
CMD ["node", "index.js"]