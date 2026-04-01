import { VercelRequest, VercelResponse } from "@vercel/node";
import * as resumeService from "../backend/src/services/resumeService";
import multiparty from "multiparty";
import fs from "fs";

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
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const form = new multiparty.Form();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parsing error:", err);
      return res.status(400).json({ success: false, error: "Failed to parse form data" });
    }

    const file = files.resume?.[0];
    if (!file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    try {
      const buffer = fs.readFileSync(file.path);
      const resumeData = await resumeService.parseResume({
        originalname: file.originalFilename,
        mimetype: file.headers["content-type"],
        buffer: buffer,
      });

      const savedResume = await resumeService.saveResume(resumeData);
      res.status(201).json({ success: true, data: savedResume });
    } catch (error: any) {
      console.error("Error uploading resume:", error);
      res.status(500).json({ success: false, error: error.message || "Failed to upload and parse resume" });
    }
  });
}
