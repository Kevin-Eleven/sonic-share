import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";

import Upload from "@/models/Upload";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = await params;

  // finds all uploads with the given shareId
  const uploads = await Upload.find({ shareId: params.id }).sort({ createdAt: -1 });

  if (!uploads || uploads.length === 0) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  return NextResponse.json(uploads);
}
