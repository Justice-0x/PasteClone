const formidable = require('formidable');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

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
  // const authToken = req.headers.authorization;
  // if (authToken) {
  //   // Verify token and check user subscription status
  //   return 'paid'; // or 'free' based on subscription
  // }
  return 'free';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}
