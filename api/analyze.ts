import { VercelRequest, VercelResponse } from "@vercel/node";
import * as resumeService from "../backend/src/services/resumeService";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { resumeId, jobDescription } = req.body;
    
    if (typeof resumeId !== 'string' || typeof jobDescription !== 'string') {
      return res.status(400).json({ success: false, error: "Missing or invalid resumeId or jobDescription" });
    }

    const result = await resumeService.analyzeResume(resumeId, jobDescription);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
}
