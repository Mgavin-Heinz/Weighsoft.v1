FROM nginx:1.19

RUN apt-get update && \
    apt-get install -y lsb-release ca-certificates apt-transport-https software-properties-common wget gnupg2 cron && \
    echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" | tee /etc/apt/sources.list.d/sury-php.list && \
    wget -qO - https://packages.sury.org/php/apt.gpg | apt-key add - && \
    apt-get update && \
    apt-get install -y php8.0 php8.0-fpm php8.0-opcache php8.0-mbstring php8.0-mysql php8.0-curl php8.0-gd php8.0-zip php8.0-xml php8.0-common

RUN mkdir /run/php-fpm /run/php

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

WORKDIR /var/www
RUN mkdir laravel && chown nginx:nginx laravel
WORKDIR /var/www/laravel

COPY ./docker-build/php.ini /etc/php/8.0/fpm/
COPY ./docker-build/www.conf /etc/php/8.0/fpm/pool.d/
COPY ./docker-build/laravel.conf /etc/nginx/conf.d/default.conf

COPY --chown=nginx:nginx ./ ./
RUN composer install --no-dev

RUN cp docker.env .env
RUN php artisan jwt:secret

WORKDIR /var/www

RUN chmod -R 777 laravel

COPY ./docker-build/cronjobs /etc/cron.d/artisan
RUN chmod 0644 /etc/cron.d/artisan
RUN crontab /etc/cron.d/artisan

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD cron; /usr/sbin/php-fpm8.0 -D; nginx -g "daemon off;"
