import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { resumeId } = req.body;

    res.status(200).json({
      message: "Download API is working",
      timestamp: new Date().toISOString(),
      endpoint: "download",
      resumeId: resumeId
    });
  } catch (error: any) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
