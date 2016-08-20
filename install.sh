#!/bin/bash

echo "Copying upstart config to /etc/init"
cp upstart/hardware-client.conf /etc/init/

echo "Reloading upstart config"
initctl reload-configuration

echo "Installing npm dependencies"
npm install

echo "Starting hardware-client"
sudo start hardware-client

echo "Done"
