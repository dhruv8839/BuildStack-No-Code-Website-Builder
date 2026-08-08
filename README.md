# BuildStack

BuildStack is a commercial-grade no-code website builder that allows users to create, design, and publish websites visually. It features a robust architecture with a Spring Boot backend and a React (Vite) frontend, designed to provide an experience similar to Webflow, Framer, or Wix.

---

## 🏗️ Folder Structure

BuildStack is structured as a monorepo containing two main directories:

- `/backend` - The Spring Boot application providing REST APIs, authentication, website generation, and database interactions.
- `/frontend` - The React application built with Vite, Tailwind CSS v4, and Redux Toolkit, providing the user interface and visual builder.

---

## 🛠️ Tech Stack

### Backend
- **Java 23**
- **Spring Boot 3.3** (Web, Data JPA, Security, Validation)
- **PostgreSQL** (Database)
- **Flyway** (Database Migrations)
- **Hibernate** (ORM)
- **JWT** (Authentication)
- **Swagger / OpenAPI** (API Documentation)
- **Maven** (Build Tool)

### Frontend
- **React 19**
- **Vite 8**
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** (Component Library)
- **Redux Toolkit & RTK Query** (State Management & Data Fetching)
- **React Router v7**

---

## 📋 Prerequisites

To run this project locally, ensure you have the following installed:
- [Java Development Kit (JDK) 23](https://jdk.java.net/23/)
- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 16+](https://www.postgresql.org/)
- Optional: pgAdmin or DBeaver for database management.

---

## 🚀 Setup & Installation

### 1. PostgreSQL Setup
1. Ensure your local PostgreSQL server is running.
2. Create a database named `BuildStack`.
   - *Example (psql)*: `CREATE DATABASE "BuildStack";`
3. Ensure you know your `postgres` user password.

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Copy the `.env.example` file to create your local `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Open the `.env` file and update `DB_PASSWORD` to match your local PostgreSQL password. Leave other defaults as they are.

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## 🏃 Running the Application

### Running the Backend
From the `/backend` directory, use the Maven wrapper:
```bash
# Windows
mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```
*Note: On the very first startup, Flyway will automatically execute migrations to create all necessary database tables in your empty PostgreSQL instance.*

### Running the Frontend
From the `/frontend` directory, start the Vite development server:
```bash
npm run dev
```
Open your browser to `http://localhost:5173`.

---

## 🧪 Running Tests

**Backend Tests:**
```bash
cd backend
mvnw.cmd clean test
```
*The backend uses Testcontainers for integration tests. Ensure Docker is running if executing integration tests locally.*

**Frontend Build Verification:**
```bash
cd frontend
npm run build
```

---

## 🗄️ Flyway Migrations

The database schema is strictly managed by Flyway. 
Hibernate is configured to **validate** the schema (`spring.jpa.hibernate.ddl-auto=validate`), ensuring the application never silently mutates the database on startup.

Migrations are located in:
`backend/src/main/resources/db/migration/`

---

## 📚 API Documentation (Swagger)

When the backend is running, the interactive Swagger UI is automatically available.
Navigate to:
[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## 💡 Recommended Development Workflow

1. Start your local PostgreSQL server.
2. Open a terminal and run the backend (`mvnw.cmd spring-boot:run`).
3. Open a second terminal and run the frontend (`npm run dev`).
4. Access the web interface at `localhost:5173`.
5. Access API documentation at `localhost:8080/swagger-ui.html`.
