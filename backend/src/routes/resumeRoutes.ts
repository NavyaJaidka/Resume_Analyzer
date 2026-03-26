import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import * as resumeController from '../controllers/resumeController';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.docx'];
    
    const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const hasValidExtension = allowedExtensions.some(ext => file.originalname.toLowerCase().endsWith(ext));
    
    if (hasValidMimeType || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

router.post('/upload', upload.single('resume'), resumeController.uploadResume);

// Error handling middleware for multer
router.use((error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File must be under 10MB' });
    }
    return res.status(400).json({ error: error.message });
  } else if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
});
router.post('/analyze', resumeController.analyzeResume);
router.get('/:id', resumeController.getResume);
router.get('/history/:userId', resumeController.getHistory);
router.post('/download', resumeController.downloadResume);

export default router;
