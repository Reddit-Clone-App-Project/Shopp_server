# 📁 Project Folder Structure: Node.js + Express + TypeScript (RESTful API with pg)


## 🔍 Folder & File Descriptions

- **controllers/** – Contains functions that receive HTTP requests and send responses.
- **routes/** – Maps URLs to controller functions using Express Router.
- **services/** – Contains the logic to interact with the PostgreSQL database via `pg`.
- **models/** – Holds TypeScript types or interfaces representing your database structure.
- **middlewares/** – Custom Express middleware (e.g., error handling, authentication).
- **config/** – Central place for configuration, especially database connection.
- **utils/** – Utility functions like formatters, validators, etc.
- **types/** – Application-wide shared types/interfaces.
- **app.ts** – Initializes Express app, configures middleware and routes.
- **server.ts** – Runs the app and listens on the specified port.

---

✅ This structure is clean, modular, and scalable — suitable for production-ready REST APIs.

