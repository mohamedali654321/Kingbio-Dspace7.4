#!/bin/sh

echo "Check if Dspace have a pre installed database , if not , create a new one:"
echo "=========================================================================="
if [ $DB_PRE_CONFIG = 'false' ]; then

#The commands below assume that the password for postgres user is "admin":

#create new database user with new password:
PGPASSWORD="$DB_ADMIN_PASS" psql -h $DB_HOST -U postgres -c "CREATE ROLE $DB_USER PASSWORD '$DB_PASS' SUPERUSER CREATEDB CREATEROLE INHERIT LOGIN;"

#create new database:
PGPASSWORD="$DB_ADMIN_PASS" psql -h $DB_HOST -U postgres -c "CREATE DATABASE $DB_NAME WITH OWNER $DB_USER;"

#create new EXTENSION pgcrypto:
PGPASSWORD="$DB_PASS" psql -h $DB_HOST -U $DB_USER $DB_NAME -c "CREATE EXTENSION pgcrypto SCHEMA public VERSION '1.3';"

#Change DB_PRE_CONFIG variable to "true" to pervent the same database from recreated at the next time:
export DB_PRE_CONFIG='true'

fi

echo "create local.cfg file"
echo "=========================================="

envsubst < "/usr/local/dspace7/pre_config_files/local.cfg.build" > "/usr/local/dspace7/source/dspace/config/local.cfg"
echo "created successfully"
echo ok
