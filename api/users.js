import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid'; // For user ID if not using DB default

// Initialize a connection pool for PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// IMPORTANT: Store your JWT secret in an environment variable!
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_REALLY_SECRET_KEY_THAT_SHOULD_BE_LONG_AND_RANDOM';

// Helper function to send responses
function sendResponse(res, statusCode, body) {
    res.status(statusCode).json(body);
}

export default async function handler(req, res) {
    const { url, method, body } = req;

    if (method === 'POST') {
        if (url.endsWith('/users/register')) {
            // ==== REGISTER ====
            try {
                const { username, email, password } = body;

                if (!username || !password) {
                    return sendResponse(res, 400, { message: 'Username and password are required.' });
                }
                if (password.length < 6) {
                    return sendResponse(res, 400, { message: 'Password must be at least 6 characters long.' });
                }

                // Check if username or email already exists
                const userCheckQuery = 'SELECT * FROM users WHERE username = $1 OR (email IS NOT NULL AND email = $2)';
                const userCheckResult = await pool.query(userCheckQuery, [username, email || null]); // Use null if email is not provided
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
                
                // Role is 'user' by default as per DB schema
                const insertQuery = 'INSERT INTO users(username, email, password_hash) VALUES($1, $2, $3) RETURNING id, username, email, role, created_at';
                const { rows } = await pool.query(insertQuery, [username, email || null, hashedPassword]);
                const newUser = rows[0];

                console.log('User registered successfully:', newUser.username);
                // Do not send password_hash back to client
                const { password_hash, ...userToSend } = newUser; 
                return sendResponse(res, 201, { message: 'User registered successfully!', user: userToSend });

            } catch (error) {
                console.error('Registration error:', error);
                if (error.code === '23505') { // Unique constraint violation
                     return sendResponse(res, 409, { message: 'Username or email already exists.' });
                }
                return sendResponse(res, 500, { message: 'Server error during registration.' });
            }

        } else if (url.endsWith('/users/login')) {
            // ==== LOGIN ====
            try {
                const { username, password } = body;

                if (!username || !password) {
                    return sendResponse(res, 400, { message: 'Username and password are required.' });
                }

                const queryText = 'SELECT id, username, email, password_hash, role FROM users WHERE username = $1';
                const { rows } = await pool.query(queryText, [username]);

                if (rows.length === 0) {
                    console.log('Login attempt - user not found:', username);
                    return sendResponse(res, 401, { message: 'Invalid username or password.' });
                }

                const user = rows[0];
                const passwordMatch = await bcrypt.compare(password, user.password_hash);

                if (!passwordMatch) {
                    console.log('Login attempt - incorrect password for user:', username);
                    return sendResponse(res, 401, { message: 'Invalid username or password.' });
                }

                const tokenPayload = {
                    userId: user.id,
                    username: user.username,
                    role: user.role
                };

                const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' }); // Token expires in 1 day

                console.log('User logged in successfully:', user.username);
                // Do not send password_hash back to client
                const { password_hash, ...userToSend } = user;
                return sendResponse(res, 200, { 
                    message: 'Login successful!', 
                    token,
                    user: userToSend
                });

            } catch (error) {
                console.error('Login error:', error);
                return sendResponse(res, 500, { message: 'Server error during login.' });
            }
        } else {
            return sendResponse(res, 404, { message: 'User API endpoint not found.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return sendResponse(res, 405, { message: `Method ${method} Not Allowed on /api/users` });
    }
} 