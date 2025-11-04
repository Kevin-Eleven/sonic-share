"use client";

import { useState, useRef, useEffect } from "react";
import { FileIcon, Copy, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import io from "socket.io-client";
import { motion } from "framer-motion";

let socket: ReturnType<typeof io> | null = null;

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [view, setView] = useState<"file" | "text">("text");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("✅ Connected to socket server");
      socket!.emit("create-room");
    });

    socket.on("room-created", (id: string) => {
      console.log("🆕 Room created and joined:", id);
      setRoomId(id);
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      setShareLink(`${baseUrl}/share/${id}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
    });

    return () => {
      socket?.disconnect();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file && text.trim() === "") {
      toast.error(
        view === "file" ? "Please select a file." : "Please enter some text."
      );
      return;
    }

    if (!roomId) {
      toast.error("Room not ready yet. Please wait a second.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (text) formData.append("text", text);
    formData.append("roomId", roomId);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");

      socket?.emit("upload", { roomId, data: data.uploadedItem });
      console.log("📤 Emitted 'upload' with:", data.uploadedItem);
      toast.success("Upload successful!");
      setFile(null);
      setText("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl p-8 space-y-6 bg-zinc-900 rounded-lg shadow-lg"
      >
        {shareLink && (
          <div className="p-4 text-center bg-zinc-800 rounded-lg">
            <p className="text-sm text-zinc-400">Your sharing link is ready:</p>
            <div className="flex items-center justify-center mt-2">
              <a
                href={shareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 underline truncate text-base"
              >
                {shareLink}
              </a>
              <button
                className="ml-4 p-2 rounded-full bg-zinc-700 hover:bg-zinc-600 transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink);
                  toast.success("Link copied!");
                }}
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4 p-1 rounded-full bg-zinc-800">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors hover:bg-zinc-700 ${
              view === "text" ? "bg-white text-black" : "text-white"
            }`}
            onClick={() => setView("text")}
          >
            Text
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors hover:bg-zinc-700 ${
              view === "file" ? "bg-white text-black" : "text-white"
            }`}
            onClick={() => setView("file")}
          >
            File
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {view === "file" ? (
            <div className="flex flex-col items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-zinc-800 border-zinc-600 hover:bg-zinc-700 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileIcon className="w-10 h-10 mb-3 text-zinc-400" />
                  <p className="mb-2 text-sm text-zinc-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-zinc-500">Any file type, up to 500MB</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" onChange={handleChange} />
              </label>
              {file && <p className="mt-3 text-sm text-zinc-300">Selected: {file.name}</p>}
            </div>
          ) : (
            <textarea
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-48 p-4 text-base text-white bg-zinc-800 border rounded-lg resize-none border-zinc-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
            ></textarea>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 text-base font-medium text-black bg-white rounded-lg hover:bg-gray-200 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Share"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-400 mt-4">
          Files are automatically deleted after 30 minutes.
        </p>
      </motion.div>
    </div>
  );
}
