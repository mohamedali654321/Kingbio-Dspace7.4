# Installing Dspace7 via Docker

## Table of Contents

- [Introduction](#introduction)
- [DSpace 7 image features](#dspace-7-image-features)
- [Quick setup](#quick-setup)
- [Requirements](#requirements)
- [Clone Dspace 7 repository](#clone-dspace-7-repository)
- [Building Dspace 7 image](#building-dspace-7-image)
- [Dockerfile environment variables](#dockerfile-environment-variables)
- [Running Dspace 7 container](#running-dspace-7-container)
- [Login to DSpace 7 container](#login-to-dspace-7-container)
- [Copy files to DSpace 7 container](#copy-files-to-dspace-7-container)
- [Running database backup to AWS S3 bucket](#running-database-backup-to-aws-s3-bucket)
- [Deleting expire database files from AWS S3 bucket](#deleting-expire-database-files-from-aws-s3-bucket)
- [Running database scripts from cron jobs](#running-database-scripts-from-cron-jobs)
- [Thinking and planning to Dockerfile](#thinking-and-planning-to-dockerfile)
- [Future work](#future-work)
- [Reffrences](#reffrences)

## Introduction

Because we have two servers, one for testing and the other for production, so it had to be considered within our [Dockerfile](https://github.com/attia-alshareef/Dspace7/blob/master/Dockerfile).<br/>
Accordingly, you can create a test container and a production container from the same docker image by passing flag `TEST_IMAGE=true` or `TEST_IMAGE=false` as shown in the section [Dockerfile environment variables](#dockerfile-environment-variables).

- If you have experience with [Docker](https://docs.docker.com/) and [Dspace 6.3](https://wiki.lyrasis.org/display/DSDOC6x/DSpace+6.x+Documentation) you can switch directly to the [Quick setup](#quick-setup) section.

## DSpace 7 image features

In our [Dockerfile](https://github.com/attia-alshareef/Dspace7/blob/master/Dockerfile), We have included important features:

- We have given you the opportunity to choose between creating a test container or a production container.
- We have given you the opportunity to choose between connecting to a pre-configured database(maybe a remote database) or create a fresh database, see [Running Dspace 7 container](#running-dspace-7-container) section.
- We have automated the dspace index discovery and dspace filter media processes after creating the container or restarting it, that is means if you want to manual dspace index discovery and dspace filter media you can restart the container or you can [Login to DSpace 7 container](#login-to-dspace-7-container) and type the commands manually, see [Dspace configuration script](https://github.com/attia-alshareef/Dspace7/blob/master/pre-conf-files/dspace-pre-config.sh) file.
- We have included the SAFBuilder repository to speed up the process of uploading records to dspace, see [SAFBuilder inside Dspace7](https://github.com/attia-alshareef/Dspace7/tree/master/SAFBuilder).
- We have included the solr arabic files to support arabic search, see [Solr arabic stopwords](https://github.com/attia-alshareef/Dspace7/blob/master/solr/search/conf/stopwords_ar.txt).
- We scheduled the most important dspace tasks to run from cron jobs, see [Dspace cron jobs](https://github.com/attia-alshareef/Dspace7/blob/master/pre-conf-files/dspace-cron) file.
- We have automated the tomcat settings and configuration process to avoid any problems with it, see [tomcat.server](https://github.com/attia-alshareef/Dspace7/blob/master/pre-conf-files/tomcat.server.xml) and [tomcat.service](https://github.com/attia-alshareef/Dspace7/blob/master/pre-conf-files/tomcat.service) files.

## Quick setup

- after installing [Requirements](#requirements) run the following commands:

  - Clone Dspace 7 repository:
    ```
     git clone https://github.com/attia-alshareef/Dspace7.git
     cd Dspace7
    ```
  - Build Dspace 7 docker image:
    ```
     docker build -t dspace7.2api .
    ```
  - Running Dspace 7 testing container:
    ```bash
      docker run -d -p 7070:8080 \
      -e TEST_IMAGE=true \
      -e DB_PRE_CONF=true \
      -e DS_HOST=54.220.211.123 \
      -e DS_PORT=7070 \
      -e DB_ADMIN_USER=postgres \
      -e DB_ADMIN_PASS=Kwaretech2022# \
      -e DB_HOST=54.220.211.123 \
      -e DB_NAME=dspace7api \
      -e DB_USER=dspace7api \
      -e DB_PASS=dspace7api \
      --name dspace-v7.2-api \
      dspace-v7.2-api
    ```
  - Running Dspace 7 production container:
    ```bash
      docker run -d -p 8080:8080 \
      -e TEST_IMAGE=false \
      -e DB_PRE_CONF=true \
      -e DS_HOST=54.220.211.123 \
      -e DS_PORT=8080 \
      -e DB_ADMIN_USER=postgres \
      -e DB_ADMIN_PASS=Kwaretech2022# \
      -e DB_HOST=54.220.211.123 \
      -e DB_NAME=dspace7.1api \
      -e DB_USER=dspace7.1api \
      -e DB_PASS=dspace7.1api \
      -v /home/ubuntu/Dspace7-pro:/dspace/edit-files \
      --name dspace7.1api \
      Dspace7.1api
    ```
  - Cron jobs to backup databases and delete old files Dially:

  ```
    crontab -e
  ```

  and add the following line:

  ```
    PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

    #Backup dspace7api to AWS S3:
    0 0 * * * /home/ubuntu/Dspace7/pre-conf-files/db-S3-backup.sh -h 54.220.211.123 -u dspace7api -p dspace7api -d dspace7api -f king-bio-db-backups/test -s3b

    #Backup dspace7.1api to AWS S3:
    0 0 * * * /home/ubuntu/Dspace7/pre-conf-files/db-S3-backup.sh -h 54.220.211.123 -u dspace7.1api -p dspace7.1api -d dspace7.1api -f king-bio-db-backups/pro -s3b

    #Delete old Backup files for  dspace7.1api from  AWS S3:
    0 0 * * * /home/ubuntu/Dspace7/pre-conf-files/db-S3-backup.sh -f king-bio-db-backups/pro -s3d

    #Delete old Backup files for  dspace7api from  AWS S3:
    0 0 * * * /home/ubuntu/Dspace7/pre-conf-files/db-S3-backup.sh -f king-bio-db-backups/test -s3d
  ```

## Requirements

- you must install the following dependencies in your server:

  - [Git](https://git-scm.com/download/linux) , you can install it by the followin commands:
    ```bash
        sudo apt-get upadate
        sudo apt-get install git
    ```
  - [Docker engine](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) , you can install it by the followin commands:
    ```bash
        sudo apt-get update
        sudo apt install apt-transport-https ca-certificates curl software-properties-common
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
        sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
        sudo apt-get update
        sudo apt-get -y install docker-ce
    ```
  - [PostgreSQL](https://docs.docker.com/v17.12/install/) , you can install it by the followin commands:

    - you may be need to install Libicu55 with command :

    ```
        sudo add-apt-repository "deb http://security.ubuntu.com/ubuntu xenial-security main"
        sudo apt-get update
        sudo apt-get install libicu55
    ```

    - then install PostgreSQL 10 with commands:

    ```
        wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
        sudo add-apt-repository "deb http://apt.postgresql.org/pub/repos/apt/ xenial-pgdg main"
        sudo apt-get update
        sudo apt-get -y install postgresql-10 postgresql-client-10 libpq-dev
    ```

    - Configure PostgreSQL to listen on all interfaces and allow connections from all addresses (to allow Docker connections)
    - Edit file `postgresql.conf`with command:

    ```
        nano /etc/postgresql/10/main/postgresql.conf
    ```

    Edit the following line:
    uncomment _ `#listen_addresses = 'localhost'` and edit it to _ `listen_addresses = '*'`

    - Edit file `pg_hba.conf` with command:

    ```
         nano /etc/postgresql/10/main/pg_hba.conf
    ```

         Edit the following line:
          * `host  all  all  0.0.0.0/0  md5`

    - Restart PostgreSQL with command:

    ```
        sudo systemctl restart postgresql
    ```

  - [AWS CLI](https://aws.amazon.com/cli/) to run scripts for database backup to AWS S3 , restore database from AWS S3 and other database manipulation functions , to install it type the following commands:
    ```bash
    sudo apt-get update
    sudo apt-get -y install python-pip
    pip install awscli
    ```
  - to read more about our database script , go to [Run database manipulation scripts](https://github.com/attia-alshareef/Dspace7/blob/master/docs/Run%20database%20manipulation%20scripts.md) document.

## Clone Dspace 7 repository

Clone this repository, cd into the directory that is created:

```
git clone https://github.com/attia-alshareef/Dspace7.git
```

- Note that: (the above repository is a private , so make sure you have a user name and password to clone it)

## Building Dspace 7 image

- after cloning Dspace7 repo , type the following commands to build Dspace7 docker image:

```
cd Dspace7
docker build -t dspace7.1api .
```

- after build completed successfully , you can check your image by type the following command :

```bash
   docker images
```

you can find image named dspace7.1api

## Dockerfile environment variables

When you [Running Dspace 7 container](#running-dspace-7-container), you can adjust the Dspace7 configuration by passing one or more environment variables on the docker run command line.<br/>

- In our docker image, we have tow main environment variables that control the properties of the container to be created:<br/>
  `TEST_IMAGE`<br/>
  Indicating the type of container to be created , it takes the `true` value if a container is specific to the test server ,
  Otherwise it is dedicated to production server. <br/>
  Defaults to `false`.<br/>
  ex: `-e TEST_IMAGE=false`
  `DB_PRE_CONF`<br/>
  If we already have a ready database (already created) or connect to a remote database, this flag will take the `true` value,
  otherwise it will take the `false` value until the database is created at the time of the container creation.<br/>
  Defaults to `true`.<br/>
  ex: `-e DB_PRE_CONF=true`
- Database environment variables:  
   `DB_HOST`<br/>
  PostgreSQL host name or ip address of a remote server.<br/>
  ex: `-e DB_HOST=54.220.211.123`<br/>

  `DB_NAME`<br/>
  PostgreSQL database name. <br/>
  ex: `-e DB_NAME=dspace7.1api_test`

  `DB_USER`<br/>
  PostgreSQL user name who owns the Dspace database. <br/>
  ex: `-e DB_USER=dspace7.1api_test`

  `DB_PASS`<br/>
  PostgreSQL user password . <br/>
  ex: `-e DB_PASS=dspace7.1api_test`<br/>

- Dspace environment variables:  
   `DS_HOST`<br/>
  Dspace host name or ip address.<br/>
  ex: `-e DS_HOST=54.220.211.123`<br/>
  `DS_PORT`<br/>
  Dspace port number. <br/>
  ex: `-e DS_PORT=8080`<br/>
- Dspace email server environment variables:  
   `mail_server`<br/>
  Dspace mail server name.<br/>
  Defaults to `smtp.gmail.com`.<br/>
  ex: `-e mail_server=smtp.gmail.com`<br/>
  `mail_username`<br/>
  Dspace mail server user name. <br/>
  Defaults to `kingabdullah.dspace@gmail.com`.<br/>
  ex: `-e mail_username=kingabdullah.dspace@gmail.com`<br/>
  `mail_password`<br/>
  Dspace host name or ip address.<br/>
  Defaults to `Kingabdullah2018Center`.<br/>
  ex: `-e mail_password=Kingabdullah2018Center`<br/>
  `mail_port`<br/>
  Dspace port name. <br/>
  Defaults to `465`.<br/>
  ex: `-e mail_port=465`<br/>

## Running Dspace 7 container

- from the image named dspace7.1api which created in [Building Dspace 7 image](#building-dspace-7-image) section,
  you can run multible containers with defferent parameters , see the following commands:
  ```bash
     docker run -d -p <host port>:<container port> --name <container name> <image name>
  ```
  for testing container with pre configured database:
  ```bash
     docker run -d -p 7070:8080 \
     -e TEST_IMAGE=true \
     -e DB_PRE_CONF=true \
     -e DS_HOST=54.220.211.123 \
     -e DS_PORT=7070 \
     -e DB_HOST=54.220.211.123 \
     -e DB_NAME=dspace7_2api \
     -e DB_USER=dspace7_2api \
     -e DB_PASS=dspace7_2api \
     -v /home/ubuntu/attia-testing/dspace7-last-update/7.2/api/volume:/dspace_volume \
     --name dspace-v7.2-api \
     dspace-v7.2-api
  ```
  for testing container with fresh database(database created on runtime):
  ```bash
     docker run -d -p 9090:8080 \
     -e TEST_IMAGE=true \
     -e DB_PRE_CONF=false \
     -e DS_HOST=54.220.211.123 \
     -e DS_PORT=9090 \
     -e DB_HOST=54.220.211.123 \
     -e DB_NAME=dspace7api \
     -e DB_USER=dspace7api \
     -e DB_PASS=dspace7api \
     -v /home/ubuntu/Dspace7-test1:/dspace/edit-files \
     --name dspace7.1api \
     Dspace7.1api
  ```
  for production container with pre configured database:
  ```bash
     docker run -d -p 8080:8080 \
     -e TEST_IMAGE=false \
     -e DB_PRE_CONF=true \
     -e DS_HOST=54.220.211.123 \
     -e DS_PORT=8080 \
     -e DB_HOST=54.220.211.123 \
     -e DB_NAME=dspace7.1api \
     -e DB_USER=dspace7.1api \
     -e DB_PASS=dspace7.1api \
     -v /home/ubuntu/Dspace7-pro:/dspace/edit-files \
     --name dspace7.1api \
     Dspace7.1api
  ```
  for production container with fresh database(database created on runtime):
  ```bash
     docker run -d -p 8080:8080 \
     -e TEST_IMAGE=false \
     -e DB_PRE_CONF=false \
     -e DS_HOST=54.220.211.123 \
     -e DS_PORT=8080 \
     -e DB_HOST=54.220.211.123 \
     -e DB_NAME=dspace7.1api \
     -e DB_USER=dspace7.1api \
     -e DB_PASS=dspace7.1api \
     -v /home/ubuntu/Dspace7-pro:/dspace/edit-files \
     --name dspace7.1api \
     Dspace7.1api
  ```
- Note that:
  - `-e` stands for docker environment variable which defined by `ENV` command in `Dockerfile`.
  - `-v` stands for docker volume , as shown in [Copy files to DSpace 7 container](#copy-files-to-dspace-7-container) section.
  - Make sure the volume path on the server already exists (it should be created before you connect it to the container).
  - `DS_PORT` must be the same pinding port in the server for example, if you pind your container with port 9090 on the server(`-p 9090:8080`) , you must assign your `DS_PORT=9090`.
  - `DS_HOST` must be the same ip address of the server or domain name which assign to the server ip address , for example , if your server ip address = `54.220.211.123` , you must assign your `DS_HOST=54.220.211.123`.
  - when to create a Dspace7 container with a fresh database that is means a new database will be created after the container created and running ,see [Dspace configuration script](https://github.com/attia-alshareef/Dspace7/blob/master/pre-conf-files/dspace-pre-config.sh) file.
- after container created successfully , you can check your container by type the following command :
  ```bash
     docker ps -a
  ```
  you can find your container running which named dspace7.1api for testing container and dspace7.1api for production container.
  - now you can check if your containers running successfully ,by openning your browser with your containers urls:
    - if you are in testing container ,then in the browser type this url `http://54.220.211.123:9090/server/#/server/api`
    - if you are in production container ,then in the browser type this url `http://54.220.211.123:8080/server/#/server/api`

## Login to DSpace 7 container

- if you want to install any thing inside the container after running it , the only way to do this is to login to the container
  under shell , to do this type the following command:

```bash
   docker exec -it dspace7.1api /bin/bash
```

now , you can install any thing inside the container for example :

```bash
   apt-get install git
   apt-get install nano
```

## Copy files to DSpace 7 container

- if you want to copy any files from Dspace 7 container to your host or from your host to Dspace 7 container ,there are tow ways to do this :

  ## docker cp :

  - if you want to copy file from container to the host , type the following command:
    ```bash
    docker cp < container id or name >:<file path inside container>  < file path inside a host>
    ```
    for example:
    ```bash
    docker cp dspace7.1api:/dspace/edit-files/README.md \
    /home/ubuntu/Dspace7-test1/README.md
    ```
  - if you want to copy file from host to container , type the following command:
    ```bash
    docker cp < file path inside a host>  < container id or name >:<file path inside container>
    ```
    for example:
    ```bash
    docker cp /home/ubuntu/Dspace7-test1/README.md \
    dspace7.1api:/dspace/edit-files/README.md
    ```

  docker volume :

  ***

  - you can create a folder inside your host and make it a docker volume , so you can shared files between the container and the host
    , you can do this when to create the container (not after container created),to do this type the following command:
    ```bash
    docker run -d -p <host port>:<container port> --name <container name> \
    -v < host path >:<container path> <image name>
    ```
    for example:
    ```bash
    docker run -d -p 8080:8080 --name dspace7.1api \
    -v /home/ubuntu/Dspace7-pro:/dspace/edit-files Dspace7.1api
    ```

## Running database backup to AWS S3 bucket

- In case you want to backup the databases and upload them to AWS S3 bucket, we have written a special script that you can do this, and this script also enables you to perform further operations on the databases and AWS S3 bucket as you will see in the next section.
  - Firstly, you need to configure the AWS S3 bucket, you can do it with two ways:<br/>
    1- Manual configuration by editing [Database S3 backup](https://github.com/attia-alshareef/Dspace7/blob/master/pre-conf-files/db-S3-backup.sh) script and set the following variables with your AWS S3 informations:<br/>
    `AWS_ACCESS_KEY` , `AWS_SECRET_KEY` , `DEFAULT_REGION` , `BUCKET`.<br/>
    2- Automatic configuration by run the following command:
    ```
      sh pre-conf-files/db-S3-backup.sh \
      -aak <aws_access_key> \
      -ask <aws_secret_key> \
      -r <default_region> \
      --s3_config
    ```
  - To backup Dspace7 production database:
    ```bash
      sh pre-conf-files/db-S3-backup.sh \
      -h 54.220.211.123 \
      -u dspace7.1api \
      -p dspace7.1api \
      -d dspace7.1api \
      -b 7dspacebucket \
      -f king-bio-db-backups/pro \
      -s3b
    ```
  - To backup Dspace7 testing database:
    ```bash
      sh pre-conf-files/db-S3-backup.sh \
      -h 54.220.211.123 \
      -u dspace7api \
      -p dspace7api \
      -d dspace7api \
      -b 7dspacebucket \
      -f king-bio-db-backups/test \
      -s3b
    ```
  - Variables explanations:<br/>
    `-h` indicating to database host name.<br/>
    `-u` indicating to database user name.<br/>
    `-p` indicating to database user passowrd.<br/>
    `-d` indicating to database name.<br/>
    `-b` indicating to AWS S3 bucket name.<br/>
    `-f` indicating to AWS S3 bucket path to save a backup file.<br/>
    `-s3b` stands for `s3 backup` function.<br/>
- Learn more about the features and capabilities of our script from [Run database manipulation scripts](https://github.com/attia-alshareef/Dspace7/blob/master/docs/Run%20database%20manipulation%20scripts.md) document.

## Deleting expire database files from AWS S3 bucket

- By default, we have decided to keep only database backups for one week, so we need to delete files that are older than the last week, thus ensuring that we have backup files for the last seven days.
  - To delete the old backup files of the Dspace7 production database:
    ```
      sh pre-conf-files/db-S3-backup.sh \
      -b 7dspacebucket \
      -f king-bio-db-backups/pro \
      -s3d
    ```
  - To delete the old backup files of the Dspace7 testing database:
    ```
      sh pre-conf-files/db-S3-backup.sh \
      -b 7dspacebucket \
      -f king-bio-db-backups/test \
      -s3d
    ```

## Running database scripts from cron jobs

- In case you want to backup and delete old database files automatically every day, at 12pm for example,run:<br/>

  ```
    crontab -e
  ```

  and add the following line:

  ```
    PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

    #Backup dspace7api to AWS S3:
    0 0 * * * /home/ubuntu/Dspace7/pre-conf-files/db-S3-backup.sh -h 54.220.211.123 -u dspace7api -p dspace7api -d dspace7api -f king-bio-db-backups/test -s3b

    #Backup dspace7.1api to AWS S3:
    0 0 * * * /home/ubuntu/Dspace7/pre-conf-files/db-S3-backup.sh -h 54.220.211.123 -u dspace7.1api -p dspace7.1api -d dspace7.1api -f king-bio-db-backups/pro -s3b

    #Delete old Backup files for  dspace7.1api from  AWS S3:
    0 0 * * * /home/ubuntu/Dspace7/pre-conf-files/db-S3-backup.sh -f king-bio-db-backups/pro -s3d

    #Delete old Backup files for  dspace7api from  AWS S3:
    0 0 * * * /home/ubuntu/Dspace7/pre-conf-files/db-S3-backup.sh -f king-bio-db-backups/test -s3d
  ```

## Thinking and planning to Dockerfile

- At first, when we thought about doing a Dspace7 [Dockerfile](https://github.com/attia-alshareef/Dspace7/blob/master/Dockerfile), it seemed a bit natural and not complicated, and then things got a bit complicated and we faced some challenges to solve, for example:
  - As mentioned earlier in the introduction section, [7](http://kingabdullah.maktabat-online.com) owns two servers, one for production and the other for testing, and the two are different from each other in many settings, themes and connection files with S3 bucket ... etc, which means we need to work more than one repository and therefore more than Dockerfile, and therefore We will eventually generate two images, one for production and the other for testing.<br/>
    To make it simpler and easier, we created one repository for both and one Dockerfile, and we copied the configuration files of the test repository to the path [Testing server config files](https://github.com/attia-alshareef/Dspace7/tree/master/pre-conf-files/test-config).<br/>
    We also inserted a boolean variable in the Dockerfile indicating the type of the repository and we called it TEST_IMAGE, if its value is true the production repository configuration files are replaced with the test repository configuration files and vice versa.<br/>
    Accordingly we have one image we can create more than a container of it, whether production or testing by passing the TEST_IMAGE flag, see [Running Dspace 7 container](#running-dspace-7-container) section.

## Future work

- The default login language should be Arabic (some things have been tried, but we need more time to get it done).
- The user's preferred language after login does not work correctly (not yet worked).
- We must activate the https protocol on tomcat (some things have been tried, but we need to buy SSL certificates, because they are not free, there may be free certificates granted for 90 days, we can try later).
- The LDAP protocol must be activated (not yet worked).

## Reffrences
