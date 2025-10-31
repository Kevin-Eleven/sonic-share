import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { dbConnect } from "@/lib/dbConnect";
import Upload from "@/models/Upload";
import crypto from "crypto";

const uploadDir = path.join(process.cwd(), "uploads");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const searchParams = req.nextUrl.searchParams;
    const roomId = formData.get("roomId") as string | null;

    // File or text
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;

    if (!file && !text) {
      return NextResponse.json(
        { error: "No content provided" },
        { status: 400 }
      );
    }

    // ✅ Use existing shareId if provided, otherwise generate new
    const shareId =
      roomId;
    const fileId = uuidv4();
    let fileName = fileId;

    // Ensure uploads folder exists
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    if (file) {
      const fileExt = path.extname(file.name);
      fileName = `${fileId}${fileExt}`;
      const filePath = path.join(uploadDir, fileName);
      const arrayBuffer = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
    }

    if (text) {
      fileName = `${fileId}.txt`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, text);
    }

    const shareUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/share/${shareId}`;

    await dbConnect();
    const upload = await Upload.create({
      shareId,
      fileName,
      type: file ? "file" : "text",
      originalName: file ? file.name : null,
    });

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      uploadedItem: upload,
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
