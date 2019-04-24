#!/usr/bin/env sh

: ${API_PREFIX:=/api}
: ${AUTH_URL:=/api/login/}
: ${AUTH_ENABLED:=true}
: ${SILO_URL:=http://ec2-18-217-60-133.us-east-2.compute.amazonaws.com}

# Ensure valid all lower case true/false value for AUTH_ENABLED
AUTH_CLEANED=$(echo ${AUTH_ENABLED} | tr '[:upper:]' '[:lower:]')

jq '.apiPrefix = "'${API_PREFIX}'"' ${CONFIG_JSON} | sponge ${CONFIG_JSON}
jq '.auth.scheme.url = "'${AUTH_URL}'"' ${CONFIG_JSON} | sponge ${CONFIG_JSON}
jq '.auth.enabled = '${AUTH_CLEANED}'' ${CONFIG_JSON} | sponge ${CONFIG_JSON}
jq '.siloUrl = "'${SILO_URL}'"' ${CONFIG_JSON} | sponge ${CONFIG_JSON}

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

        ITEM_CONFIG_JSON=$WEB_ROOT/$ITEM/assets/appConfig.json

        jq '.apiPrefix = "'${ITEM}'/api"' ${CONFIG_JSON} > ${ITEM_CONFIG_JSON}
        jq '.auth.scheme.url = "'${ITEM}'/api/login/"' ${ITEM_CONFIG_JSON} | sponge ${ITEM_CONFIG_JSON}
        cat /tmp/html/index.html | sed 's^base href="\/"^base href="'$ITEM'\/"^g' > $WEB_ROOT/$ITEM/index.html

        # Adding contexts for backend
        (cat /nginx-template.conf | sed 's^${CONTEXT}^'${ITEM}'^g' | sed 's^${BACKEND}^'${BACKEND}'^g' ) >> ${NGINX_CONF}
    done
fi

# Update the nginx conf with the backend for Scale
cat ${NGINX_CONF} | sed 's^${BACKEND}^'${BACKEND}'^g' | sponge ${NGINX_CONF}
# Terminate NGINX conf file
echo "}" >> ${NGINX_CONF}

exec "$@"
