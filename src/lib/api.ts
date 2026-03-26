const API_BASE_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api'
);

export async function uploadResume(file: File) {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload resume');
  }

  return response.json();
}

export async function analyzeResume(resumeId: string, jobDescription: string) {
  const response = await fetch(`${API_BASE_URL}/resumes/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeId, jobDescription }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze resume');
  }

  return response.json();
}

export async function getHistory(userId: string) {
  const response = await fetch(`${API_BASE_URL}/resumes/history/${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch history');
  }

  return response.json();
}

export async function downloadResume(resumeId: string) {
  const response = await fetch(`${API_BASE_URL}/resumes/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeId }),
  });

  if (!response.ok) {
    throw new Error('Failed to download resume');
  }

  return response.blob();
}
