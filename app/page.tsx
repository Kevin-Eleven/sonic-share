"use client";

import UploadForm from "@/components/UploadForm";
import { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="text-center">
      <p className="text-lg mb-8">Share files and text in real-time with anyone in the world.</p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <UploadForm />
      </motion.div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
