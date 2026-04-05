const fs = require('fs');
const path = require('path');

const apiBaseUrl = (process.env.API_BASE_URL || '').trim();

if (!apiBaseUrl) {
  console.error('API_BASE_URL is required. Example: API_BASE_URL=https://api.example.com');
  process.exit(1);
}

const sanitizedApiBaseUrl = apiBaseUrl.replace(/\/+$/, '').replace(/'/g, "\\'");

const output = `window.__env = window.__env || {};
window.__env.API_BASE_URL = '${sanitizedApiBaseUrl}';
`;

const envFilePath = path.join(__dirname, '..', 'public', 'env.js');
fs.writeFileSync(envFilePath, output, 'utf8');

console.log(`Updated public/env.js with API_BASE_URL=${sanitizedApiBaseUrl}`);
