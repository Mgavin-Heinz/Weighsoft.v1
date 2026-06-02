FROM nginx:1.19-alpine

RUN apk update --no-cache && apk upgrade --no-cache
RUN apk add --no-cache php8 php8-fpm php8-opcache php8-xmlwriter php8-mbstring php8-mysqli php8-pdo_mysql php8-curl php8-gd php8-zip php8-xml php8-json php8-phar php8-tokenizer php8-dom php8-fileinfo php8-session && \
    mv /usr/bin/php8 /usr/bin/php


RUN apk add --no-cache tzdata
ENV TZ=Africa/Johannesburg

RUN mkdir /run/php-fpm

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

WORKDIR /var/www
RUN mkdir laravel && chown nginx:nginx laravel
WORKDIR /var/www/laravel

COPY ./docker-build/php.ini /etc/php8/
COPY ./docker-build/www.conf /etc/php8/php-fpm.d/
COPY ./docker-build/laravel.conf /etc/nginx/conf.d/default.conf

COPY --chown=nginx:nginx ./ ./
RUN composer update
RUN composer install --no-dev

RUN cp docker.env .env
RUN php artisan jwt:secret

WORKDIR /var/www

RUN chmod -R 777 laravel

COPY ./docker-build/cronjobs /etc/crontabs/root

CMD /usr/sbin/php-fpm8 -D; nginx -g "daemon off;"
