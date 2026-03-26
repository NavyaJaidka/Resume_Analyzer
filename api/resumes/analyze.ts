import { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeResume } from "../../shared/resumeService";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { resumeId, jobDescription } = req.body;

    if (typeof resumeId !== "string" || typeof jobDescription !== "string") {
      return res.status(400).json({
        error: "Missing or invalid resumeId or jobDescription",
      });
    }

    const result = await analyzeResume(resumeId, jobDescription);
    res.json(result);
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
}
