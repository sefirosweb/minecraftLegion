FROM node:16.13-bullseye
RUN apt update && apt install -y openjdk-17-jdk
RUN npm install npm-check-updates -g
RUN npm install mocha -g
RUN npm install nodemon -g
RUN npm install ts-node -g
