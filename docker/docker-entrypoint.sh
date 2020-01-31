#!/usr/bin/env bash

# ------------------------------------------------------------------------------
# 1) prepare env vars for nginx
# ------------------------------------------------------------------------------
# used for nginx replacements
SILO_URL=${SILO_URL:-"http://scale-silo.marathon.l4lb.thisdcos.directory:9000/"}
API_URL=${API_URL:-"http://scale-webserver.marathon.l4lb.thisdcos.directory:80/"}

# Trim trailing slash from backend addresses
SILO_URL=$(echo ${SILO_URL} | sed 's^/$^^')
API_URL=$(echo ${API_URL} | sed 's^/$^^')


# ------------------------------------------------------------------------------
# 2) load all prefixed env vars into the appconfig file
# ------------------------------------------------------------------------------
# open the existing appconfig json file
json_data=`cat "$CONFIG_JSON"`

# only look at environment variables with this prefix
PREFIX="SCALEUI_"
prefix_len=${#PREFIX}
env_names=`compgen -A variable | grep "^$PREFIX"`

# loop over each prefixed env var name
for full_name in $env_names; do
    # get only the name after the prefix
    name=${full_name:$prefix_len}

    # make lowercase
    name=`echo "$name" | tr '[:upper:]' '[:lower:]'`

    # get the value
    value=${!full_name}

    # add or replace the variable
    json_data=`echo "$json_data" | jq -r --arg value "$value" ".$name=\"$value\""`
done

# save the replaced json back to the file
echo "$json_data" > "$CONFIG_JSON"


# ------------------------------------------------------------------------------
# 3) replacements for nginx.conf
# ------------------------------------------------------------------------------
# Update the nginx conf with the backend for Scale
cat ${NGINX_CONF} | sed 's^${API_URL}^'${API_URL}'^g' | sed 's^${SILO_URL}^'${SILO_URL}'^g' > /tmp/nginx.conf
mv /tmp/nginx.conf ${NGINX_CONF}
# Terminate NGINX conf file
echo "}" >> ${NGINX_CONF}


exec "$@"
