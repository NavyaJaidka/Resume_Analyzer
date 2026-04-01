const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function uploadResume(file: File) {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to upload resume');
  }

  return result.data;
}

export async function analyzeResume(resumeId: string, jobDescription: string) {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeId, jobDescription }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to analyze resume');
  }

  return result.data;
}

export async function getHistory(userId: string) {
  const response = await fetch(`${API_BASE_URL}/history?userId=${userId}`);

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to fetch history');
  }

  return result.data;
}

export async function downloadResume(resumeId: string) {
  // Download usually returns a blob directly or a success wrapper with a URL/Base64
  // For now, let's assume it still returns a blob if we didn't refactor it to the new format yet.
  // Actually, the user specifically asked for /api/upload.ts, /api/analyze.ts, /api/history.ts.
  // I should check if download.ts exists in root /api.
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
