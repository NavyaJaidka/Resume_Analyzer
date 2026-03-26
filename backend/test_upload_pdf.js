const fs = require('fs');
const path = require('path');
const http = require('http');

// A minimal valid PDF file base64 encoded
const pdfBase64 = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTA2MFMyAhC6EBUiYmwBRkHwm1gZKAQEbCwOQUGBkZAAyDKxB7EoFVyAgsSg1MDFXwb2kWB+kBgC4bBSYvZW5kc3RyZWFtCmVuZG9iagoKMyAwIG9iago0NwonZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvUGFnZS9NZWRpYUJveFswIDAgNTk1LjI4IDg0MS44OV0vUmVzb3VyY2VzPDwvRm9udDw8L0YxIDUgMCBSPj4+Pi9Db250ZW50cyAyIDAgUi9QYXJlbnQgNiAwIFI+PgplbmRvYmoKCjUgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCgo2IDAgb2JqCjw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzWzQgMCBSXT4+CmVuZG9iagoKNyAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgNiAwIFI+PgplbmRvYmoKCjggMCBvYmoKPDwvUHJvZHVjZXIoanNQREYgMS4wLjI3Mi1zbmFwc2hvdCkvQ3JlYXRpb25EYXRlKEQ6MjAxNjAyMjYxNDMwMDRaKT4+CmVuZG9iagoKeHJlZgowIDkKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMjM5IDAwMDAwIG4gCjAwMDAwMDAwMTcgMDAwMDAgbiAKMDAwMDAwMDE2MyAwMDAwMCBuIAowMDAwMDAwMTgyIDAwMDAwIG4gCjAwMDAwMDAzMTQgMDAwMDAgbiAKMDAwMDAwMDQwMiAwMDAwMCBuIAowMDAwMDAwNDU5IDAwMDAwIG4gCjAwMDAwMDA1MDggMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDkvUm9vdCA3IDAgUi9JbmZvIDggMCBSPj4Kc3RhcnR4cmVmCjYxMQolJUVPRgo=";

const fileBuffer = Buffer.from(pdfBase64, 'base64');
const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

const head = `--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="test.pdf"\r\nContent-Type: application/pdf\r\n\r\n`;
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
