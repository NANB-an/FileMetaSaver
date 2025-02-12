const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');

const app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure 'uploads' directory exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/fileanalyse', upload.single('upfile'), (req, res, next) => {
  console.log("req.file:", req.file); // *** CRITICAL LOG ***

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileInfo = {
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
  };

  console.log("fileInfo:", fileInfo); // *** CRITICAL LOG ***

  res.json(fileInfo);
}, (err, req, res, next) => { // Multer and general error handling
  if (err instanceof multer.MulterError) {
    console.error("Multer Error:", err);
    res.status(400).json({ error: 'Multer error: ' + err.message });
  } else if (err) {
    console.error("Other Error:", err);
    res.status(500).json({ error: 'An error occurred', details: err.message || err });
  } else {
    next(); // Ensure next() is called if no error
  }
});

app.use((err, req, res, next) => { // Final error handler
  console.error("Final Error Handler:", err.stack);
  res.status(500).json({ error: 'A server error occurred', details: err.message || err });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server listening on port ' + port);
});