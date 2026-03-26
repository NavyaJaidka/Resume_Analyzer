import { VercelRequest, VercelResponse } from "@vercel/node";
import { generateOptimizedResume } from "../../shared/resumeService";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { resumeId } = req.body;

    if (typeof resumeId !== "string") {
      return res.status(400).json({ error: "Invalid resume ID" });
    }

    const pdfBuffer = await generateOptimizedResume(resumeId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=optimized_resume_${resumeId}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error("Error downloading resume:", error);
    res.status(500).json({ error: "Failed to generate and download resume" });
  }
}
