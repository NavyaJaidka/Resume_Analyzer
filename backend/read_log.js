const fs = require('fs');
let content;
try {
  content = fs.readFileSync('debug_error.log', 'utf16le');
} catch(e) {
  content = fs.readFileSync('debug_error.log', 'utf8');
}
console.log(content.slice(-2000));
