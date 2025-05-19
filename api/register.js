import { Pool } from 'pg';
import bcrypt from 'bcrypt';

// Initialize a connection pool for PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Helper function to send responses
function sendResponse(res, statusCode, body) {
    res.status(statusCode).json(body);
}

export default async function handler(req, res) {
    console.log(`[api/register.js] Received request: Method=${req.method}, URL=${req.url}`);

    if (req.method === 'POST') {
        console.log('[api/register.js] Attempting registration...');
        try {
            const { username, email, password } = req.body;

            if (!username || !password) {
                return sendResponse(res, 400, { message: 'Username and password are required.' });
            }
            if (password.length < 6) {
                return sendResponse(res, 400, { message: 'Password must be at least 6 characters long.' });
            }

            const userCheckQuery = 'SELECT * FROM users WHERE username = $1 OR (email IS NOT NULL AND email = $2)';
            const userCheckResult = await pool.query(userCheckQuery, [username, email || null]);
            if (userCheckResult.rows.length > 0) {
                if (userCheckResult.rows[0].username === username) {
                    return sendResponse(res, 409, { message: 'Username already taken. Please choose another.' });
                }
                if (email && userCheckResult.rows[0].email === email) {
                     return sendResponse(res, 409, { message: 'Email already registered. Please use a different email or login.' });
                }
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            const insertQuery = 'INSERT INTO users(username, email, password_hash) VALUES($1, $2, $3) RETURNING id, username, email, role, created_at';
            const { rows } = await pool.query(insertQuery, [username, email || null, hashedPassword]);
            const newUser = rows[0];

            console.log('[api/register.js] User registered successfully:', newUser.username);
            const { password_hash, ...userToSend } = newUser; 
            return sendResponse(res, 201, { message: 'User registered successfully!', user: userToSend });

        } catch (error) {
            console.error('[api/register.js] Registration error:', error);
            if (error.code === '23505') { // Unique constraint violation
                 return sendResponse(res, 409, { message: 'Username or email already exists.' });
            }
            return sendResponse(res, 500, { message: 'Server error during registration.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return sendResponse(res, 405, { message: `Method ${req.method} Not Allowed on /api/register` });
    }
} 