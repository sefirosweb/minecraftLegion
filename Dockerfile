FROM node:16.13-bullseye
RUN apt update && apt install -y openjdk-17-jdk
RUN npm install npm-check-updates -g