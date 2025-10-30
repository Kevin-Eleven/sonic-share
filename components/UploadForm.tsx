"use client";

import { useState, useRef, useEffect } from "react";
import { FileIcon, Copy } from "lucide-react";
import { toast } from "react-hot-toast";
import io from "socket.io-client";

let socket: ReturnType<typeof io> | null = null;

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<"file" | "text">("text");
  const [roomId, setRoomId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string>("");

  // 🔹 Setup socket connection and create a room
  useEffect(() => {
    socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("✅ Connected to socket server");
      socket.emit("create-room");
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

  // 🔹 Handle file input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // 🔹 Handle upload (send file or text)
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

      // ✅ Notify connected peers in this room
      socket?.emit("upload", { roomId, data: data.uploadedItem });
      console.log("📤 Emitted 'upload' with:", data.uploadedItem);

      toast.success("Upload successful!");
      setFile(null);
      setText("");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center h-full w-full">
      <div className="p-4 w-md mx-auto bg-[#19485A] my-auto rounded shadow-lg text-white flex flex-col">
        {/* 🔗 Share Link */}
        {shareLink && (
          <div className="mb-4 p-2 bg-green-100 text-green-800 rounded w-full text-center">
            Share Link:{" "}
            <a
              href={shareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {shareLink}
            </a>
            <button
              className="ml-2 bg-green-100 hover:bg-green-200 p-2 rounded-lg cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                toast.success("Link copied to clipboard!");
              }}
            >
              <Copy className="w-4 h-4 inline" />
            </button>
          </div>
        )}

        {/* Toggle Buttons */}
        <div className="flex justify-center mb-4 gap-4">
          <button
            className={`py-2 px-4 rounded ${
              view === "text" ? "bg-[#020507]" : "bg-transparent"
            } cursor-pointer hover:bg-[#091A21]`}
            onClick={() => setView("text")}
          >
            Text
          </button>
          <button
            className={`py-2 px-4 rounded ${
              view === "file" ? "bg-[#020507]" : "bg-transparent"
            } cursor-pointer hover:bg-[#091A21]`}
            onClick={() => setView("file")}
          >
            File
          </button>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {view === "file" ? (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-between rounded p-2 cursor-pointer border-black border-2 bg-white text-black"
              >
                <span className="text-sm">
                  {file ? file.name : "Select a file"}
                </span>
                <FileIcon className="w-5 h-5 text-black" />
              </button>
            </>
          ) : (
            <textarea
              placeholder="Enter text content here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="p-2 rounded h-24 resize-none border-black border-2 focus:outline-none text-black"
            ></textarea>
          )}

          <button
            type="submit"
            className="bg-[#020507] text-white p-2 rounded cursor-pointer hover:bg-[#091A21]"
          >
            Share
          </button>
        </form>
      </div>
    </div>
  );
}
