ARG IMAGE=nginx
FROM $IMAGE

MAINTAINER Scale Developers "https://github.com/ngageoint/scale-ui"

LABEL \
    RUN="docker run -d geoint/scale-ui" \
    SOURCE="https://github.com/ngageoint/scale-ui" \
    DESCRIPTION="UI for Scale processing framework for containerized algorithms"

RUN apt-get update -y && apt-get install -y jq moreutils && apt-get clean all

COPY dist/developer /usr/share/nginx/html
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh && chmod 777 /usr/share/nginx/html/assets/environment.json

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
