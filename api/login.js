import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Initialize a connection pool for PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// IMPORTANT: JWT_SECRET must be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to send responses
function sendResponse(res, statusCode, body) {
    res.status(statusCode).json(body);
}

export default async function handler(req, res) {
    console.log(`[api/login.js] Received request: Method=${req.method}, URL=${req.url}`);

    if (!JWT_SECRET) {
        console.error('[api/login.js] JWT_SECRET is not set in environment variables.');
        return sendResponse(res, 500, { message: 'Server configuration error: JWT secret missing.' });
    }

    if (req.method === 'POST') {
        console.log('[api/login.js] Attempting login...');
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return sendResponse(res, 400, { message: 'Username and password are required.' });
            }

            const queryText = 'SELECT id, username, email, password_hash, role FROM users WHERE username = $1';
            const { rows } = await pool.query(queryText, [username]);

            if (rows.length === 0) {
                console.log('[api/login.js] Login attempt - user not found:', username);
                return sendResponse(res, 401, { message: 'Invalid username or password.' });
            }

            const user = rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password_hash);

            if (!passwordMatch) {
                console.log('[api/login.js] Login attempt - incorrect password for user:', username);
                return sendResponse(res, 401, { message: 'Invalid username or password.' });
            }

            const tokenPayload = {
                userId: user.id,
                username: user.username,
                role: user.role
            };

            const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });

            console.log('[api/login.js] User logged in successfully:', user.username);
            const { password_hash, ...userToSend } = user;
            return sendResponse(res, 200, { 
                message: 'Login successful!', 
                token,
                user: userToSend
            });

        } catch (error) {
            console.error('[api/login.js] Login error:', error);
            return sendResponse(res, 500, { message: 'Server error during login.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return sendResponse(res, 405, { message: `Method ${req.method} Not Allowed on /api/login` });
    }
} 