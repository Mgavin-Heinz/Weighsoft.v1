@echo off
set basefilename=Dockerfile.base.sup
set filename=Dockerfile.sup
@REM set filename=Dockerfile
set version=0.10.52
@REM set release=latest
set release=dev
@REM set release=qa
@REM set platform=linux/arm/v7
set platform=linux/arm/v7,linux/amd64
@REM set platform=linux/amd64
@REM docker buildx build -f %basefilename% --push -t weighsoftsa/weighsoft-php-nginx-base:%release% -t weighsoftsa/weighsoft-php-nginx-base:%version% --platform %platform% . --no-cache --output type=registry
docker buildx build -f %filename% -t weighsoftsa/weighsoft-backv1:%release% -t weighsoftsa/weighsoft-backv1:%version% --platform %platform% . --no-cache --push --output type=registry
@REM docker buildx prune -af
@REM docker system prune -af