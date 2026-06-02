version=0.10.48
#release=latest
release=dev
#release=pre
#platform=linux/arm/v7
platform=linux/arm/v7,linux/amd64
#platform=linux/amd64
sudo docker buildx build -t weighsoftsa/weighsoft-ui-v1:$release -t weighsoftsa/weighsoft-ui-v1:$version --platform $platform . --no-cache --output type=registry
# docker scan docker.io/weighsoftsa/weighsoft-ui-v1:$release
# docker push docker.io/weighsoftsa/weighsoft-ui-v1:$release
# docker push docker.io/weighsoftsa/weighsoft-ui-v1:$version
sudo docker buildx prune -af