FROM node:lts-alpine AS ui-build
WORKDIR /app/neonlink/client

ENV PATH /app/neonlink/client/node_modules/.bin:$PATH

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NPM_CONFIG_LOGLEVEL=warn

COPY ./frontend/package*.json ./

RUN npm ci --only=production
COPY ./frontend .
RUN npm run build

FROM node:lts-alpine AS build

WORKDIR /app/neonlink/server

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NPM_CONFIG_LOGLEVEL=warn
ENV PORT=3333

COPY ./server/package*.json ./

RUN npm ci --only=production

EXPOSE 3333

COPY ./server ./
COPY --from=ui-build /app/neonlink/client/build ./public

CMD ["npm", "run", "start"]