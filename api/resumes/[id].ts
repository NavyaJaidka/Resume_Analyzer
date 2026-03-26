import { VercelRequest, VercelResponse } from "@vercel/node";
import { getResumeById } from "../../shared/resumeService";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid resume ID" });
    }

    const resume = await getResumeById(id);
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    res.json(resume);
  } catch (error: any) {
    console.error("Error getting resume:", error);
    res.status(500).json({ error: "Failed to get resume" });
  }
}
