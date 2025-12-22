
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'dist' directory created by the build process
app.use(express.static(path.join(__dirname, 'dist')));

// Ensure that any request that doesn't match a static file is redirected to index.html
// This is critical for Single Page Applications (SPA) with client-side routing.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Production server running on port ${PORT}`);
  if (!process.env.API_KEY) {
    console.warn('Warning: API_KEY environment variable is not set!');
  }
});
