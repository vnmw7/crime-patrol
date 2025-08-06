const postgres = require('postgres');
require('dotenv').config();

const connectionString = process.env.SUPABASE_SESSION_POOLER_URL;

if (!connectionString) {
  throw new Error("The SUPABASE_SESSION_POOLER_URL environment variable is not set.");
}

/**
 * Connects to Supabase using the session pooler URL.
 * It's recommended to use SSL for secure connections.
 */
const sql = postgres(connectionString, {
  ssl: 'require',
});

module.exports = sql;
