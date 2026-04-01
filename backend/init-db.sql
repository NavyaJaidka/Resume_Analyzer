-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    skills JSONB,
    experience JSONB,
    education JSONB,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_analyzed_date TIMESTAMP WITH TIME ZONE
);

-- Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    resume_id TEXT REFERENCES resumes(id) ON DELETE CASCADE,
    result JSONB NOT NULL,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
