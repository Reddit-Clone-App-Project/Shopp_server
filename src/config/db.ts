import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test the connection
pool
  .connect()
  .then(() => {
    console.log("Successfully connected to Supabase PostgreSQL database! 🚀");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

export default pool;
