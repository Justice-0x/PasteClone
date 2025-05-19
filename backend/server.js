const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001; // Backend will run on a different port

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON request bodies

// In-memory store for pastes (NOT FOR PRODUCTION)
let pastes = {}; // Using an object to store pastes by ID

// API Endpoints

// POST /api/pastes - Create a new paste
app.post('/api/pastes', (req, res) => {
    try {
        const { content, title, syntax, expiration, exposure, folder } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const pasteId = uuidv4(); // Generate a unique ID
        const newPaste = {
            id: pasteId,
            content,
            title: title || 'MyGuy\'s Fresh Drop',
            syntax: syntax || 'none',
            expiration: expiration || '1d',
            exposure: exposure || 'public',
            folder: folder || 'none',
            timestamp: new Date().toISOString()
        };

        pastes[pasteId] = newPaste;

        console.log(`Paste created: ${pasteId}, Title: ${newPaste.title}`);
        res.status(201).json(newPaste);
    } catch (error) {
        console.error('Error creating paste:', error);
        res.status(500).json({ message: 'Server error while creating paste' });
    }
});

// GET /api/pastes/:id - Retrieve a paste
app.get('/api/pastes/:id', (req, res) => {
    try {
        const { id } = req.params;
        const paste = pastes[id];

        if (paste) {
            console.log(`Paste retrieved: ${id}`);
            res.status(200).json(paste);
        } else {
            console.log(`Paste not found: ${id}`);
            res.status(404).json({ message: 'Paste not found or expired' });
        }
    } catch (error) {
        console.error('Error retrieving paste:', error);
        res.status(500).json({ message: 'Server error while retrieving paste' });
    }
});

app.listen(PORT, () => {
    console.log(`MyGuy Paste backend server running on http://localhost:${PORT}`);
}); 