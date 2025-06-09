const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const crypto = require('crypto');
require('dotenv').config();

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
});

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const fileId = crypto.randomBytes(16).toString('hex');
  const key = `${fileId}-${req.file.originalname}`;

  const params = {
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: key,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    ACL: 'private', // keep files private
  };

  try {
    await s3.putObject(params).promise();
    // Save metadata to your database if needed
    res.json({ fileId, key, message: 'File uploaded successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Download route (presigned URL)
router.get('/download/:key', async (req, res) => {
  const params = {
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: req.params.key,
    Expires: 60 * 10, // 10 minutes
  };
  try {
    const url = s3.getSignedUrl('getObject', params);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: 'Could not generate download link' });
  }
});

module.exports = router; 