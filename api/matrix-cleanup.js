const fs = require('fs').promises;
const path = require('path');

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'matrix');

async function getAllMetadataFiles() {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    return files.filter(file => file.endsWith('.json'));
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    return [];
  }
}

async function getMetadata(filename) {
  try {
    const metadataPath = path.join(UPLOADS_DIR, filename);
    const metadataContent = await fs.readFile(metadataPath, 'utf8');
    return JSON.parse(metadataContent);
  } catch (error) {
    console.error(`Error reading metadata file ${filename}:`, error);
    return null;
  }
}

async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
}

async function cleanupExpiredFiles() {
  const now = new Date();
  let cleanedCount = 0;
  let errorCount = 0;
  let totalSize = 0;

  console.log(`[Matrix Cleanup] Starting cleanup at ${now.toISOString()}`);

  try {
    const metadataFiles = await getAllMetadataFiles();
    console.log(`[Matrix Cleanup] Found ${metadataFiles.length} Matrix shares to check`);

    for (const metadataFile of metadataFiles) {
      const metadata = await getMetadata(metadataFile);

      if (!metadata) {
        console.warn(`[Matrix Cleanup] Skipping invalid metadata file: ${metadataFile}`);
        continue;
      }

      const expiresAt = new Date(metadata.expiresAt);

      if (now > expiresAt) {
        console.log(`[Matrix Cleanup] Cleaning expired share: ${metadata.id} (expired: ${expiresAt.toISOString()})`);

        let shareSize = 0;
        let filesDeleted = 0;
        let fileErrors = 0;

        // Delete all associated files
        for (const file of metadata.files || []) {
          if (file.path) {
            shareSize += file.size || 0;
            const deleted = await deleteFile(file.path);
            if (deleted) {
              filesDeleted++;
            } else {
              fileErrors++;
            }
          }
        }

        // Delete metadata file
        const metadataPath = path.join(UPLOADS_DIR, metadataFile);
        const metadataDeleted = await deleteFile(metadataPath);

        if (metadataDeleted) {
          cleanedCount++;
          totalSize += shareSize;
          console.log(`[Matrix Cleanup] ✅ Cleaned share ${metadata.id}: ${filesDeleted} files (${(shareSize / 1024 / 1024).toFixed(2)} MB)`);
        } else {
          errorCount++;
          console.error(`[Matrix Cleanup] ❌ Failed to delete metadata for share ${metadata.id}`);
        }

        if (fileErrors > 0) {
          console.warn(`[Matrix Cleanup] ⚠️ ${fileErrors} file deletion errors for share ${metadata.id}`);
        }
      }
    }

    const results = {
      timestamp: now.toISOString(),
      totalShares: metadataFiles.length,
      expiredShares: cleanedCount,
      errors: errorCount,
      totalSizeFreed: totalSize,
      totalSizeFreedMB: (totalSize / 1024 / 1024).toFixed(2)
    };

    console.log(`[Matrix Cleanup] Completed: ${cleanedCount} shares cleaned, ${(totalSize / 1024 / 1024).toFixed(2)} MB freed`);

    return results;

  } catch (error) {
    console.error('[Matrix Cleanup] Fatal error during cleanup:', error);
    return {
      timestamp: now.toISOString(),
      error: error.message,
      totalShares: 0,
      expiredShares: 0,
      errors: 1,
      totalSizeFreed: 0
    };
  }
}

// Manual cleanup function for immediate execution
async function forceCleanup() {
  console.log('[Matrix Cleanup] Force cleanup initiated');
  return await cleanupExpiredFiles();
}

// Clean up shares older than X days regardless of expiration (emergency cleanup)
async function emergencyCleanup(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  console.log(`[Matrix Cleanup] Emergency cleanup: removing shares older than ${daysOld} days (before ${cutoffDate.toISOString()})`);

  let cleanedCount = 0;
  let totalSize = 0;

  try {
    const metadataFiles = await getAllMetadataFiles();

    for (const metadataFile of metadataFiles) {
      const metadata = await getMetadata(metadataFile);

      if (!metadata) continue;

      const createdAt = new Date(metadata.createdAt);

      if (createdAt < cutoffDate) {
        let shareSize = 0;

        // Delete all associated files
        for (const file of metadata.files || []) {
          if (file.path) {
            shareSize += file.size || 0;
            await deleteFile(file.path);
          }
        }

        // Delete metadata file
        const metadataPath = path.join(UPLOADS_DIR, metadataFile);
        await deleteFile(metadataPath);

        cleanedCount++;
        totalSize += shareSize;
        console.log(`[Matrix Cleanup] Emergency cleaned old share: ${metadata.id}`);
      }
    }

    console.log(`[Matrix Cleanup] Emergency cleanup completed: ${cleanedCount} old shares removed`);

    return {
      timestamp: new Date().toISOString(),
      type: 'emergency',
      daysOld,
      totalShares: cleanedCount,
      totalSizeFreed: totalSize,
      totalSizeFreedMB: (totalSize / 1024 / 1024).toFixed(2)
    };

  } catch (error) {
    console.error('[Matrix Cleanup] Emergency cleanup error:', error);
    return { error: error.message };
  }
}

export default async function handler(req, res) {
  // Only allow GET requests for manual cleanup
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, days } = req.query;

    let results;

    if (action === 'emergency') {
      const daysOld = parseInt(days) || 30;
      results = await emergencyCleanup(daysOld);
    } else {
      // Default: normal cleanup
      results = await cleanupExpiredFiles();
    }

    res.status(200).json({
      success: true,
      action: action || 'normal',
      results
    });

  } catch (error) {
    console.error('Matrix cleanup API error:', error);
    res.status(500).json({
      error: 'Cleanup failed',
      details: error.message
    });
  }
}

// Export functions for use in other parts of the application
export { cleanupExpiredFiles, forceCleanup, emergencyCleanup };
