import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, 'dist')));

/*
 ❌ REMOVED:
 /api/config
 Never send API keys to frontend
*/

// Example secure API endpoint
app.post('/api/gemini', async (req, res) => {
  try {
    // Here you call Gemini using process.env.GEMINI_API_KEY
    // Frontend NEVER sees the key
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Gemini error' });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn("CRITICAL: GEMINI_API_KEY not set!");
  }
});
