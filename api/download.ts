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
    const { resumeId } = req.body;
    if (typeof resumeId !== "string") {
      return res.status(400).json({ success: false, error: "Invalid resume ID" });
    }

    const pdfBuffer = await resumeService.generateOptimizedResume(resumeId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=optimized_resume_${resumeId}.pdf`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("Error downloading resume:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ success: false, error: errorMessage });
  }
}
