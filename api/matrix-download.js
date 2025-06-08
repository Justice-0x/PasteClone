const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'matrix');

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

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { matrixId, fileId } = req.query;

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

    // Handle password check for POST requests (password submission)
    if (req.method === 'POST') {
      const body = req.body;
      const password = body?.password;

      if (!validatePassword(password, metadata.password)) {
        return res.status(401).json({
          error: 'Invalid password',
          passwordRequired: true,
          message: 'The password you entered is incorrect. Try again, fam!'
        });
      }
    }

    // Check password for GET requests
    if (req.method === 'GET' && metadata.password) {
      const { password } = req.query;
      if (!validatePassword(password, metadata.password)) {
        return res.status(401).json({
          error: 'Password required',
          passwordRequired: true,
          message: 'This Matrix share is password protected. Enter the password to access files.',
          requiresPassword: true
        });
      }
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
}
