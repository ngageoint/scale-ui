#!/usr/bin/env bash

# This assumes a working DCOS cluster set up in your CLI.
# Once that is the case you'll be run this script.

# The script takes one command - your Docker image name you want to create and push 


dcos marathon app stop /scale-webserver

docker build -t $1 .
docker push $1

dcos marathon app start /scale-webserver 1
