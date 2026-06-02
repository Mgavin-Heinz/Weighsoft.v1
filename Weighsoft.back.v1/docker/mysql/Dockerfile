FROM weighsoftsa/mariadb

ENV MYSQL_DATABASE=weighsoft \
    MYSQL_ROOT_PASSWORD=Woow@64 \
    MYSQL_USER=admin \
    MYSQL_PASSWORD=Alicia07

RUN apk add --no-cache tzdata
ENV TZ=Africa/Johannesburg

COPY schema.sql /docker-entrypoint-initdb.d/
EXPOSE 3306

