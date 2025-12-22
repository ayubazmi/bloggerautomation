
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'dist')));

// Endpoint for frontend to retrieve config/api key
app.get('/api/config', (req, res) => {
  res.json({
    apiKey: process.env.API_KEY || ''
  });
});

// SPA routing fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!process.env.API_KEY) {
    console.warn("CRITICAL: API_KEY environment variable is not set!");
  }
});
