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

// DEFAULT CONFIG
const defaultConfig = {
  scaleDown: 0.25,
  logoPosition: 'southeast',
  logoImage: null
};


// --- TODO / Config Endpoints ---

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});