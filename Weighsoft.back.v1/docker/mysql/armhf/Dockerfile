FROM alpine

RUN ls
RUN apk update 
RUN apk add --no-cache mariadb mariadb-common mariadb-client openrc

RUN mysql_install_db --user=mysql

RUN rc-update add mariadb default

ENTRYPOINT [ "/bin/sh" ]