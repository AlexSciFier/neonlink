FROM node:lts-alpine AS ui-build
WORKDIR /app/client

ENV PATH /app/client/node_modules/.bin:$PATH

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NPM_CONFIG_LOGLEVEL=warn

COPY ./frontend/package*.json ./

RUN npm ci --only=production
COPY ./frontend .
RUN npm run build

FROM node:lts-alpine AS build

WORKDIR /app/server

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV NPM_CONFIG_LOGLEVEL=warn
ENV PORT=3333

COPY ./server/package*.json ./

RUN npm ci --only=production

EXPOSE 3333

COPY ./server ./
COPY --from=ui-build /app/client/build ./public

CMD ["npm", "run", "start"]