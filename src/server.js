const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sharp = require('sharp');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

const dbFile = './imagecropper.db';
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scaleDown REAL DEFAULT 0.25,
    logoPosition TEXT DEFAULT 'southeast',
    logoImage TEXT
  )`);
});

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// --- Config Endpoints ---

app.post('/api/config', (req, res) => {
  let { scaleDown, logoPosition, logoImage } = req.body;
  scaleDown = (typeof scaleDown === 'number' && !isNaN(scaleDown)) ? Math.min(scaleDown, 0.25) : 0.25;
  logoPosition = logoPosition || 'southeast';
  logoImage = logoImage || null;
  db.run(
    `INSERT INTO config (scaleDown, logoPosition, logoImage) VALUES (?, ?, ?)`,
    [scaleDown, logoPosition, logoImage],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(`SELECT * FROM config WHERE id=?`, [this.lastID], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      });
    }
  );
});

app.put('/api/config/:id', (req, res) => {
  let { scaleDown, logoPosition, logoImage } = req.body;
  scaleDown = (typeof scaleDown === 'number' && !isNaN(scaleDown)) ? Math.min(scaleDown, 0.25) : 0.25;
  logoPosition = logoPosition || 'southeast';
  logoImage = logoImage || null;
  db.run(
    `UPDATE config SET scaleDown=?, logoPosition=?, logoImage=? WHERE id=?`,
    [scaleDown, logoPosition, logoImage, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(`SELECT * FROM config WHERE id=?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      });
    }
  );
});

app.get('/api/config/:id', (req, res) => {
  db.get(`SELECT * FROM config WHERE id=?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Config not found' });
    res.json(row);
  });
});

app.get('/api/config', (req, res) => {
  db.all(`SELECT * FROM config`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// --- Image Endpoints ---

function getConfigFromDb(configId, cb) {
  if (configId) {
    db.get(`SELECT * FROM config WHERE id=?`, [configId], (err, row) => {
      if (err || !row) cb(null); else cb(row);
    });
  } else {
    cb(null);
  }
}

// --- DEFAULT CONFIG ---
const defaultConfig = {
  scaleDown: 0.25,
  logoPosition: 'southeast',
  logoImage: null
};


app.post('/api/image/preview', upload.single('image'), (req, res) => {
  const { x, y, width, height } = req.body;

  if (!req.file) return res.status(400).json({ error: 'No image file provided' });
  sharp(req.file.buffer)
    .extract({
      left: parseInt(x), top: parseInt(y),
      width: parseInt(width), height: parseInt(height)
    })
    .png()
    .toBuffer()
    .then(buffer => {
      res.set('Content-Type', 'image/png');
      res.send(buffer);
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
});

app.post('/api/image/generate', upload.single('image'), (req, res) => {
  const { x, y, width, height, configId } = req.body;
  getConfigFromDb(configId, async (conf) => {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const useConf = conf || defaultConfig;
    try {
      let processedImage = sharp(req.file.buffer)
        .extract({
          left: parseInt(x), top: parseInt(y),
          width: parseInt(width), height: parseInt(height)
        });

      if (useConf.logoImage) {
        const logoBase64 = useConf.logoImage.split(',')[1];
        const logoBuffer = Buffer.from(logoBase64, 'base64');
        
        const mainWidth = parseInt(width);
        const mainHeight = parseInt(height);
        const logoTargetWidth = Math.round(mainWidth * useConf.scaleDown);
        const logoTargetHeight = Math.round(mainHeight * useConf.scaleDown);

        const resizedLogoBuffer = await sharp(logoBuffer)
          .resize({ width: logoTargetWidth, height: logoTargetHeight, fit: 'inside' })
          .png()
          .toBuffer();

        processedImage = processedImage.composite([
          { 
            input: resizedLogoBuffer,
            gravity: useConf.logoPosition || 'southeast'
          }
        ]);
      }

      const finalImage = await processedImage.png().toBuffer();
      res.set('Content-Type', 'image/png');
      res.send(finalImage);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});