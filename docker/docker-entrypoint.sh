#!/usr/bin/env sh

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

# We support duplicating the assets from the root to any number of contexts
# This is necessary as Scale is served from DCOS at various contexts with one container. 
# The front-end Angular routes need to know what their base HREF is and the only way we've 
# discovered to accomplish this is to make them available individually with their own
# unique HREF. Nginx doesn't care what we do as long as they live under the web root, so we just
# duplicate and shim.
if [[ "${CONTEXTS}x" != "x" ]]
then
    WEB_ROOT=/usr/share/nginx/html
    cp -R ${WEB_ROOT} /tmp/

    ITEMS=$(echo ${CONTEXTS} | tr "," "\n")
    
    for ITEM in ${ITEMS}
    do
        echo "Creating instance of Scale UI at $WEB_ROOT/$ITEM..."
        mkdir -p $WEB_ROOT/$ITEM
        cp -R /tmp/html/* $WEB_ROOT/$ITEM/
        cat /tmp/html/index.html | sed 's^base href="\/"^base href="'$ITEM'"^g' > $WEB_ROOT/$ITEM/index.html
    done
fi

exec "$@"
