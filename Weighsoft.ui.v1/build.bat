@echo off
set version=0.10.48
@REM set release=latest
set release=dev
@REM set release=qa
set platform=linux/arm/v7,linux/amd64
@REM set platform=linux/amd64
@REM set platform=linux/arm/v7
docker buildx build -t weighsoftsa/weighsoft-ui-v1:%release% -t weighsoftsa/weighsoft-ui-v1:%version% --platform %platform% . --no-cache --output type=registry
@REM docker scan docker.io/weighsoftsa/weighsoft-ui-v1:%release%
@REM docker push docker.io/weighsoftsa/weighsoft-ui-v1:%release%
@REM docker push docker.io/weighsoftsa/weighsoft-ui-v1:%version%
docker buildx prune -af