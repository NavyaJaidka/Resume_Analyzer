const http = require('http');
const fs = require('fs');
const path = require('path');

const uploadFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const filename = path.basename(filePath);
    const fileContent = fs.readFileSync(filePath);

    let body = `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="resume"; filename="${filename}"\r\n`;
    body += `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n`;
    
    const footer = `\r\n--${boundary}--\r\n`;
    const totalLength = body.length + fileContent.length + footer.length;

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/resumes/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': totalLength
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse upload response: ' + data));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.write(fileContent);
    req.write(footer);
    req.end();
  });
};

const analyzeResume = (resumeId, jd) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ resumeId, jobDescription: jd });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/resumes/analyze',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse analysis response: ' + data));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

async function runTest() {
  try {
    console.log('--- Starting Full Flow Test ---');
    const resumePath = path.join(__dirname, 'node_modules/mammoth/test/test-data/simple-list.docx');
    console.log('Uploading resume:', resumePath);
    const uploadRes = await uploadFile(resumePath);
    console.log('Upload Successful. ID:', uploadRes.id);

    console.log('Analyzing resume...');
    const analyzeRes = await analyzeResume(uploadRes.id, 'Software Engineer React Node.js');
    console.log('Analysis Result:', JSON.stringify(analyzeRes, null, 2));

    if (analyzeRes.overallScore > 0) {
      console.log('--- TEST PASSED ---');
    } else {
      console.log('--- TEST FAILED (Score 0) ---');
    }
  } catch (err) {
    console.error('Test Failed:', err.message);
  }
}

runTest();
