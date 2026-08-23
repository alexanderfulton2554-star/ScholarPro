import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

dotenv.config();

const password = process.env.RESET_PASSWORD;
const email = process.env.RESET_EMAIL;
if (!password || !email || !process.env.DATABASE_URL) {
  throw new Error('RESET_PASSWORD, RESET_EMAIL, and DATABASE_URL are required');
}
const hash = bcryptjs.hashSync(password, 10);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

(async () => {
  try {
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING email, password_hash',
      [hash, email]
    );
    console.log('Updated:', result.rows[0]);
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
