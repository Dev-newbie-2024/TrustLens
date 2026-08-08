require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const axios = require('axios');
const path = require('path');

const User = require('./models/User');
const Document = require('./models/Document');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/trustlens';
mongoose.connect(MONGO_URI)
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error', err));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir) },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname) }
});
const upload = multer({ storage: storage });

app.get('/', (req,res) => res.send('TrustLens backend running'));

app.post('/api/users/register', async (req,res) => {
  try {
    const u = new User(req.body);
    await u.save();
    res.json(u);
  } catch(e){ res.status(500).json({error: e.message}); }
});

app.post('/api/analyze', upload.single('file'), async (req,res) => {
  try {
    let text = req.body.text || '';
    if (req.file) {
      const mime = req.file.mimetype || '';
      const filePath = req.file.path;
      if (mime === 'application/pdf' || filePath.toLowerCase().endsWith('.pdf')) {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        text = text + '\n' + data.text;
      } else {
        const { data: { text: ocrText } } = await Tesseract.recognize(filePath, 'eng', { logger: m => {} });
        text = text + '\n' + ocrText;
      }
      try { fs.unlinkSync(filePath); } catch(e){}
    }
    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: 'No valid text found. Please upload a file or paste text.' });
    }

    const hfKey = process.env.HF_API_KEY;
    let summary = '';
    if (hfKey) {
      try {
        const response = await axios.post(
          'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
          { inputs: text.slice(0, 15000) },
          { headers: { Authorization: `Bearer ${hfKey}`,'Content-Type':'application/json' }, timeout: 120000 }
        );
        if (Array.isArray(response.data)) summary = response.data[0].summary_text || '';
        else if (response.data.summary_text) summary = response.data.summary_text;
        else summary = (typeof response.data === 'string') ? response.data : '';
      } catch(err) {
        console.error('HF API error', err.message || err);
        summary = text.trim().slice(0,500) + (text.length>500 ? '...' : '');
      }
    } else {
      summary = text.trim().slice(0,500) + (text.length>500 ? '...' : '');
    }

    const lowered = text.toLowerCase();
    let score = 100;
    const riskyKeywords = ['sell','share','third party','third-party','auto-renew','auto renew','renewal','subscribe','tracking','tracking cookie','collect','data sharing','ownership','monitor','surveillance'];
    let found = [];
    riskyKeywords.forEach(k => { if (lowered.includes(k)) { found.push(k); score -= 8; } });
    if (score < 0) score = 0;
    let riskLevel = score > 70 ? 'Safe' : score > 40 ? 'Caution' : 'Risky';

    const doc = new Document({
      userId: req.body.userId || 'demo-user',
      fileName: req.file ? req.file.originalname : (req.body.fileName || 'pasted_text'),
      summary,
      trustScore: score,
      detected: found
    });
    await doc.save();
    res.json({ summary, trustScore: score, riskLevel, detected: found, docId: doc._id });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/docs/:userId', async (req,res) => {
  try {
    const docs = await Document.find({ userId: req.params.userId }).sort({ uploadDate: -1 }).limit(50);
    res.json(docs);
  } catch(e){ res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 5000;
app.get("/testdb", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.json({ message: "MongoDB Connected ✅", collections });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.listen(PORT, ()=> console.log('Server listening on', PORT));
