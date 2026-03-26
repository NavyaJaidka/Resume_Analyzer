const fs = require('fs');
const path = require('path');
const http = require('http');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const filePath = path.join(__dirname, 'dummy.txt');
fs.writeFileSync(filePath, 'Hello dummy content');
const fileBuffer = fs.readFileSync(filePath);

const head = `--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="dummy.txt"\r\nContent-Type: text/plain\r\n\r\n`;
const tail = `\r\n--${boundary}--\r\n`;

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/resumes/upload',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(head) + fileBuffer.length + Buffer.byteLength(tail)
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(`BODY: ${data}`));
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(head);
req.write(fileBuffer);
req.write(tail);
req.end();
