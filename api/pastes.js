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

const RESERVED_ALIASES = ['api', 'users', 'login', 'register', 'pastes', 'index.html', 'styles.css', 'app.js'];

// Helper function to validate alias
function isValidAlias(alias) {
    if (!alias) return true; // Alias is optional
    if (alias.length < 3 || alias.length > 50) return false;
    if (!/^[a-zA-Z0-9_-]+$/.test(alias)) return false; // Alphanumeric, underscore, hyphen
    if (RESERVED_ALIASES.includes(alias.toLowerCase())) return false;
    // Check if it looks like a UUID - we don't want aliases to be UUIDs
    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(alias)) return false;
    return true;
}

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
    // Extract userId from JWT if available (we'll add this logic later when integrating user accounts with pastes)
    // For now, custom alias is not tied to being logged in, but could be in future.

    if (req.method === 'POST') {
        try {
            let { content, title, syntax, expiration, exposure, folder, password, custom_alias } = req.body;

            if (!content) {
                return sendResponse(res, 400, { message: 'Content is required' });
            }

            if (custom_alias && !isValidAlias(custom_alias)) {
                return sendResponse(res, 400, { message: 'Invalid custom alias. Must be 3-50 chars, alphanumeric, underscore, or hyphen, and not a reserved word or UUID format.' });
            }

            const pasteId = uuidv4();
            let hashedPassword = null;
            if (password && password.trim() !== '') {
                const saltRounds = 10;
                hashedPassword = await bcrypt.hash(password, saltRounds);
                exposure = 'private'; // Assuming password implies private
                console.log('Password provided for new paste ' + pasteId + ', hashing and setting exposure to private.');
            } else {
                if (exposure === 'private') exposure = 'public'; // Cannot be private without password by default
            }
            const expirationValue = calculateExpirationTimestamp(expiration);
            
            const queryText = `
                INSERT INTO pastes(id, content, title, syntax, exposure, folder, expiration, password_hash, custom_alias, user_id)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                RETURNING id, title, syntax, timestamp, exposure, folder, content, custom_alias, user_id;
            `;
            // user_id is $10, will be null for now. Will be populated when users feature is linked to pastes.
            const values = [
                pasteId, content, title || 'MyGuy\'s Fresh Drop', syntax || 'none', 
                exposure || 'public', folder || 'none', expirationValue, hashedPassword, 
                custom_alias || null, null 
            ];

            const { rows } = await pool.query(queryText, values);
            const createdPaste = rows[0];
            console.log('Paste created in DB: ' + createdPaste.id + ', Title: ' + createdPaste.title + ', Exposure: ' + createdPaste.exposure + ', Alias: ' + createdPaste.custom_alias);
            return sendResponse(res, 201, createdPaste);
        } catch (error) {
            console.error('Error creating paste in DB:', error);
            if (error.code === '23505' && error.constraint === 'pastes_custom_alias_key') {
                return sendResponse(res, 409, { message: 'Custom alias already taken. Please choose another.' });
            }
            return sendResponse(res, 500, { message: 'Server error while creating paste' });
        }
    } else if (req.method === 'GET') {
        if (!queryId) {
            return sendResponse(res, 400, { message: 'Paste ID or Alias is required for fetching.' });
        }
        try {
            let paste;
            // Check if queryId looks like a UUID. If not, try as custom_alias first.
            const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(queryId);

            if (!isUUID) {
                console.log(`[api/pastes.js] Attempting to fetch by custom_alias: ${queryId}`);
                const aliasQueryText = 'SELECT id, content, title, syntax, timestamp, exposure, folder, expiration, password_hash, custom_alias, user_id FROM pastes WHERE custom_alias = $1';
                const aliasResult = await pool.query(aliasQueryText, [queryId]);
                if (aliasResult.rows.length > 0) {
                    paste = aliasResult.rows[0];
                }
            }

            // If not found by alias or if it was a UUID, try by ID
            if (!paste && isUUID) {
                console.log(`[api/pastes.js] Attempting to fetch by ID: ${queryId}`);
                const idQueryText = 'SELECT id, content, title, syntax, timestamp, exposure, folder, expiration, password_hash, custom_alias, user_id FROM pastes WHERE id = $1';
                const idResult = await pool.query(idQueryText, [queryId]);
                if (idResult.rows.length > 0) {
                    paste = idResult.rows[0];
                }
            } else if (!paste && !isUUID) {
                // If it wasn't a UUID and not found by alias, it's likely an invalid ID/alias combo
                 console.log(`[api/pastes.js] Alias ${queryId} not found, and it's not a UUID.`);
            }

            if (paste) {
                console.log('Paste retrieved from DB: ' + paste.id + ', Alias: ' + paste.custom_alias + ', Exposure: ' + paste.exposure + ', HasHash: ' + (!!paste.password_hash));
                
                if (paste.expiration && new Date(paste.expiration) < new Date()) {
                    console.log('Paste ' + (paste.custom_alias || paste.id) + ' has expired.');
                    return sendResponse(res, 404, { message: 'This drop has ghosted (expired or deleted).' });
                }

                // Password protection logic (remains the same)
                if (paste.password_hash) {
                    if (!queryPassword) {
                        console.log('Password required for paste ' + (paste.custom_alias || paste.id) + ' but not provided.');
                        return sendResponse(res, 401, { 
                            passwordRequired: true, 
                            message: 'This drop is locked. Password needed, G.' 
                        });
                    }
                    const match = await bcrypt.compare(queryPassword, paste.password_hash);
                    if (!match) {
                        console.log('Incorrect password attempt for paste ' + (paste.custom_alias || paste.id));
                        return sendResponse(res, 401, { message: 'Nah, that ain\'t the right password, fam.' });
                    }
                    console.log('Password correct for paste ' + (paste.custom_alias || paste.id));
                } else if (paste.exposure === 'private') {
                    console.log('Paste ' + (paste.custom_alias || paste.id) + ' is private but has no password mechanism. Denying access.');
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
                console.log('Paste not found in DB by ID/Alias: ' + queryId);
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