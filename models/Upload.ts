// models/Upload.ts
import mongoose, { Schema } from "mongoose";

const UploadSchema = new Schema({
  shareId: { type: String, required: true, index: true },
  fileName: String,
  originalName: String,
  type: { type: String, enum: ["file", "text"], required: true },
  fileUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },  
});

// Define TTL index on expiresAt field
UploadSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.models.Upload || mongoose.model("Upload", UploadSchema);
