// models/Upload.ts
import mongoose, { Schema } from "mongoose";

const UploadSchema = new Schema({
  shareId: { type: String, required: true, index: true },
  fileName: String,
  originalName: String,
  type: { type: String, enum: ["file", "text"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Upload || mongoose.model("Upload", UploadSchema);
