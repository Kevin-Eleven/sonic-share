"use client";
import React from "react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Copy, Download, Loader2, FileText, File } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function SharePage({ params }: { params: { id: string } }) {
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { id } = React.use(params);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Text copied successfully!");
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy text.");
    }
  };

  useEffect(() => {
    const socket = io();
    socket.emit("join-room", id);

    const handleNewUpload = (data: any) => {
      if (data.type === "text") {
        fetch(`/api/file/${data.fileName}`)
          .then((res) => res.text())
          .then((content) => {
            setUploads((prev) => [{ ...data, content }, ...prev]);
          });
      } else {
        setUploads((prev) => [data, ...prev]);
      }
    };

    socket.on("new-upload", handleNewUpload);

    async function fetchUploads() {
      try {
        const res = await fetch(`/api/share/${id}`);
        const initialUploads = await res.json();
        if (initialUploads.error) {
          setUploads([]);
          return;
        }

        const processedUploads = await Promise.all(
          initialUploads.map(async (upload: any) => {
            if (upload.type === "text") {
              try {
                const res = await fetch(`/api/file/${upload.fileName}`);
                const content = await res.text();
                return { ...upload, content };
              } catch (error) {
                console.error("Failed to fetch text content:", error);
                return { ...upload, content: "Failed to load content." };
              }
            }
            return upload;
          })
        );

        setUploads(processedUploads);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUploads();

    return () => {
      socket.off("new-upload", handleNewUpload);
      socket.disconnect();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-zinc-500" />
        <p className="mt-4 text-zinc-400">Loading shared content...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-center mb-8">Shared Content</h1>
      
      <AnimatePresence>
        {uploads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-12"
          >
            <p className="text-zinc-400">No content has been shared in this room yet.</p>
          </motion.div>
        ) : (
          <motion.div className="space-y-6">
            {uploads.map((upload) => {
              const fileUrl = `/api/file/${upload.fileName}`;

              return (
                <motion.div
                  key={upload._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-zinc-900 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {upload.type === "text" ? (
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-6 h-6 text-zinc-400" />
                          <h2 className="font-semibold text-lg">Text Content</h2>
                        </div>
                        <button
                          onClick={() => handleCopy(upload.content || "")}
                          className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
                          aria-label="Copy text"
                        >
                          <Copy size={18} />
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={upload.content || ""}
                        className="w-full h-56 p-4 text-base text-zinc-300 bg-zinc-800 border rounded-lg resize-none border-zinc-700 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <File className="w-8 h-8 text-zinc-400" />
                        <span className="truncate pr-4 font-medium text-base">
                          {upload.originalName || upload.fileName}
                        </span>
                      </div>
                      <a
                        href={fileUrl}
                        download={upload.originalName || upload.fileName}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black bg-white rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Download size={16} />
                        Download
                      </a>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
