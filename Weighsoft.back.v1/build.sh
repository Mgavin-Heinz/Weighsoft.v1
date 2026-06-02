basefilename=Dockerfile.base.sup
filename=Dockerfile.sup
version=0.10.52
#release=latest
release=dev
#release=pre
#platform=linux/arm/v7
platform=linux/arm/v7,linux/amd64
#platform=linux/amd64
#sudo docker buildx build -f $basefilename -t weighsoftsa/weighsoft-php-nginx-base:$release -t weighsoftsa/weighsoft-php-nginx-base:$version --platform $platform . --no-cache --output type=registry
sudo docker buildx build -f $filename -t weighsoftsa/weighsoft-backv1:$release -t weighsoftsa/weighsoft-backv1:$version --platform $platform . --no-cache --output type=registry
# docker scan docker.io/weighsoftsa/weighsoft-backv1:$release
# docker push docker.io/weighsoftsa/weighsoft-backv1:$release
# docker push docker.io/weighsoftsa/weighsoft-backv1:$version
