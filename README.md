# Shopp E-commerce Platform - Server

This repository contains the official backend server for the **Shopp E-commerce Platform**. It is a robust and secure RESTful API built with **Node.js, Express, and TypeScript**, designed to power our frontend client.

The primary role of this server is to handle business logic, manage data persistence with a PostgreSQL database, and provide all necessary API endpoints for the e-commerce application.

> **Note:** The frontend client for this project can be found at: **https://github.com/Reddit-Clone-App-Project/Shopp_client**

## 🤝 We're Open to Contributions!

This project is open-source and we welcome contributions from the community! Whether you're fixing a bug, adding a new feature, or improving documentation, your help is appreciated.

To contribute, please follow these steps:
1.  **Fork** this repository to your own GitHub account.
2.  **Clone** your fork to your local machine.
3.  Create a new branch for your changes (`git checkout -b feature/my-new-feature`).
4.  Make your contributions.
5.  Submit a **Pull Request** back to our `main` branch.

We'll review your PR and merge it as soon as possible.

## 🚀 Getting Started

Follow these instructions to get a local copy of the server up and running for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A running [PostgreSQL](https://www.postgresql.org/) database instance.

### Database Setup

This project requires a PostgreSQL database. We have prepared the necessary SQL script to set up the database schema for you.

1.  Navigate to the database repository at the following link: **https://github.com/Reddit-Clone-App-Project/Database**
2.  Find the SQL file (e.g., `schema.sql` or `database.sql`) containing the table creation queries.
3.  Execute this script in your PostgreSQL database instance. This will create all the tables and relationships required for the application to function.
4.  After setting up the database, proceed to the installation steps below.

### Installation & Setup (manual)

1.  Clone your forked repository (replace `YOUR-USERNAME` and use your actual repository name):
    ```sh
    git clone https://github.com/YOUR-USERNAME/shopp-ecommerce-server.git
    cd shopp-ecommerce-server
    ```

2.  Install the project dependencies:
    ```sh
    npm install
    ```

3.  Create a `.env` file in the root of the project by copying the example file:
    ```sh
    cp .env.example .env
    ```

4.  **Crucially, update the `.env` file** with your database credentials (user, password, host, port, and the name of the database you just created).

5.  Run the development server:
    ```sh
    npm run dev
    ```
The server will now be running and listening on the port you defined in your `.env` file.

### Docker Deployment

1.  Make sure `docker` is installed in your system with the compose plugin.

2.  Create a directory for the project and download the `compose.yaml` file from the repository:
    ```sh
    mkdir shopp_server
    cd shopp_server
    wget https://github.com/Reddit-Clone-App-Project/Shopp_server/raw/refs/heads/main/compose.yaml
    ```

3.  Download the example .env file and edit it to include your necessary server credentials:
    ```sh
    wget https://github.com/Reddit-Clone-App-Project/Shopp_server/raw/refs/heads/main/env.example
    mv env.example .env
    nano .env # edit the file then save with Ctrl+S
    ```

4.  Let Docker Compose pull the image and run the server for you:
    ```sh
    docker compose up

    # run docker compose up -d for it to be detached
    # use docker compose down to stop and remove the container
    ```

## 📁 Project Folder Structure

We use a modular and scalable structure to keep the codebase organized and maintainable.

-   **`config/`**: Central place for configuration, especially database connection settings.
-   **`controllers/`**: Functions that handle the logic for incoming HTTP requests and crafting responses.
-   **`middlewares/`**: Custom Express middleware for tasks like error handling, authentication, etc.
-   **`models/`**: TypeScript types and interfaces that define the shape of our database entities.
-   **`routes/`**: Maps API endpoints (URLs) to their corresponding controller functions using Express Router.
-   **`services/`**: Business logic that interacts with the PostgreSQL database via `pg`.
-   **`types/`**: Contains shared types and interfaces used across the application.
-   **`utils/`**: Utility functions for common tasks like validation, formatting, etc.
-   **`app.ts`**: The core of the application where the Express app is initialized, and all middleware and routes are configured.
-   **`server.ts`**: The entry point that starts the server and makes it listen for requests on a specified port.

## 🔐 Security Hardening

This boilerplate comes pre-configured with several essential security packages to protect your API from common threats.

| Package | Purpose |
| :--- | :--- |
| `helmet` | Sets secure HTTP headers to protect against well-known web vulnerabilities. |
| `cors` | Controls Cross-Origin Resource Sharing to define which clients can access your API. |
| `express-rate-limit`| Prevents brute-force attacks by limiting repeated requests to public endpoints. |
| `xss-clean` | Sanitizes user input in `req.body`, `req.query`, and `req.params` to prevent Cross-Site Scripting (XSS). |
| `hpp` | Protects against HTTP Parameter Pollution attacks. |
| `csurf` | Provides Cross-Site Request Forgery (CSRF) protection. |
| `express-validator` | A powerful library for validating and sanitizing incoming request data. |
| `cookie-parser` | Parses cookies securely for use with authentication and CSRF protection. |
| `dotenv` | Manages and secures sensitive environment variables (e.g., DB credentials, API secrets). |

These tools are configured in `app.ts` and the `middlewares/` directory to ensure your API is resilient by default.
