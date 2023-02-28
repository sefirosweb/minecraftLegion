FROM node:18-bullseye
RUN apt update && apt install -y openjdk-17-jdk
RUN npm install npm-check-updates -g
RUN npm install mocha -g
RUN npm install nodemon -g
RUN npm install ts-node -g
RUN npm install -g npm@9.4.2

# Install basic development tools
RUN apt update && apt install -y less man-db sudo bash-completion

# Ensure default `node` user has access to `sudo`
ARG USERNAME=node
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true
