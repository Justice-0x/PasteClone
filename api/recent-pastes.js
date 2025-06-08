import { Pool } from 'pg';

// Create a new Pool instance from environment variables
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Helper function to handle common response logic
function sendResponse(res, statusCode, body) {
    res.status(statusCode).json(body);
}

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const queryText = `
                SELECT id, title, timestamp
                FROM pastes
                WHERE exposure = 'public'
                  AND (expiration IS NULL OR expiration > NOW())
                ORDER BY timestamp DESC
                LIMIT 5;
            `;
            // We could also add created_at and order by that if timestamp is meant for last updated.
            // For now, assuming timestamp is creation time.

            const { rows } = await pool.query(queryText);
            
            console.log(`Retrieved ${rows.length} recent pastes from DB.`);
            return sendResponse(res, 200, rows);

        } catch (error) {
            console.error('Error retrieving recent pastes from DB:', error);
            return sendResponse(res, 500, { message: 'Server error while retrieving recent pastes' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        return sendResponse(res, 405, { message: `Method ${req.method} Not Allowed` });
    }
} 