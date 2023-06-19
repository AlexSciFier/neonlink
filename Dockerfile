FROM node:16-alpine AS ui-build
WORKDIR /app/client

ENV PATH /app/client/node_modules/.bin:$PATH

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NPM_CONFIG_LOGLEVEL=warn

COPY ./frontend/package*.json ./

RUN npm ci --only=production
COPY ./frontend .
RUN npm run build

FROM node:16-alpine AS build

WORKDIR /app/server

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NPM_CONFIG_LOGLEVEL=warn


COPY ./server/package*.json ./

RUN npm ci --only=production

FROM node:16-alpine
USER node
WORKDIR /app
COPY --chown=node ./server ./
COPY --chown=node --from=build /app/server ./
COPY --chown=node --from=ui-build /app/client/build ./public

ENV PORT=3333
ENV FASTIFY_BODY_LIMIT=5242880
ENV FASTIFY_ADDRESS=0.0.0.0
ENV FASTIFY_LOG_LEVEL=error

EXPOSE 3333

CMD ["node", "server.js"]