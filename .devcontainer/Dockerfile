FROM node:21.7.1-bullseye
WORKDIR /app

# Install dependencies
RUN apt update && apt install -y wget gnupg2

# Add AdoptOpenJDK repository and install Java 21
RUN wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | gpg --dearmor -o /usr/share/keyrings/adoptium-archive-keyring.gpg
RUN echo "deb [signed-by=/usr/share/keyrings/adoptium-archive-keyring.gpg] https://packages.adoptium.net/artifactory/deb focal main" | tee /etc/apt/sources.list.d/adoptium.list
RUN apt update && apt install -y temurin-21-jdk

RUN npm install mocha -g
RUN npm install nodemon -g
RUN npm install ts-node -g
RUN npm install -g npm@9.4.2
RUN npm install -g npm-check-updates

# Install basic development tools
RUN apt update && apt install -y less man-db sudo bash-completion

# Ensure default `node` user has access to `sudo`
ARG USERNAME=node
RUN echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true
