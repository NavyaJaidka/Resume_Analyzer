const fs = require('fs');
let content = fs.readFileSync('debug_all.log', 'utf16le');
if (content.indexOf('Error') === -1) {
  content = fs.readFileSync('debug_all.log', 'utf8');
}
const lines = content.split('\n');
const errorLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].toLowerCase().includes('error') || lines[i].toLowerCase().includes('typeerror') || lines[i].toLowerCase().includes('failed')) {
    errorLines.push(lines.slice(Math.max(0, i - 2), i + 8).join('\n'));
    i += 8;
  }
}
console.log(errorLines.join('\n\n====================\n\n').slice(-3000));
