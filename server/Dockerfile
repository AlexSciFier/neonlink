FROM node:current-alpine AS node-build
WORKDIR /usr/src/neonlink

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NPM_CONFIG_LOGLEVEL=warn

COPY package*.json ./

RUN npm ci --only=production
COPY . .
RUN npm run start