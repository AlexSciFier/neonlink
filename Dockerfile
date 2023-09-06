FROM --platform=$BUILDPLATFORM node:lts-slim AS ui-build
WORKDIR /app/client

ENV PATH /app/client/node_modules/.bin:$PATH

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NPM_CONFIG_LOGLEVEL=warn

COPY ./frontend/package*.json ./

RUN npm ci --omit=dev
COPY ./frontend .
RUN npm run build

FROM --platform=$TARGETPLATFORM node:lts-slim AS srv-build

RUN apt-get update && apt-get install python3 make build-essential -y

WORKDIR /app/server

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NPM_CONFIG_LOGLEVEL=warn

COPY ./server/package*.json ./

RUN npm ci --omit=dev

FROM --platform=$TARGETPLATFORM node:lts-slim
USER node
WORKDIR /app
COPY --chown=node ./server ./
COPY --chown=node --from=srv-build /app/server ./
COPY --chown=node --from=ui-build /app/client/build ./public

RUN mkdir ./data
RUN mkdir ./public/static/media/background

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=3333
ENV FASTIFY_BODY_LIMIT=5242880
ENV FASTIFY_ADDRESS=0.0.0.0
ENV FASTIFY_LOG_LEVEL=error

CMD ["node", "server.js"]