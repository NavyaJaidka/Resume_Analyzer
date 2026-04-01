import { VercelRequest, VercelResponse } from "@vercel/node";
import * as resumeService from "../../../backend/src/services/resumeService";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.query;
    if (typeof userId !== "string") {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const history = await resumeService.getHistoryByUserId(userId);
    res.status(200).json(history);
  } catch (error: any) {
    console.error("Error getting history:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
