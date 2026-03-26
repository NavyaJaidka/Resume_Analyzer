const fs = require('fs');
const path = require('path');

async function testFetch() {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const filePath = path.join(__dirname, 'dummy.txt');
  fs.writeFileSync(filePath, 'Hello dummy text content to parse');
  const fileBuffer = fs.readFileSync(filePath);

  const head = Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="resume"; filename="test.pdf"\r\nContent-Type: application/pdf\r\n\r\n`);
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`);

  const body = Buffer.concat([head, fileBuffer, tail]);

  try {
    const res = await fetch('http://localhost:5000/api/resumes/upload', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: body
    });

    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Body: ${text}`);
  } catch (err) {
    console.error(`Fetch failed: ${err.message}`);
  }
}
testFetch();
