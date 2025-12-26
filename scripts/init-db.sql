-- FanzDash PostgreSQL Database Initialization
-- This script runs when the PostgreSQL container first starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE fanzdash TO fanzdash;

-- Create schema if needed
CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL ON SCHEMA public TO fanzdash;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'FanzDash database initialized successfully at %', now();
END $$;
