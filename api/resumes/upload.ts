import { VercelRequest, VercelResponse } from "@vercel/node";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Simple test response first
    res.status(200).json({
      message: "API is working",
      timestamp: new Date().toISOString(),
      method: req.method
    });
  } catch (error: any) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
