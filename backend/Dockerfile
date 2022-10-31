#Build base image
FROM ubuntu:20.04 as dspace_base

#Install time zone(useful for installing postgresql):
ENV TZ=Asia/Riyadh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone \
 && apt update \
 && apt install -y tzdata

#Install and configure locales:
RUN apt-get install -y locales locales-all
ENV LC_ALL en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US.UTF-8

#Install general packages and dependencies:
RUN apt-get update && apt-get -y install openjdk-11-jdk wget nano maven ant git curl supervisor gettext-base cron postgresql && \
    update-alternatives --config java && \
#    pip install awscli && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

#Configure tomcat version:
ARG Tomcat_V_Arg=9.0.68
ENV Tomcat_V=${Tomcat_V_Arg}

#Set DSpace source type [latest-local]:
 ##--latest: If you need to download the latest code from github repo.
 ##--local: If you have a specific version on your local repo.
ARG SOURCE_TYPE_ARG="latest"
ENV SOURCE_TYPE=${SOURCE_TYPE_ARG}

#Set DSpace image compilation mode [pre-new]:
 ##--pre: If you have ready installed files
 ##--new: If you need new compilation process
ARG COMPILED_MODE_ARG="new"
ENV COMPILED_MODE=${COMPILED_MODE_ARG}

#Set Pre Dspace Info ENVs ,so you can pass dspace info at a run time(when to run a container):
    ## DS ENVs:
ENV DS_HOST=http://10.22.6.211:7077
ENV DS_NAME="DSpace 7 demo from knowledgeWare(Dev-server)"
ENV DS_UI_HOST=http://10.22.6.211:4007
ENV DS_SOLR_HOST=10.22.6.211
ENV DS_SOLR_PORT=8991
    ##DB ENVs:
ENV DB_PRE_CONFIG=false
ENV DB_HOST=10.22.6.211
ENV DB_ADMIN_USER=postgres
ENV DB_ADMIN_PASS=Kwaretech2022#
ENV DB_NAME=dspace7_4_db
ENV DB_USER=dspace7_4_db
ENV DB_PASS=dspace7_4_db

#CONFIGURE SMTP MAIL SERVER ON DSPACE:
ENV mail_server=smtp.gmail.com
ENV mail_username=dspace@kwareict.com
ENV mail_password=Kware@2021#
ENV mail_port=587
ENV Mail_Admin_Name='Kware Admin'
ENV notify_mail_server=dspace@kwareict.com

#CONFIGURE IIIF SERVER ON DSPACE:
ENV iiif_server='http://10.22.6.211:8182/iiif/3/'

#Create defualt working directory:
RUN mkdir -p /usr/local/dspace7

#Set defualt working directory:
WORKDIR /usr/local/dspace7

#Add Source Code To working directory based on $SOURCE_TYPE:
ADD . /usr/local/dspace7
RUN if [ "$SOURCE_TYPE_ARG" = "latest" ] ; then rm -R /usr/local/dspace7/source ; fi

#Setting supervisor service and creating directories for copy supervisor configurations:
RUN mkdir -p /var/log/supervisor && mkdir -p /etc/supervisor/conf.d && \
    cp pre_config_files/supervisor.conf /etc/supervisor.conf


###=================================================================================================================###

#Build dspace compilation image:
  ###Use dspace_base image:
FROM dspace_base as dspace_build

#Update OS Packages:
RUN apt-get update

RUN echo "-> SOURCE_TYPE= $SOURCE_TYPE"

#Add Source Code To working directory if $SOURCE_TYPE=Test:
RUN if [ "$SOURCE_TYPE" = "latest" ] ; then git clone https://github.com/DSpace/DSpace.git source ; fi

#Setup dspace database and local configuration based on our ARGs from dspace_base image:
RUN sh /usr/local/dspace7/pre_config_files/dspace_pre_config.build.sh

#Dspace Compilation:
RUN  cd source \
     && apt-get update \
     && mvn -U package

#Create Dspace directory:
RUN mkdir -p /dspace

#Install DSpace:
WORKDIR /usr/local/dspace7/source/dspace/target/dspace-installer
RUN ant fresh_install

#set user dspace:
RUN useradd dspace \
    && chown -Rv dspace: /dspace
USER dspace

###=================================================================================================================###

#Deploy dspace to tomcat and go a live:
  ###Use dspace_base image:
FROM dspace_base as dspace_live

#Update OS Packages:
RUN apt-get update

#Create defualt working directories && install tomcat:
RUN mkdir -p /dspace /dspace_new_compiled_files /usr/local/tomcat \
    # set tomcat user:
    && groupadd tomcat && useradd -s /bin/false -g tomcat -d /usr/local/tomcat tomcat \
    && wget https://www.apache.org/dist/tomcat/tomcat-9/v$Tomcat_V/bin/apache-tomcat-$Tomcat_V.tar.gz \
    && tar xvzf apache-tomcat-$Tomcat_V.tar.gz \
    && cp -r apache-tomcat-$Tomcat_V/* /usr/local/tomcat \
    && chown -Rv tomcat: /usr/local/tomcat \
    && rm apache-tomcat-$Tomcat_V.tar.gz \
    && rm -r apache-tomcat-$Tomcat_V && apt-get clean && rm -rf /var/lib/apt/lists/*

#Add Deployment Files To working directory:
COPY --chown=tomcat:tomcat --from=dspace_build /dspace /dspace

##After mounting dspace root dir to a volume which is the empty folder at the first time##
## so we need to copy the installed files agin into the root dir##
COPY --chown=tomcat:tomcat --from=dspace_build /dspace /dspace_new_compiled_files

#Run dspace crontab [Scheduled Tasks via Cron]:
RUN chmod 755 pre_config_files/dspace-cron \
    && /usr/bin/crontab pre_config_files/dspace-cron

#Set Java Opts Env:
ENV JAVA_OPTS="-Xmx2000m -Xms2000m"
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ENV JRE_HOME=/usr/lib/jvm/java-11-openjdk-amd64/jre
ENV CATALINA_HOME=/usr/local/tomcat
ENV CATALINA_BASE=/usr/local/tomcat

#Set a tomcat service[make a tomcat response to service command like "service tomcat restart"]:
RUN cp pre_config_files/tomcat.service /etc/init.d/tomcat \
    && chmod +x /etc/init.d/tomcat \
    && update-rc.d tomcat defaults

#Expose Tomcat Ports:
EXPOSE 8080 8005 8009 8443

#Remove Tomcat Defualt Files && Link Dspace With Tomcat:
RUN rm -rf /usr/local/tomcat/webapps/examples && \
    rm -rf /usr/local/tomcat/webapps/docs && \
    rm -rf /usr/local/tomcat/webapps/ROOT && \
    rm -rf /usr/local/tomcat/webapps/manager && \
    rm -rf /usr/local/tomcat/webapps/host-manager && \
# ln -s /dspace/webapps/server   /usr/local/tomcat/webapps/server
cp -R /dspace/webapps/server   /usr/local/tomcat/webapps/server

#RUN Tomcat && dspace pre-configuration scripts from supervisord:
CMD ["supervisord", "-c", "/etc/supervisor.conf"]

