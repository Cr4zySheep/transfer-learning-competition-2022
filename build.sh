docker build -t transfer-learning-competition-app:$VERSION .
docker build -f Dockerfile.migration -t migration-app:$VERSION .