const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const { executeQuery } = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;


app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '20mb' }));

const upload = multer({ 
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'));
  }
});

function getSharpGravity(position) {
  const gravityMap = {
    'top-left': 'northwest',
    'top-right': 'northeast', 
    'bottom-left': 'southwest',
    'bottom-right': 'southeast',
    'center': 'center'
  };
  return gravityMap[position] || 'southeast';
}

// Get default config
app.get('/api/config', async (req, res) => {
  const result = await executeQuery('SELECT * FROM cropping_configs ORDER BY created_at DESC LIMIT 1');
  if (result.rows.length > 0) {
    res.json(result.rows[0]);
  } else {
    res.json({ 
      logo_position: 'bottom-right', 
      scale_down: 0.25,
      logo_image: null 
    });
  }
});

// Get all configs
app.get('/api/configs', async (req, res) => {
  const result = await executeQuery('SELECT * FROM cropping_configs ORDER BY created_at DESC');
  res.json(result.rows);
});

// Get specific config by ID
app.get('/api/config/:id', async (req, res) => {
  const configId = req.params.id;
  const result = await executeQuery('SELECT * FROM cropping_configs WHERE id = $1', [configId]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Configuration not found' });
  }
  
  res.json(result.rows[0]);
});

// Create/Update config
app.post('/api/config', async (req, res) => {
  const { id, logo_position, scale_down, logo_image } = req.body;
  
  if (!logo_position || !scale_down) {
    return res.status(400).json({ error: 'Missing required fields: logo_position and scale_down' });
  }

  let query, params, result;

  if (id) {
    query = `
      UPDATE cropping_configs 
      SET logo_position = $2, scale_down = $3, logo_image = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    params = [id, logo_position, scale_down, logo_image];
  } else {
    const countResult = await executeQuery('SELECT COUNT(*) FROM cropping_configs');
    const currentCount = parseInt(countResult.rows[0].count);
    
    if (currentCount >= 3) {
      return res.status(400).json({ 
        error: 'Maximum 3 configurations allowed. Delete an existing configuration first.' 
      });
    }

    query = `
      INSERT INTO cropping_configs (logo_position, scale_down, logo_image) 
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    params = [logo_position, scale_down, logo_image];
  }
  
  result = await executeQuery(query, params);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Configuration not found for update' });
  }
  
  res.json(result.rows[0]);
});

// Delete config
app.delete('/api/config/:id', async (req, res) => {
  const configId = req.params.id;
  
  const countResult = await executeQuery('SELECT COUNT(*) FROM cropping_configs');
  if (parseInt(countResult.rows[0].count) <= 1) {
    return res.status(400).json({ error: 'Cannot delete the last configuration' });
  }
  
  const result = await executeQuery('DELETE FROM cropping_configs WHERE id = $1 RETURNING *', [configId]);
  
  res.json({ 
    deletedConfig: result.rows[0]
  });
});

app.post('/api/crop', upload.single('image'), async (req, res) => {
  const { x, y, width, height, configId } = req.body;
  
  let image = sharp(req.file.buffer).extract({
    left: parseInt(x),
    top: parseInt(y), 
    width: parseInt(width),
    height: parseInt(height)
  });

  if (configId && configId !== 'null' && configId !== null && configId !== undefined) {
    try {
      const configResult = await executeQuery('SELECT * FROM cropping_configs WHERE id = $1', [configId]);
      
      if (configResult.rows.length > 0) {
        const config = configResult.rows[0];
        
        if (config.logo_image) {
          let logoBase64 = config.logo_image;
          if (logoBase64.includes(',')) {
            logoBase64 = logoBase64.split(',')[1];
          }
          
          const logoBuffer = Buffer.from(logoBase64, 'base64');
          
          const metadata = await image.metadata();
          const logoSize = Math.round(Math.min(metadata.width, metadata.height) * config.scale_down);
          
          const resizedLogo = await sharp(logoBuffer).resize(logoSize, logoSize, { fit: 'inside' }).toBuffer();
          
          image = image.composite([{
            input: resizedLogo,
            gravity: getSharpGravity(config.logo_position)
          }]);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  const result = await image.jpeg({ quality: 90 }).toBuffer();
  res.set('Content-Type', 'image/jpeg');
  res.send(result);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
