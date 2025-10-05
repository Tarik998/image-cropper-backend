const express = require('express');
const multer = require('multer');
const ImageController = require('../controllers/image.controller');

const router = express.Router();

// Configure multer for file upload
const upload = multer({ 
  limits: { fileSize: 10 * 1024 * 1024 }
});

/**
 * @swagger
 * tags:
 *   name: Image Processing
 *   description: Image cropping and logo overlay operations
 */

/**
 * @swagger
 * /api/image/process:
 *   post:
 *     summary: Unified image processing endpoint (preview and high-quality generation)
 *     tags: [Image Processing]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - x
 *               - y
 *               - width
 *               - height
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image file to process (PNG, JPEG, WebP)
 *               x:
 *                 type: integer
 *                 description: X coordinate for crop area
 *                 example: 0
 *               y:
 *                 type: integer
 *                 description: Y coordinate for crop area
 *                 example: 0
 *               width:
 *                 type: integer
 *                 description: Width of crop area
 *                 example: 800
 *               height:
 *                 type: integer
 *                 description: Height of crop area
 *                 example: 600
 *               configId:
 *                 type: integer
 *                 description: Optional configuration ID for logo overlay
 *                 example: 1
 *               quality:
 *                 type: string
 *                 enum: [preview, high]
 *                 description: Output quality - 'preview' for scaled-down JPEG, 'high' for full-quality PNG
 *                 example: preview
 *                 default: preview
 *     responses:
 *       200:
 *         description: Image processed successfully
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *               description: Preview quality image (quality=preview)
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *               description: High quality image (quality=high)
 *       400:
 *         description: Invalid input parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Invalid crop parameters: x, y, width, height are required"
 *       413:
 *         description: File too large (max 10MB)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "File too large. Maximum size is 10MB"
 *       500:
 *         description: Image processing failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Image processing failed: Unsupported image format"
 */
router.post('/image/process', upload.single('image'), ImageController.processImage);

module.exports = router;