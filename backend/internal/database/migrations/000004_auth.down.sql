-- 1. Remove the trigger from the users table first
DROP TRIGGER IF EXISTS users_set_updated_at ON users;

-- 2. Remove the helper function used by the trigger
DROP FUNCTION IF EXISTS set_updated_at();

-- 3. Drop the tables in reverse order (sessions first, since it links to users)
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;

-- 4. Drop the extensions (optional: only do this if no other tables in your database use them)
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS citext;