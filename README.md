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

✅ This structure is clean, modular, and scalable — suitable for production-ready REST APIs.

---

## 🔐 Security Packages Used

This project includes several packages to enhance API security:

| Package              | Purpose                                                                 |
|----------------------|-------------------------------------------------------------------------|
| `helmet`             | Sets secure HTTP headers to protect against well-known web vulnerabilities. |
| `cors`               | Controls cross-origin resource sharing — defines what clients can access your API. |
| `express-rate-limit`| Limits repeated requests to public APIs to prevent brute-force attacks.  |
| `xss-clean`          | Sanitizes user input to prevent cross-site scripting (XSS) attacks.     |
| `hpp`                | Protects against HTTP parameter pollution attacks.                      |
| `csurf`              | Provides CSRF protection (cross-site request forgery).                  |
| `express-validator`  | Validates and sanitizes input to prevent injection and invalid data.    |
| `cookie-parser`      | Parses cookies securely for use with authentication and CSRF protection.|
| `dotenv`             | Secures sensitive environment variables (e.g., DB credentials, secrets).|

> These tools are configured in `app.ts` and middlewares to ensure that your app is resilient to common web vulnerabilities.

---

