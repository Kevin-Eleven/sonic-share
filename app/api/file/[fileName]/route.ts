import { NextRequest, NextResponse } from "next/server";
import { blobServiceClient } from "@/lib/azure";
import path from "path";

const containerName = "uploads";

export async function GET(
  req: NextRequest,
  { params }: { params: { fileName: string } }
) {
  try {
    const { fileName } = await params;
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    // Check if blob exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const downloadBuffer = await blockBlobClient.downloadToBuffer();

    const headers = new Headers();
    const ext = path.extname(fileName).toLowerCase();
    if (ext === ".txt") headers.set("Content-Type", "text/plain");
    else if (ext === ".jpg" || ext === ".jpeg") headers.set("Content-Type", "image/jpeg");
    else if (ext === ".png") headers.set("Content-Type", "image/png");
    else if (ext === ".mp4") headers.set("Content-Type", "video/mp4");

    return new NextResponse(downloadBuffer, { headers });
  } catch (err: any) {
    console.error("File download error:", err);
    return NextResponse.json(
      {
        error: "File download failed",
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
