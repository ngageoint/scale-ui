#!/usr/bin/env bash

CONFIG_JSON=/usr/share/nginx/html/assets/environment.json

if [[ "${API_PREFIX}x" != "x" ]]
then
    jq '.apiPrefix = "'${API_PREFIX}'"' ${CONFIG_JSON} | sponge ${CONFIG_JSON}
fi

if [[ "${AUTH_URL}x" != "x" ]]
then
    jq '.auth.scheme.url = "'${AUTH_URL}'"' ${CONFIG_JSON} | sponge ${CONFIG_JSON}
fi

if [[ "${SILO_URL}x" != "x" ]]
then
    jq '.siloUrl = "'${SILO_URL}'"' ${CONFIG_JSON} | sponge ${CONFIG_JSON}
fi

exec "$@"
