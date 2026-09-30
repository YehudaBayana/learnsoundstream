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

# run pgAdmin to see postgres visually

docker run -d \
 --name pgadmin4 \
 -p 9090:80 \
 -e PGADMIN_DEFAULT_EMAIL=admin@admin.com \
 -e PGADMIN_DEFAULT_PASSWORD=admin \
 dpage/pgadmin4
