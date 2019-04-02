#!/usr/bin/env sh
set -e

cd $(dirname $0)
cp -r ../dist/developer/ dist

# When CI_BUILD_TAG is unset we are building a snapshot
if [[ "${CI_BUILD_TAG}x" == "x" ]]
then
    docker login -u ${DOCKER_DEV_USER} -p "${DOCKER_DEV_PASS}" ${REGISTRY}

    export IMAGE_URL=${REGISTRY}/${DOCKER_DEV_ORG}/${IMAGE_PREFIX}

    export TAG=${CI_BUILD_REF:0:8}
else
    docker login -u ${DOCKER_USER} -p "${DOCKER_PASS}" ${REGISTRY}

    export IMAGE_URL=${REGISTRY}/${DOCKER_ORG}/${IMAGE_PREFIX}

    export TAG=${CI_BUILD_TAG}
fi

# Grab latest for caching purposes
docker pull ${IMAGE_URL} || true
docker build \
    --cache-from ${IMAGE_URL} \
    --label VERSION=${TAG} \
    --build-arg IMAGE=${NGINX_IMAGE} \
    -t ${IMAGE_URL} \
    -t ${IMAGE_URL}:${TAG} \
    .

docker push ${IMAGE_URL}
docker push ${IMAGE_URL}:${TAG}
