import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { id } = req.query;

    res.status(200).json({
      message: "Get resume API is working",
      timestamp: new Date().toISOString(),
      endpoint: "get-resume",
      id: id
    });
  } catch (error: any) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
