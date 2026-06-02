FROM alpine:3.18.5 AS angularapp

ENV NODE_ENV=production
WORKDIR /var/www
COPY package*.json ./
COPY bower.json ./
RUN apk update
RUN apk add --no-cache git nodejs npm
RUN apk add --no-cache yarn --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community
#RUN npm install
RUN yarn install
#RUN bower install --allow-root
COPY ./ ./

### STAGE 2: IMAGE ###
FROM nginx:alpine
VOLUME [ "/var/cache/nginx" ]
COPY --from=angularapp /var/www/ /usr/share/nginx/html
COPY ./docker/default.conf /etc/nginx/conf.d/
EXPOSE 80