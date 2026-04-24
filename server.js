const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'text/javascript',
  '.jsx':  'text/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

const pages = {
  '/':          'index.html',
  '/home':      'Home.html',
  '/ads':       'Water Leads Ads.html',
  '/booking':   'Water Leads Booking.html',
  '/sales':     'Water Sales.html',
  '/websites':  'Water Websites.html',
  '/v1':        'index v1.html',
};

const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/' : req.url.replace(/\/$/, '');
  const filePath = pages[url]
    ? path.join(__dirname, pages[url])
    : path.join(__dirname, decodeURIComponent(url));

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (url === '/') {
        // Serve a simple nav page
        const links = Object.entries(pages)
          .map(([route, file]) => `<li><a href="${route}">${file}</a></li>`)
          .join('\n');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html><html><head><title>Treat Engine – Local Dev</title>
          <style>body{font-family:sans-serif;max-width:600px;margin:60px auto;padding:0 20px}
          h1{color:#1a1a2e}ul{line-height:2.2}a{color:#4f46e5;text-decoration:none}
          a:hover{text-decoration:underline}</style></head>
          <body><h1>Treat Engine – Local Pages</h1><ul>${links}</ul></body></html>`);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Treat Engine running at http://localhost:${PORT}`);
  console.log('');
  console.log('Pages:');
  Object.entries(pages).forEach(([route, file]) =>
    console.log(`  http://localhost:${PORT}${route.padEnd(12)} → ${file}`)
  );
});
