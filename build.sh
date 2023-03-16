docker build -t leafnothingbehind-app:$VERSION .
docker build -f Dockerfile.migration -t leafnothingbehind-migration:$VERSION .