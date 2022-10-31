# Dspace 7 UI development enviroment

## Build dspace 7 UI development docker image:

```
docker build -t <image name> .
```

EX:

```
docker build -t dspace7.2-ui .
```

## Run dspace 7 UI development docker container:

```
  docker run -d -p <dspace 7 UI port>:80 -v <dspace files path on the server>:/usr/local/dspace7/source/dist --name <container name> <dspace dev-env image>
```

- NOTE: <dspace 7 UI port> must be "synced" with the 'dspace.ui.url' setting in your backend's local.cfg.

EX:

```
  docker run -d -p 4001:80 -v /home/ubuntu/attia-testing/dspace7-last-update/7.2/ui/source/dist:/usr/local/dspace7/source/dist --name dspace7.2-ui dspace7.2-ui
```
