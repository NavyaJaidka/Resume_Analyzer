# ResumeIQ Backend

Node.js Express backend for ResumeIQ, a resume analyzer and ATS optimizer.

## Features
- **Resume Parsing**: Extracts text and structured data from PDF and DOCX files.
- **ATS Scoring Engine**: Calculates scores based on skills, experience, and formatting.
- **Analysis Suggestions**: Provides actionable feedback for resume improvement.
- **History Tracking**: Stores past analyses for future reference.
- **PDF Generation**: Generates optimized resume versions (PDF).

## Tech Stack
- **Node.js**: Runtime environment.
- **Express**: Web framework.
- **TypeScript**: Typed JavaScript for better developer experience.
- **Multer**: Middleware for handling file uploads.
- **pdf-parse**: PDF text extraction.
- **mammoth**: DOCX text extraction.
- **jspdf**: PDF generation.
- **pg**: PostgreSQL client.

## Setup

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**:
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   DATABASE_URL=postgres://your_user:your_password@localhost:5432/resumeiq
   ```

3. **Run the Server**:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/resumes/upload`: Upload a resume file (multipart/form-data).
- `POST /api/resumes/analyze`: Analyze a resume against a job description.
- `GET /api/resumes/:id`: Get resume details by ID.
- `GET /api/resumes/history/:userId`: Get analysis history for a user.
- `POST /api/resumes/download`: Download an optimized version of the resume.

## Verification
A test script is included to verify the full flow:
```bash
node test_full.js
```
