import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { dbConnect } from "@/lib/dbConnect";
import Upload from "@/models/Upload";
import { blobServiceClient } from "@/lib/azure";
import path from "path";

const containerName = "uploads";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const text = formData.get("text") as string | null;
    const roomId = formData.get("roomId") as string | null;

    if (!file && !text) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    const shareId = roomId;
    const fileId = uuidv4();
    let fileName = fileId;
    let fileUrl = "";

    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    if (file) {
      const fileExt = path.extname(file.name);
      fileName = `${fileId}${fileExt}`;
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      const arrayBuffer = await file.arrayBuffer();
      await blockBlobClient.upload(arrayBuffer, arrayBuffer.byteLength);
      fileUrl = blockBlobClient.url;
    } else if (text) {
      fileName = `${fileId}.txt`;
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.upload(text, text.length);
      fileUrl = blockBlobClient.url;
    }

    await dbConnect();
    const upload = await Upload.create({
      shareId,
      fileName,
      fileUrl,
      type: file ? "file" : "text",
      originalName: file ? file.name : null,
    });

    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/share/${shareId}`;

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