# get table records
```bash
docker exec soundstream-db psql -U soundstream -d soundstream -c "SELECT * FROM playback_history;"
```

# get all tables in the database
```bash
docker exec soundstream-db psql -U soundstream -d soundstream -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```