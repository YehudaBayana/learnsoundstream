# get table records

```bash
docker exec soundstream-db psql -U soundstream -d soundstream -c "SELECT * FROM playback_history;"
```

records seperated:

```bash
docker exec soundstream-db psql -U soundstream -d soundstream \ -x -c "SELECT * FROM playback_history;"
```

# get all tables in the database

```bash
docker exec soundstream-db psql -U soundstream -d soundstream -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

# run pgAdmin to see postgres visually locally

docker run -d \
 --name pgadmin4 \
 -p 9090:80 \
 -e PGADMIN_DEFAULT_EMAIL=admin@admin.com \
 -e PGADMIN_DEFAULT_PASSWORD=admin \
 dpage/pgadmin4

# Postgres data lives in a Docker named volume. Run these on the remote machine:

docker volume ls
docker volume inspect soundstream_postgres_data --format '{{ .Mountpoint }}'

# The mountpoint is typically /var/lib/docker/volumes/soundstream_postgres_data/\_data. It's owned by root, so list it with:

sudo ls -la /var/lib/docker/volumes/soundstream_postgres_data/\_data

# To check how much space it uses and how much disk is free:

sudo du -sh /var/lib/docker/volumes/soundstream_postgres_data/\_data
df -h /

# To confirm the mount from the container's side:

docker inspect soundstream-db --format '{{ json .Mounts }}'
