/**
 * Dev proxy server for the Mii Designer.
 * - Serves static files from the project root
 * - Proxies /api/generate-face to the Gemini API with the key injected server-side
 * - GET /health returns 200 OK for proxy detection
 *
 * Usage: node dev-server.js
 * Requires: .env file at project root with GEMINI_API_KEY
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { request as httpsRequest } from 'node:https';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../..');

// Load .env from project root
config({ path: join(PROJECT_ROOT, '.env') });

const PORT = 3001;
const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent';

if (!API_KEY) {
  console.error('\n❌ GEMINI_API_KEY not found in .env file.');
  console.error('   Create a .env file at the project root with:');
  console.error('   GEMINI_API_KEY=your_key_here\n');
  process.exit(1);
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

async function serveStaticFile(res, urlPath) {
  // Map /  to the mii-designer index
  if (urlPath === '/') urlPath = '/apps/mii-designer/index.html';

  const filePath = join(PROJECT_ROOT, urlPath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PROJECT_ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = await readFile(filePath);

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

function handleGenerateFace(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let prompt;
    try {
      const parsed = JSON.parse(body);
      prompt = parsed.prompt;
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON body' }));
      return;
    }

    if (!prompt) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing prompt field' }));
      return;
    }

    const requestBody = JSON.stringify({
      contents: [{
        parts: [{ text: prompt }],
      }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const apiUrl = new URL(`${GEMINI_URL}?key=${API_KEY}`);

    const apiReq = httpsRequest({
      hostname: apiUrl.hostname,
      path: apiUrl.pathname + apiUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    }, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => { data += chunk; });
      apiRes.on('end', () => {
        try {
          const result = JSON.parse(data);

          if (apiRes.statusCode !== 200) {
            console.error('Gemini API error:', apiRes.statusCode, data);
            res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Gemini API error: ${apiRes.statusCode}` }));
            return;
          }

          // Extract the image from the response
          const parts = result.candidates?.[0]?.content?.parts || [];
          const imagePart = parts.find(p => p.inlineData);

          if (!imagePart) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No image in API response' }));
            return;
          }

          const mimeType = imagePart.inlineData.mimeType || 'image/png';
          const base64Data = imagePart.inlineData.data;
          const imageDataUrl = `data:${mimeType};base64,${base64Data}`;

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ imageDataUrl }));
        } catch (err) {
          console.error('Failed to parse Gemini response:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Failed to parse API response' }));
        }
      });
    });

    apiReq.on('error', (err) => {
      console.error('Gemini API request failed:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Network error: ${err.message}` }));
    });

    apiReq.write(requestBody);
    apiReq.end();
  });
}

const server = createServer(async (req, res) => {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health check
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  // Face generation proxy
  if (url.pathname === '/api/generate-face' && req.method === 'POST') {
    handleGenerateFace(req, res);
    return;
  }

  // Static files
  await serveStaticFile(res, url.pathname);
});

server.listen(PORT, () => {
  console.log(`\n🎨 Mii Designer dev server running at http://localhost:${PORT}`);
  console.log('   Press Ctrl+C to stop\n');
});
