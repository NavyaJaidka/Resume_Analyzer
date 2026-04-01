CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY,
    file_name TEXT,
    raw_text TEXT,
    skills JSONB,
    experience JSONB,
    education JSONB,
    upload_date TIMESTAMP,
    last_analyzed_date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    resume_id TEXT REFERENCES resumes(id) ON DELETE CASCADE,
    result JSONB,
    analyzed_at TIMESTAMP
);