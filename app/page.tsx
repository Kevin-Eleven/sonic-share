"use client";

import UploadForm from "@/components/UploadForm";
import { Toaster } from "react-hot-toast";

export default function Home() {
  return (
    <div className="h-screen w-screen ">
      <UploadForm />
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
