const express = require('express');
const ConfigController = require('../controllers/config.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Configuration
 *   description: Logo configuration management endpoints
 */

/**
 * @swagger
 * /api/configs:
 *   get:
 *     summary: Get all logo configurations
 *     tags: [Configuration]
 *     responses:
 *       200:
 *         description: Configurations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CropConfig'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/configs', ConfigController.getAll);

/**
 * @swagger
 * /api/configs:
 *   post:
 *     summary: Create a new logo configuration
 *     tags: [Configuration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - logo_position
 *               - logo_scale
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My Custom Logo"
 *               logo_position:
 *                 type: string
 *                 enum: [top-left, top-right, bottom-left, bottom-right, center]
 *                 example: "bottom-right"
 *               logo_scale:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 0.25
 *                 example: 0.15
 *               logo_image:
 *                 type: string
 *                 description: "Base64 encoded logo image (optional)"
 *     responses:
 *       201:
 *         description: Configuration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CropConfig'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/configs', ConfigController.create);

/**
 * @swagger
 * /api/configs/{id}:
 *   put:
 *     summary: Update an existing configuration
 *     tags: [Configuration]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Configuration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Logo Config"
 *               logo_position:
 *                 type: string
 *                 enum: [top-left, top-right, bottom-left, bottom-right, center]
 *                 example: "top-left"
 *               logo_scale:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 0.25
 *                 example: 0.20
 *               logo_image:
 *                 type: string
 *                 description: "Base64 encoded logo image (optional)"
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CropConfig'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Configuration not found
 *       500:
 *         description: Server error
 */
router.put('/configs/:id', ConfigController.update);

/**
 * @swagger
 * /api/configs/{id}:
 *   delete:
 *     summary: Delete a configuration
 *     tags: [Configuration]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Configuration ID
 *     responses:
 *       200:
 *         description: Configuration deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Configuration deleted successfully"
 *       404:
 *         description: Configuration not found
 *       500:
 *         description: Server error
 */
router.delete('/configs/:id', ConfigController.delete);

module.exports = router;