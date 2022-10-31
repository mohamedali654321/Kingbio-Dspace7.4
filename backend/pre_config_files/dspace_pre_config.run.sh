#!/bin/sh
(
#Check if this is the first time the container has been run
if [ ! -e /usr/local/dspace7/FIRST_CONTAINER_STARTUP_DATE ]; then
    echo "-- First container startup --"

    #Create FIRST_CONTAINER_STARTUP_DATE file#
    touch /usr/local/dspace7/FIRST_CONTAINER_STARTUP_DATE
    echo "The first container startup date is `date`" > /usr/local/dspace7/FIRST_CONTAINER_STARTUP_DATE

    ###The following commands will only run once when the container is first started###
    echo "Check if Dspace have a pre installed database , if not , create a new one:"
    echo "=========================================================================="

    if [ $DB_PRE_CONFIG = 'false' ]; then
    #The commands below assume that the password for postgres user is pre-set:
    PGPASSWORD="$DB_ADMIN_PASS" psql -h $DB_HOST -U postgres -c "CREATE ROLE $DB_USER PASSWORD '$DB_PASS' SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN;"
    #create new database:
    PGPASSWORD="$DB_ADMIN_PASS" psql -h $DB_HOST -U postgres -c "CREATE DATABASE $DB_NAME WITH OWNER $DB_USER;"
    #create new EXTENSION pgcrypto:
    PGPASSWORD="$DB_PASS" psql -h $DB_HOST -U $DB_USER $DB_NAME -c "CREATE EXTENSION pgcrypto SCHEMA public VERSION '1.3';"
    fi

    sleep 5

    ##After mounting dspace root dir to a volume which is maybe the empty folder at the first time##
    ## so we need to copy the installed files agin into the root dir##
    echo "Copy DSpace installed files into the dspace root directory"
    echo "=========================================="
    if [ $COMPILED_MODE = 'new' ]; then
      echo "check if the volume is not empty at the first time(in this case we have an old compiled files) ..."
      if [ "$(ls -A /dspace)" ]; then
      mkdir -p /usr/local/dspace7/old_compiled_files
      cp -R /dspace/* /usr/local/dspace7/old_compiled_files
      rm -rf /dspace/*
      fi
    sleep 5 
    echo "start copying the installed files....."
    cp -R /dspace_new_compiled_files/* /dspace
    echo "done....."
    fi


    echo "create local.cfg file"
    echo "=========================================="
    envsubst < "/usr/local/dspace7/pre_config_files/local.cfg.run" > "/dspace/config/local.cfg"
    echo "created successfully"
    echo ok

    echo "dspace index discovery"
    echo "=========================================="
    /dspace/bin/dspace index-discovery -b

    echo "dspace filter media"
    echo "=========================================="
    /dspace/bin/dspace filter-media -v  -p "ImageMagick PDF Thumbnail","ImageMagick Image Thumbnail"
    /dspace/bin/dspace filter-media -p "PDF Text Extractor","Word Text Extractor"

    ###End of the first time commands###
else
    echo "-- Not the first container startup --"
fi
) 2>&1 | tee -a dspace_pre_config.log


