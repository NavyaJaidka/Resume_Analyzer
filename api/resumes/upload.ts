import { VercelRequest, VercelResponse } from "@vercel/node";
import multer from "multer";
import { parseResume, saveResume } from "../../backend/src/services/resumeService";

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".docx"];

    const hasValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const hasValidExtension = allowedExtensions.some((ext) =>
      file.originalname.toLowerCase().endsWith(ext)
    );

    if (hasValidMimeType || hasValidExtension) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

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
    const uploadHandler = upload.single("resume");

    uploadHandler(req as any, res as any, async (err: any) => {
      if (err) {
        if (err.message.includes("Only PDF and DOCX files are allowed")) {
          return res
            .status(400)
            .json({ error: "Only PDF and DOCX files are allowed" });
        }
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File must be under 10MB" });
        }
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      try {
        // Convert Express.Multer.File to match expected format
        const file = {
          ...req.file,
          path: "", // Not used in memory storage
        } as any;

        const resumeData = await parseResume(file);
        const savedResume = await saveResume(resumeData);
        res.status(201).json(savedResume);
      } catch (parseError: any) {
        console.error("Error parsing resume:", parseError);
        res.status(500).json({ error: "Failed to parse resume" });
      }
    });
  } catch (error: any) {
    console.error("Error uploading resume:", error);
    res.status(500).json({ error: "Failed to upload resume" });
  }
}
