# BuildStack PostgreSQL Database Setup Guide

This guide explains how to set up the PostgreSQL database for local development.

## 1. Prerequisites
- PostgreSQL 14 or higher (either installed locally or via Docker)
- A database client (e.g., pgAdmin, DBeaver, or DataGrip)

## 2. Docker Setup (Recommended)
If you have Docker installed, you can easily spin up a PostgreSQL instance using the following command:

```bash
docker run --name buildstack-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=buildstack \
  -p 5432:5432 \
  -d postgres:15
```

## 3. Environment Variables
The Spring Boot application relies on environment variables for database connectivity. Set the following environment variables in your IDE or `.env` file before running the application:

```env
DB_URL=jdbc:postgresql://localhost:5432/buildstack
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

## 4. Initialization
Currently, `spring.jpa.hibernate.ddl-auto` is set to `validate`. 
This means Hibernate will **not** create or update tables automatically. It will only verify that the tables exist and match the entity definitions.
When entities and migrations (like Liquibase or Flyway) are introduced in later phases, the schema will be managed appropriately. For now, no tables are required to start the application shell.
