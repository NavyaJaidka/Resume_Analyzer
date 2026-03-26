const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function run() {
  try {
    // Valid PDF minimum structure
    const pdfBase64 = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTA2MFMyAhC6EBUiYmwBRkHwm1gZKAQEbCwOQUGBkZAAyDKxB7EoFVyAgsSg1MDFXwb2kWB+kBgC4bBSYvZW5kc3RyZWFtCmVuZG9iagoKMyAwIG9iago0NwonZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvUGFnZS9NZWRpYUJveFswIDAgNTk1LjI4IDg0MS44OV0vUmVzb3VyY2VzPDwvRm9udDw8L0YxIDUgMCBSPj4+Pi9Db250ZW50cyAyIDAgUi9QYXJlbnQgNiAwIFI+PgplbmRvYmoKCjUgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCgo2IDAgb2JqCjw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzWzQgMCBSXT4+CmVuZG9iagoKNyAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgNiAwIFI+PgplbmRvYmoKCjggMCBvYmoKPDwvUHJvZHVjZXIoanNQREYgMS4wLjI3Mi1zbmFwc2hvdCkvQ3JlYXRpb25EYXRlKEQ6MjAxNjAyMjYxNDMwMDRaKT4+CmVuZG9iagoKeHJlZgowIDkKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMjM5IDAwMDAwIG4gCjAwMDAwMDAwMTcgMDAwMDAgbiAKMDAwMDAwMDE2MyAwMDAwMCBuIAowMDAwMDAwMTgyIDAwMDAwIG4gCjAwMDAwMDAzMTQgMDAwMDAgbiAKMDAwMDAwMDQwMiAwMDAwMCBuIAowMDAwMDAwNDU5IDAwMDAwIG4gCjAwMDAwMDA1MDggMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDkvUm9vdCA3IDAgUi9JbmZvIDggMCBSPj4Kc3RhcnR4cmVmCjYxMQolJUVPRgo=";
    const buffer = Buffer.from(pdfBase64, 'base64');
    const data = new Uint8Array(buffer);
    const pdfDocument = await pdfjsLib.getDocument({ data }).promise;
    console.log("Pages:", pdfDocument.numPages);
    let text = '';
    for (let i = 1; i <= pdfDocument.numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map((item) => item.str).join(' ') + '\n';
    }
    console.log("Text:", text);
  } catch(e) {
    console.error("PDF PARSING ERROR:", e.message, e.stack);
  }
}
run();
