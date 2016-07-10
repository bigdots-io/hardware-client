#!/bin/bash

echo "Copying upstart config to /etc/init \n\n"
cp upstart/sign-painter.conf /etc/init/

echo "Reloading upstart config \n\n"
initctl reload-configuration

echo "Done \n"
