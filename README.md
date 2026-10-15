<p align="center">
  <img src="./docs/logo_doc.svg" height="50" />
</p>

## Overview

- [Introduction](#introduction)
- [Features](#features)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Development](#development)

## Introduction

NeonLink is a simple and open-source self-hosted bookmark service. It is lightweight, uses minimal dependencies, and is easy to install via Docker. Due to the low system requirements, this application is ideal for deployment on the RaspberryPI.

## Features

- Tags
- Search
- Auto icon, title, description
- Customizable background
- Lightweight
- Private
- Dashboard

## Installation

### With Docker

[DockerHub](https://hub.docker.com/r/alexscifier/neonlink)

You can easily install an application using Docker. The images are also optimized for RaspberryPi.

Then run the command which will install the Docker container.

```sh
docker run -p {80}:3333 -v {/path/to/data}:/app/data -v {/path/to/backgrounds}:/app/public/static/media/background alexscifier/neonlink:latest
```

- Replace {80} with any port you like.
- Replace {/path/to/data} with the path to the data folder with private data
- Replace {/path/to/backgrounds} with the path to the background images folder

Or you can install with `docker-compose.yml` file

```sh
#clone repo
git clone https://github.com/AlexSciFier/neonlink.git
cd neonlink

#edit doker-compose.yml and run docker compose
docker-compose up -d
```

## Development

This project is open source, so you can change it or contribute. The application consists of two parts. The frontend is based on the [React](https://reactjs.org/) framework. The server part is based on the [Fastify](https://www.fastify.io/) framework. [Sqlite](https://www.sqlite.org/index.html) is used as a data base and its implementation for Nodejs is [better-sqlite3](https://github.com/WiseLibs/better-sqlite3).

This project requires Nodejs and npm.

For Windows development, it is recommended to use git bash.

### Setup

```sh
# Clone project
git clone https://github.com/AlexSciFier/neonlink.git
cd neonlink

# Install fastify-cli
npm install fastify-cli --global

# Run once to install dependencies
npm run dev-init

# Run dev server
npm run dev-start
```

## Build

Neonlink uses multiarch build. That means you need to use [buildx](https://docs.docker.com/engine/reference/commandline/buildx_build/). Or you can use [BuildKit](https://docs.docker.com/build/buildkit/) to build image for one platform.
To build your own docker container run in root folder

### Build multiarch image

```sh
docker buildx build --platform linux/arm/v7,linux/amd64 --push --tag alexscifier/neonlink:latest .
```

### Build for one platform

```sh
# Linux shell
DOCKER_BUILDKIT=1 docker build --tag alexscifier/neonlink:latest .
```

```sh
# Windows PowerShell
$env:DOCKER_BUILDKIT=1; docker build -t alexscifier/neonlink .
```

## Screenshots

![Dashboard](https://raw.githubusercontent.com/AlexSciFier/neonlink/master/docs/Dashboard.png)
![Links dark](https://raw.githubusercontent.com/AlexSciFier/neonlink/master/docs/Links%20dark.png)
![Links light](https://raw.githubusercontent.com/AlexSciFier/neonlink/master/docs/Links%20light.png)

## Favicon download

When you're adding a link it's favicon is automatically downloaded.

But for some rare cases where the favicon couldn't be downloaded automatically you can manually paste a link to desired favicon in link editing menu

![](assets/20250302_233945_image.png)

in most cases website favicon location is https://websitedomain/favicon.ico

but if the favicon is not there, then you can use website inspect tool (F12) and then search (ctrl+F) Elements menu for favicon keyword. This will lead you to URL where the favicon is stored
