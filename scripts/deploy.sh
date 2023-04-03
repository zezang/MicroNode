set -u
: $CONTAINER_REGISTRY
: $VERSION

envsubst < ./scripts/deploy.yaml | kubectl apply -f -