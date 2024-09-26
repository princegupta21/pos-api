const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const Product = require('../model/product');

const router = express.Router();


// AWS S3 Configuration
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Function to calculate MD5 hash of the image buffer
const calculateImageHash = (buffer) => {
    return crypto.createHash('md5').update(buffer).digest('hex');
  };

// Upload file
router.post('/', upload.single('file'), async (req, res) => {
    const file = req.file;
    try {
        let imageUrl = '';
        // Upload image to AWS S3
        const fileHash = calculateImageHash(file.buffer);
        if (file) {
             // Check in the database if the hash already exists
            const existingProduct = await Product.findOne({ imageHash: fileHash });
            if (existingProduct) {
                return res.status(200).json({imageUrl: existingProduct.imageUrl, imageHash: fileHash}); // Return the existing image URL
            }
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `uploads/${Date.now()}-${file.originalname}`, // File name you want to save as in S3
                Body: file.buffer,
                ContentType: file.mimetype,
            };

            const data = await s3.upload(params).promise();
            imageUrl = data.Location; // S3 URL of the uploaded image
        }
        res.status(201).json({imageUrl: imageUrl, imageHash: fileHash})

    } catch(error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload image and save product' });
    }
})

module.exports = router;