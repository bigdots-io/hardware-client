#!/bin/bash

cp upstart/sign-painter.conf /etc/init/
initctl reload-configuration
