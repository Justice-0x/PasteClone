const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const formidable = require('formidable').default || require('formidable');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001; // Backend will run on a different port

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'matrix');

async function ensureUploadsDir() {
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
}

function generateMatrixId() {
  return crypto.randomBytes(16).toString('hex');
}

function calculateExpiration(duration) {
  const now = new Date();
  switch (duration) {
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000);
    case '24h':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default 24h
  }
}

function getMaxFileSize(userType = 'free') {
  return userType === 'paid' ? 10 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024;
}

function getUserType(req) {
  // For now, return 'free' - in the future, check auth token/user subscription
  return 'free';
}

// Matrix download helper functions
async function getMetadata(matrixId) {
  try {
    const metadataPath = path.join(UPLOADS_DIR, `${matrixId}.json`);
    const metadataContent = await fs.readFile(metadataPath, 'utf8');
    return JSON.parse(metadataContent);
  } catch (error) {
    return null;
  }
}

async function updateMetadata(matrixId, metadata) {
  try {
    const metadataPath = path.join(UPLOADS_DIR, `${matrixId}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    return true;
  } catch (error) {
    return false;
  }
}

function validatePassword(inputPassword, hashedPassword) {
  if (!hashedPassword) return true; // No password required
  if (!inputPassword) return false; // Password required but not provided

  const inputHash = crypto.createHash('sha256').update(inputPassword).digest('hex');
  return inputHash === hashedPassword;
}

async function cleanupExpiredFile(matrixId, metadata) {
  try {
    // Delete all files
    for (const file of metadata.files) {
      await fs.unlink(file.path);
    }
    // Delete metadata
    await fs.unlink(path.join(UPLOADS_DIR, `${matrixId}.json`));
    console.log(`Cleaned up expired Matrix share: ${matrixId}`);
  } catch (cleanupError) {
    console.error('Cleanup error for', matrixId, ':', cleanupError);
  }
}

// Middleware
app.use(cors({
  origin: [
    'http://localhost:1234',
    'http://localhost:59540',
    'http://localhost:60024',
    'http://localhost:63497',
    'http://127.0.0.1:1234',
    'http://127.0.0.1:59540',
    'http://127.0.0.1:60024',
    'http://127.0.0.1:63497'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); // Enable CORS for all routes
app.use(express.json()); // To parse JSON request bodies

// In-memory store for pastes (NOT FOR PRODUCTION)
let pastes = {}; // Using an object to store pastes by ID

// Matrix Upload API Endpoint
app.post('/api/matrix-upload', async (req, res) => {
  try {
    await ensureUploadsDir();

    // Determine user type and file size limits
    const userType = getUserType(req);
    const maxFileSize = getMaxFileSize(userType);

    const form = formidable({
      uploadDir: UPLOADS_DIR,
      keepExtensions: true,
      maxFileSize: maxFileSize,
      multiples: true
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Upload error:', err);

        // Handle file size limit error specifically
        if (err.code === 'LIMIT_FILE_SIZE' || err.message.includes('maxFileSize')) {
          const limitMessage = userType === 'free'
            ? 'File too large! Free users limited to 2GB. Upgrade for 10GB limit.'
            : 'File too large! Maximum size is 10GB.';
          return res.status(413).json({
            error: limitMessage,
            userType: userType,
            maxSize: maxFileSize
          });
        }

        return res.status(400).json({ error: 'Upload failed', details: err.message });
      }

      try {
        const matrixId = generateMatrixId();
        const expiration = fields.expiration ? fields.expiration[0] : '24h';
        const password = fields.password ? fields.password[0] : null;
        const expiresAt = calculateExpiration(expiration);

        // Handle multiple files
        const fileList = Array.isArray(files.files) ? files.files : [files.files].filter(Boolean);

        if (fileList.length === 0) {
          return res.status(400).json({ error: 'No files uploaded' });
        }

        // Check total size for free users (additional limit)
        const totalSize = fileList.reduce((sum, file) => sum + (file?.size || 0), 0);
        if (userType === 'free' && totalSize > maxFileSize) {
          return res.status(413).json({
            error: 'Total file size exceeds 2GB limit for free users. Upgrade for 10GB limit.',
            userType: userType,
            totalSize: totalSize,
            maxSize: maxFileSize
          });
        }

        const uploadedFiles = [];

        for (const file of fileList) {
          if (!file) continue;

          const fileId = generateMatrixId();
          const originalName = file.originalFilename || 'unknown';
          const fileSize = file.size;
          const mimeType = file.mimetype || 'application/octet-stream';

          // Move file to final location with Matrix ID
          const finalPath = path.join(UPLOADS_DIR, `${fileId}.enc`);
          await fs.rename(file.filepath, finalPath);

          uploadedFiles.push({
            id: fileId,
            originalName,
            size: fileSize,
            mimeType,
            path: finalPath
          });
        }

        // Set download limits based on user type
        const maxDownloads = userType === 'paid' ? 1000 : 100;

        // Create metadata file
        const metadata = {
          id: matrixId,
          files: uploadedFiles,
          createdAt: new Date(),
          expiresAt,
          password: password ? crypto.createHash('sha256').update(password).digest('hex') : null,
          downloadCount: 0,
          maxDownloads: maxDownloads,
          userType: userType
        };

        const metadataPath = path.join(UPLOADS_DIR, `${matrixId}.json`);
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

        // Return success response
        res.status(200).json({
          success: true,
          id: matrixId,
          downloadUrl: `/matrix-share/download/${matrixId}`,
          expiresAt: expiresAt.toISOString(),
          fileCount: uploadedFiles.length,
          totalSize: uploadedFiles.reduce((sum, file) => sum + file.size, 0),
          userType: userType,
          maxDownloads: maxDownloads
        });

      } catch (processError) {
        console.error('File processing error:', processError);
        res.status(500).json({ error: 'File processing failed', details: processError.message });
      }
    });

  } catch (error) {
    console.error('Matrix upload error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Matrix Download API Endpoint
app.get('/api/matrix-download', async (req, res) => {
  try {
    const { matrixId, fileId, password } = req.query;

    if (!matrixId) {
      return res.status(400).json({ error: 'Matrix ID is required' });
    }

    // Get metadata
    const metadata = await getMetadata(matrixId);
    if (!metadata) {
      return res.status(404).json({
        error: 'File not found or expired',
        message: 'This Matrix share doesn\'t exist or has been deleted.'
      });
    }

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(metadata.expiresAt);
    if (now > expiresAt) {
      // Clean up expired files
      await cleanupExpiredFile(matrixId, metadata);
      return res.status(410).json({
        error: 'Files have expired and been deleted',
        message: 'This Matrix share has expired and all files have been permanently deleted.'
      });
    }

    // Check password
    if (metadata.password && !validatePassword(password, metadata.password)) {
      return res.status(401).json({
        error: 'Password required',
        passwordRequired: true,
        message: 'This Matrix share is password protected. Enter the password to access files.',
        requiresPassword: true
      });
    }

    // Check download limits
    if (metadata.downloadCount >= metadata.maxDownloads) {
      return res.status(429).json({
        error: 'Download limit exceeded',
        message: `This Matrix share has reached its download limit of ${metadata.maxDownloads} downloads.`
      });
    }

    // If requesting a specific file
    if (fileId) {
      const file = metadata.files.find(f => f.id === fileId);
      if (!file) {
        return res.status(404).json({
          error: 'File not found',
          message: 'The requested file is not part of this Matrix share.'
        });
      }

      try {
        const fileData = await fs.readFile(file.path);

        // Update download count for individual file download
        metadata.downloadCount += 1;
        await updateMetadata(matrixId, metadata);

        // Set headers for file download
        res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Length', file.size.toString());
        res.setHeader('X-Matrix-Download-Count', metadata.downloadCount.toString());
        res.setHeader('X-Matrix-Expires-At', metadata.expiresAt);
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

        return res.status(200).send(fileData);

      } catch (fileError) {
        console.error('File read error:', fileError);
        return res.status(500).json({
          error: 'Failed to read file',
          message: 'The file exists but couldn\'t be read. It may be corrupted.'
        });
      }
    }

    // If single file and no specific fileId requested, serve it directly
    if (metadata.files.length === 1) {
      const file = metadata.files[0];

      try {
        const fileData = await fs.readFile(file.path);

        // Update download count
        metadata.downloadCount += 1;
        await updateMetadata(matrixId, metadata);

        // Set headers for file download
        res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Length', file.size.toString());
        res.setHeader('X-Matrix-Download-Count', metadata.downloadCount.toString());
        res.setHeader('X-Matrix-Expires-At', metadata.expiresAt);
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

        return res.status(200).send(fileData);

      } catch (fileError) {
        console.error('File read error:', fileError);
        return res.status(500).json({
          error: 'Failed to read file',
          message: 'The file exists but couldn\'t be read. It may be corrupted.'
        });
      }
    }

    // Multiple files - return file list for frontend to handle
    const fileList = metadata.files.map(file => ({
      id: file.id,
      name: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      downloadUrl: `/api/matrix-download?matrixId=${matrixId}&fileId=${file.id}`
    }));

    // Update download count for file list access
    metadata.downloadCount += 1;
    await updateMetadata(matrixId, metadata);

    // Calculate time remaining
    const timeRemaining = Math.max(0, expiresAt.getTime() - now.getTime());
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    return res.status(200).json({
      success: true,
      files: fileList,
      downloadCount: metadata.downloadCount,
      maxDownloads: metadata.maxDownloads,
      expiresAt: metadata.expiresAt,
      totalFiles: metadata.files.length,
      totalSize: metadata.files.reduce((sum, file) => sum + file.size, 0),
      timeRemaining: {
        hours: hoursRemaining,
        minutes: minutesRemaining,
        total: timeRemaining
      },
      userType: metadata.userType || 'free',
      createdAt: metadata.createdAt
    });

  } catch (error) {
    console.error('Matrix download error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      message: 'Something went wrong on our end. Please try again later.'
    });
  }
});

// Matrix Download POST Endpoint (for password submission)
app.post('/api/matrix-download', async (req, res) => {
  try {
    const { matrixId, fileId } = req.query;
    const { password } = req.body;

    if (!matrixId) {
      return res.status(400).json({ error: 'Matrix ID is required' });
    }

    // Get metadata
    const metadata = await getMetadata(matrixId);
    if (!metadata) {
      return res.status(404).json({
        error: 'File not found or expired',
        message: 'This Matrix share doesn\'t exist or has been deleted.'
      });
    }

    // Check expiration
    const now = new Date();
    const expiresAt = new Date(metadata.expiresAt);
    if (now > expiresAt) {
      // Clean up expired files
      await cleanupExpiredFile(matrixId, metadata);
      return res.status(410).json({
        error: 'Files have expired and been deleted',
        message: 'This Matrix share has expired and all files have been permanently deleted.'
      });
    }

    // Validate password
    if (!validatePassword(password, metadata.password)) {
      return res.status(401).json({
        error: 'Invalid password',
        passwordRequired: true,
        message: 'The password you entered is incorrect. Try again, fam!'
      });
    }

    // Password is correct, proceed with download logic (same as GET)
    // Redirect to GET handler with password in query
    req.query.password = password;
    return app._router.handle({ ...req, method: 'GET' }, res, () => {});

  } catch (error) {
    console.error('Matrix download POST error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      message: 'Something went wrong on our end. Please try again later.'
    });
  }
});

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
    console.log(`Matrix upload endpoint available at http://localhost:${PORT}/api/matrix-upload`);
    console.log(`Matrix download endpoint available at http://localhost:${PORT}/api/matrix-download`);
}); 