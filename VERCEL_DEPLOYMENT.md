# Vercel Deployment Guide

This project has been converted to be Vercel-friendly! Here's how to deploy it.

## Project Structure

```
project/
├── src/                  # Frontend (React + Vite)
├── api/                  # Vercel Serverless Functions
│   └── resumes/
│       ├── upload.ts
│       ├── analyze.ts
│       ├── [id].ts
│       └── download.ts
├── backend/src/          # Shared backend logic
├── vercel.json          # Vercel configuration
└── .env.example         # Environment variables template
```

## Changes Made

✅ **API Routes**: Converted Express backend to Vercel Serverless Functions (`/api` folder)
✅ **Environment Variables**: Frontend API URL is now configurable
✅ **Configuration**: Added `vercel.json` for proper Vercel setup

## Deployment Steps

### 1. Prepare Environment Variables

Create a `.env` file at the root (for local development):
```bash
VITE_API_URL=http://localhost:3000/api  # For local dev
```

### 2. Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
npm install -g vercel
vercel
```

**Option B: Using GitHub Integration**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Connect your GitHub repository
4. Set environment variables in Project Settings

### 3. Set Environment Variables on Vercel

In Vercel Dashboard > Settings > Environment Variables:

- **VITE_API_URL**: (Optional) Set to your production API URL if different from `/api`
- **DATABASE_URL**: PostgreSQL connection string (if using traditional DB)

## API Endpoints After Deployment

All API routes will be available under `/api/`:

```
POST /api/resumes/upload   - Upload a resume
POST /api/resumes/analyze  - Analyze resume against job description
GET  /api/resumes/[id]     - Get specific resume
POST /api/resumes/download - Download optimized resume
```

## Important Notes

⚠️ **In-Memory Database**: Currently using in-memory storage. For production, set `DATABASE_URL` and implement PostgreSQL integration.

⚠️ **File Storage**: Currently stores files in memory. For production with file persistence:
- Integrate AWS S3
- Use Vercel Blob Storage
- Or other cloud storage solution

⚠️ **Database Setup**: After deploying, you'll need to:
1. Set up a PostgreSQL database (Vercel Postgres, AWS RDS, etc.)
2. Update `DATABASE_URL` in Vercel environment variables
3. Uncomment the database code in `backend/src/db.ts`

## Local Development

```bash
# Install dependencies
npm install

# Start frontend and backend
npm run dev        # Frontend runs on http://localhost:8080
# In another terminal:
cd backend && npm run dev  # Backend runs on http://localhost:5000
```

## Production Architecture

When deployed to Vercel:
```
Client (Vercel Static)
    ↓
Vercel Edge Network
    ↓
/api/* (Vercel Serverless Functions)
    ↓
Database (External: Vercel Postgres, AWS RDS, etc.)
```

## Troubleshooting

### API calls return 401 errors
- Check that `VITE_API_URL` is set correctly in Vercel env vars
- Or ensure it's not set so it defaults to `/api`

### File uploads failing
- Implement cloud storage (S3, Vercel Blob, etc.)
- Update `api/resumes/upload.ts` to use cloud storage instead of memory

### Database connection errors
- Verify `DATABASE_URL` is set in Vercel environment
- Database must be accessible from Vercel's IP range
- Consider using Vercel Postgres for easier integration

## Next Steps

1. Implement cloud storage for file uploads
2. Set up PostgreSQL database
3. Add authentication if needed
4. Implement proper error handling and logging
5. Add monitoring with Vercel Analytics

---

For more info: https://vercel.com/docs
