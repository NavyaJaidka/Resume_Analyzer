# ResumeIQ Pro

An intelligent ATS (Applicant Tracking System) score analyzer that evaluates your resume against job descriptions in real-time.

## Features

- 📄 **Resume Upload**: Support for PDF and DOCX files (up to 10MB)
- 📊 **ATS Scoring**: Get an accurate score based on job description match
- 🔍 **Skills Analysis**: Identify matching and missing skills
- 📈 **Experience Matching**: Compare your experience with job requirements
- 🎓 **Education Evaluation**: Assess educational fit for the role
- 📥 **Resume Optimization**: Download an optimized version of your resume
- 🎨 **Beautiful UI**: Built with React, TypeScript, and Tailwind CSS

## Tech Stack

### Frontend
- **Vite** - Lightning-fast build tool
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Shadcn/ui** - Component library

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Multer** - File upload handling
- **PDF-Parse** - PDF text extraction
- **Mammoth** - DOCX text extraction
- **jsPDF** - PDF generation

### Deployment
- **Vercel** - Serverless functions and static hosting
- **PostgreSQL** - Database (optional for production)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd resumeiq-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Start the development servers**
   
   **Terminal 1 - Frontend:**
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:8080

   **Terminal 2 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on http://localhost:5000

4. **Open in browser**
   ```
   http://localhost:8080
   ```

## Project Structure

```
resumeiq-pro/
├── src/                      # Frontend React code
│   ├── components/           # Reusable components
│   ├── pages/               # Page components
│   ├── lib/                 # Utilities and API client
│   ├── contexts/            # React context
│   ├── hooks/              # Custom React hooks
│   └── styles/             # Global styles
│
├── backend/src/             # Backend Express code
│   ├── controllers/         # Request handlers
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── types.ts            # TypeScript types
│   └── db.ts              # Database layer
│
├── api/                     # Vercel Serverless Functions
│   └── resumes/            # API endpoints
│
├── vercel.json             # Vercel configuration
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind configuration
└── package.json            # Frontend dependencies
```

## API Endpoints

### Local Development (Express)
- `POST /api/resumes/upload` - Upload a resume
- `POST /api/resumes/analyze` - Analyze resume
- `GET /api/resumes/[id]` - Get resume by ID
- `POST /api/resumes/download` - Download optimized resume
- `GET /api/resumes/history/[userId]` - Get user history
- `GET /health` - Health check

### Production (Vercel)
Same endpoints available as `/api/*` serverless functions

## Features Implemented

✅ PDF and DOCX file upload with validation  
✅ Resume parsing and text extraction  
✅ Skill extraction and matching  
✅ Experience analysis  
✅ Education evaluation  
✅ ATS score calculation  
✅ Resume optimization  
✅ Beautiful responsive UI  
✅ Vercel deployment ready  
✅ Environment variable support  

## Database Setup (Optional for Production)

To use PostgreSQL for persistent storage:

1. **Set up a PostgreSQL database** (local or cloud)

2. **Update environment variables**
   ```bash
   DATABASE_URL=postgres://user:password@localhost:5432/resumeiq
   ```

3. **Uncomment database code** in `backend/src/db.ts`

4. **Run migrations** (create tables as needed)

## Deployment to Vercel

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

**Quick Start:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Environment Variables

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api  # For local dev
```

### Backend (.env)
```
PORT=5000
DATABASE_URL=postgres://user:password@host/database
```

See [.env.example](./.env.example) for all available variables.

## Building for Production

```bash
# Frontend
npm run build

# Backend (if running separately)
cd backend && npm run build
```

## Common Issues

### Port Already in Use
- Frontend: Change port in `vite.config.ts`
- Backend: Set `PORT` environment variable

### PDF Upload Failing
- Ensure file is valid PDF/DOCX
- File size must be under 10MB
- Backend must be running

### API Connection Errors
- Check that backend is running on port 5000
- Verify `VITE_API_URL` is correct
- Check browser console for detailed errors

### Database Connection Errors
- Verify PostgreSQL is running
- Check `DATABASE_URL` is correct
- Ensure database exists

## Performance Metrics

- **Frontend bundle**: ~110KB (gzipped)
- **Build time**: ~6 seconds
- **API response**: <500ms average

## Security Considerations

⚠️ **Before Production Deployment:**
- Implement authentication
- Validate all file uploads
- Set up CORS properly
- Use environment variables for secrets
- Enable rate limiting
- Sanitize user inputs
- Use HTTPS in production

## Contributing

1. Create a feature branch
2. Make your changes
3. Commit with clear messages
4. Push to your fork
5. Create a Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions, please create an issue on GitHub.

## Changelog

### v1.0.0 (March 2026)
- Initial release
- Vercel deployment support
- PDF/DOCX file upload
- ATS score analysis
- Resume optimization

---

**Made with ❤️ for job seekers everywhere**
