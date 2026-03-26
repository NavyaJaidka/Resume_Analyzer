import { VercelRequest, VercelResponse } from "@vercel/node";
import multiparty from "multiparty";
import { parseResume, saveResume } from "../../shared/resumeService";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}

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
    const form = new multiparty.Form({
      maxFilesSize: 10 * 1024 * 1024, // 10MB
    });

    const [fields, files] = await new Promise<[multiparty.Field[], { [key: string]: multiparty.File[] }]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const resumeFiles = files.resume || [];
    if (resumeFiles.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = resumeFiles[0];

    // Validate file type
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".docx"];

    const hasValidMimeType = allowedMimeTypes.includes(file.headers['content-type'] || '');
    const hasValidExtension = allowedExtensions.some((ext) =>
      file.originalFilename?.toLowerCase().endsWith(ext)
    );

    if (!hasValidMimeType && !hasValidExtension) {
      return res.status(400).json({ error: "Only PDF and DOCX files are allowed" });
    }

    // Convert to expected format
    const resumeFile: MulterFile = {
      fieldname: 'resume',
      originalname: file.originalFilename || 'unknown',
      encoding: '7bit',
      mimetype: file.headers['content-type'] || 'application/octet-stream',
      size: file.size,
      buffer: file._readableState ? Buffer.alloc(0) : file, // Handle buffer properly
      destination: '',
      filename: file.originalFilename || 'unknown',
      path: '',
    };

    // If file is a readable stream, read it into buffer
    if (file._readableState) {
      const chunks: Buffer[] = [];
      for await (const chunk of file) {
        chunks.push(chunk);
      }
      resumeFile.buffer = Buffer.concat(chunks);
    }

    try {
      const resumeData = await parseResume(resumeFile);
      const savedResume = await saveResume(resumeData);
      res.status(201).json(savedResume);
    } catch (parseError: any) {
      console.error("Error parsing resume:", parseError);
      res.status(500).json({ error: "Failed to parse resume" });
    }
  } catch (error: any) {
    console.error("Error uploading resume:", error);
    if (error.message?.includes("maxFilesSize")) {
      return res.status(400).json({ error: "File must be under 10MB" });
    }
    res.status(500).json({ error: "Failed to upload resume" });
  }
}
