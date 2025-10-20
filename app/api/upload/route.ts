import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const uploadDir = path.join(process.cwd(), "uploads");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Check for file upload
    const file = formData.get("file") as File | null;

    // Check for text content
    const text = formData.get("text") as string | null;

    // If neither file nor text is provided, return an error
    if (!file && !text) {
      return NextResponse.json(
        {
          error: "No content provided",
          details: "Please provide either a file or text content",
          contentType: req.headers.get("content-type"),
        },
        { status: 400 }
      );
    }

    // Generate unique ID for this share
    // const fileId = uuidv4();
    const fileId = crypto.randomBytes(4).toString("hex"); // 8 hex chars

    let fileName = fileId;

    if (file) {
      // Handle file upload
      const fileExt = path.extname(file.name);
      fileName = `${fileId}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);

      // Convert file to buffer and save
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);
    }
    if (text) {
      // Handle text content - save as .txt file
      fileName = `${fileId}.txt`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, text);
    }

    // Return shareable link
    const shareUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/share/${fileId}`;

    return NextResponse.json({
      success: true,
      fileId,
      fileName,
      shareUrl,
      type: file ? "file" : "text",
      originalName: file ? file.name : null,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      {
        error: "Upload failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
