import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

// Create a new Pool instance. 
// The Pool will read connection information from environment variables
// automatically set by Vercel when Neon is connected.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Updated to use DATABASE_URL from Vercel/Neon
    // ssl: { rejectUnauthorized: false } // Typically not needed when deployed on Vercel as it handles SSL.
});

// Helper function to handle common response logic
function sendResponse(res, statusCode, body) {
    res.status(statusCode).json(body);
}

// Helper function to calculate expiration timestamp
function calculateExpirationTimestamp(expirationString) {
    if (!expirationString || expirationString === 'never') {
        return null;
    }
    const now = new Date();
    const amount = parseInt(expirationString.slice(0, -1), 10);
    const unit = expirationString.slice(-1);
    if (expirationString === '1m') { now.setMonth(now.getMonth() + 1); return now; }
    if (expirationString === '6m') { now.setMonth(now.getMonth() + 6); return now; }
    if (expirationString === '1y') { now.setFullYear(now.getFullYear() + 1); return now; }
    if (isNaN(amount)) return null;
    switch (unit) {
        case 'm': now.setMinutes(now.getMinutes() + amount); break;
        case 'h': now.setHours(now.getHours() + amount); break;
        case 'd': now.setDate(now.getDate() + amount); break;
        case 'w': now.setDate(now.getDate() + amount * 7); break;
        default: return null;
    }
    return now;
}

export default async function handler(req, res) {
    const { id: queryId, raw, password: queryPassword } = req.query;

    if (req.method === 'POST') {
        try {
            let { content, title, syntax, expiration, exposure, folder, password } = req.body;
            if (!content) {
                return sendResponse(res, 400, { message: 'Content is required' });
            }
            const pasteId = uuidv4();
            let hashedPassword = null;
            if (password && password.trim() !== '') {
                const saltRounds = 10;
                hashedPassword = await bcrypt.hash(password, saltRounds);
                exposure = 'private';
                console.log('Password provided for new paste ' + pasteId + ', hashing and setting exposure to private.');
            } else {
                if (exposure === 'private') exposure = 'public';
            }
            const expirationValue = calculateExpirationTimestamp(expiration);
            const queryText = `
                INSERT INTO pastes(id, content, title, syntax, exposure, folder, expiration, password_hash)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id, title, syntax, timestamp, exposure, folder, content;
            `;
            const values = [
                pasteId, content, title || 'MyGuy\'s Fresh Drop', syntax || 'none', 
                exposure || 'public', folder || 'none', expirationValue, hashedPassword
            ];
            const { rows } = await pool.query(queryText, values);
            const createdPaste = rows[0];
            console.log('Paste created in DB: ' + createdPaste.id + ', Title: ' + createdPaste.title + ', Exposure: ' + createdPaste.exposure);
            return sendResponse(res, 201, createdPaste);
        } catch (error) {
            console.error('Error creating paste in DB:', error);
            return sendResponse(res, 500, { message: 'Server error while creating paste' });
        }
    } else if (req.method === 'GET') {
        if (!queryId) {
            return sendResponse(res, 400, { message: 'Paste ID is required for fetching a specific paste.' });
        }
        try {
            const getQueryText = 'SELECT id, content, title, syntax, timestamp, exposure, folder, expiration, password_hash FROM pastes WHERE id = $1';
            const { rows } = await pool.query(getQueryText, [queryId]);
            if (rows.length > 0) {
                const paste = rows[0];
                console.log('Paste retrieved from DB: ' + queryId + ', Exposure: ' + paste.exposure + ', HasHash: ' + (!!paste.password_hash));
                if (paste.expiration && new Date(paste.expiration) < new Date()) {
                    console.log('Paste ' + queryId + ' has expired.');
                    return sendResponse(res, 404, { message: 'This drop has ghosted (expired or deleted).' });
                }
                if (paste.password_hash) {
                    if (!queryPassword) {
                        console.log('Password required for paste ' + queryId + ' but not provided.');
                        return sendResponse(res, 401, { 
                            passwordRequired: true, 
                            message: 'This drop is locked. Password needed, G.' 
                        });
                    }
                    const match = await bcrypt.compare(queryPassword, paste.password_hash);
                    if (!match) {
                        console.log('Incorrect password attempt for paste ' + queryId);
                        return sendResponse(res, 401, { message: 'Nah, that ain\'t the right password, fam.' });
                    }
                    console.log('Password correct for paste ' + queryId);
                } else if (paste.exposure === 'private') {
                    console.log('Paste ' + queryId + ' is private but has no password mechanism. Denying access.');
                    return sendResponse(res, 403, { message: 'This drop is private and unaccessible.' });
                }
                if (raw === 'true') {
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.status(200).send(paste.content);
                } else {
                    const { password_hash, ...pasteWithoutHash } = paste;
                    return sendResponse(res, 200, pasteWithoutHash);
                }
            } else {
                console.log('Paste not found in DB: ' + queryId);
                return sendResponse(res, 404, { message: 'Can\'t find that drop, G. Maybe it never existed?' });
            }
        } catch (error) {
            console.error('Error retrieving paste from DB:', error);
            return sendResponse(res, 500, { message: 'Server error while retrieving paste' });
        }
    } else {
        res.setHeader('Allow', ['POST', 'GET']);
        return sendResponse(res, 405, { message: 'Method ' + req.method + ' Not Allowed' });
    }
} 