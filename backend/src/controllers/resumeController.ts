import { Request, Response } from 'express';
import * as resumeService from '../services/resumeService';

export const uploadResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const resumeData = await resumeService.parseResume(req.file);
    const savedResume = await resumeService.saveResume(resumeData);
    res.status(201).json(savedResume);
  } catch (error: any) {
    console.error('Error uploading resume:', error);
    
    // Handle file type validation errors
    if (error.message && error.message.includes('Only PDF and DOCX files are allowed')) {
      return res.status(400).json({ error: 'Only PDF and DOCX files are allowed' });
    }
    
    // Handle file size errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File must be under 10MB' });
    }
    
    res.status(500).json({ error: 'Failed to upload and parse resume' });
  }
};

export const analyzeResume = async (req: Request, res: Response) => {
  try {
    const { resumeId, jobDescription } = req.body;
    if (typeof resumeId !== 'string' || typeof jobDescription !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid resumeId or jobDescription' });
    }
    const result = await resumeService.analyzeResume(resumeId, jobDescription);
    res.json(result);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
};

export const getResume = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid resume ID' });
    }
    const resume = await resumeService.getResumeById(id);
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    console.error('Error getting resume:', error);
    res.status(500).json({ error: 'Failed to get resume' });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const history = await resumeService.getHistoryByUserId(userId);
    res.json(history);
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
};

export const downloadResume = async (req: Request, res: Response) => {
  try {
    const { resumeId } = req.body;
    if (typeof resumeId !== 'string') {
      return res.status(400).json({ error: 'Invalid resume ID' });
    }
    const pdfBuffer = await resumeService.generateOptimizedResume(resumeId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=optimized_resume_${resumeId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ error: 'Failed to generate and download resume' });
  }
};
