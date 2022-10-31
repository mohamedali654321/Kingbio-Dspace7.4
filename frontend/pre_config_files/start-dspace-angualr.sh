#!/bin/sh

#Check if this is the first time the container has been run
if [ ! -e /usr/local/dspace7/FIRST_CONTAINER_STARTUP_DATE ]; then
    echo "-- First container startup --"

    #Create FIRST_CONTAINER_STARTUP_DATE file#
    touch /usr/local/dspace7/FIRST_CONTAINER_STARTUP_DATE
    echo "The first container startup date is `date`" > /usr/local/dspace7/FIRST_CONTAINER_STARTUP_DATE

    if [ -d /usr/local/dspace7/source/dist  ]; then
    ##After mounting dspace root dir to a volume which is the empty folder at the first time##
    ## so we need to copy the installed files agin into the root dir##
    echo "Copy DSpace installed files into the dspace root directory"
    echo "=========================================="
    ##Remove old files which come with the volume
    rm -R /usr/local/dspace7/source/dist
    rm -R /usr/local/dspace7/source/node_modules
    rm -R /usr/local/dspace7/source/config

    ##Copy new files which come with new build
    cp -R /dspace_build_files/dist /usr/local/dspace7/source/
    cp -R /dspace_build_files/node_modules /usr/local/dspace7/source/
    cp -R /dspace_build_files/config /usr/local/dspace7/source/
    # rm -rf /dspace_new_compiled_files

    ###End of the first time commands###
    else
    ##Copy new files which come with new build
    cp -R /dspace_build_files/dist /usr/local/dspace7/source/
    cp -R /dspace_build_files/node_modules /usr/local/dspace7/source/
    cp -R /dspace_build_files/config /usr/local/dspace7/source/

    # rm -rf /dspace_new_compiled_files
    fi
    ###End of the first time commands###
else
    echo "-- Not the first container startup --"
fi

#run dspace angular frontend:
if [ -d /usr/local/dspace7/source/dist ]; then
   cd /usr/local/dspace7/source
   cross-env NODE_ENV=production yarn run serve:ssr
else
    echo "-- No dist folder found --"
fi