#!/bin/sh

echo "Setting umask to ${UMASK}"
umask ${UMASK}
echo "Creating database and backgrounds directories"
mkdir -p ./data ./public/static/media/background

if [ `id -u` -eq 0 ] && [ `id -g` -eq 0 ]; then
    if [ "${UID}" -eq 0 ]; then
        echo "Warning: it is not recommended to run as root user, please check your setting of the UID environment variable"
    fi
    echo "Changing ownership to ${UID}:${GID}"
    chown -R "${UID}":"${GID}" ./data ./public/static/media/background
    echo "Running Neonlink as user ${UID}:${GID}"
    su-exec "${UID}":"${GID}" node server.js
else
    echo "User set by docker; running Neonlink as `id -u`:`id -g`"
    node server.js
fi