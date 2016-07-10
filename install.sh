#!/bin/bash

apt-get install upstart
cp upstart/sign-painter.conf /etc/init/
initctl reload-configuration
