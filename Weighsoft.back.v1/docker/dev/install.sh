#!/bin/bash

spin()
{
    echo -en "\n\n$1\n\n"

    spinner="/|\\-/|\\-"
    while :
    do
        for i in `seq 0 7`
        do
            echo -n "${spinner:$i:1}"
            echo -en "\010"
            sleep .2
        done
    done
}

spin "Installing necessary libraries..." & SPIN_ID=$!
trap "kill -9 ${SPIN_ID} &> /dev/null" $(seq 0 15)
sudo apt install -y libffi-dev libssl-dev python3 python3-pip wget
sudo apt remove -y python-configparser
kill -9 $SPIN_ID
echo -e "\b"

spin "Installing docker...    " & SPIN_ID=$!
trap "kill -9 ${SPIN_ID} &> /dev/null" $(seq 0 15)
docker -v &> /dev/null
code=$?
if [ ${code} -ne 0  ]; then
    curl -fL https://get.docker.com -o get-docker.sh
    bash get-docker.sh
fi
kill -9 $SPIN_ID
echo -e "\b"

spin "Installing docker-compose...    " & SPIN_ID=$!
trap "kill -9 ${SPIN_ID} &> /dev/null" $(seq 0 15)
sudo pip3 install docker-compose
kill -9 $SPIN_ID
echo -e "\b"

spin "Starting Docker containers...    " & SPIN_ID=$!
trap "kill -9 ${SPIN_ID} &> /dev/null" $(seq 0 15)
sudo docker-compose up -d
kill -9 ${SPIN_ID}
echo -e "\b"
