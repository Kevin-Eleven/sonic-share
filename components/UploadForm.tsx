"use client";
import { useState, useRef, useEffect } from "react";
import { FileIcon, Copy } from "lucide-react";
import { toast } from "react-hot-toast";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [shareId, setShareId] = useState<string | null>(null); // <-- Persistent shareId
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<"file" | "text">("text");
  const [shareLink, setShareLink] = useState<string>("");

  // On component load, restore shareId from localStorage
  useEffect(() => {
    const savedId = localStorage.getItem("shareId");
    if (savedId) {
      setShareId(savedId);
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      setShareLink(`${baseUrl}/share/${savedId}`);
    }
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

    const formData = new FormData();
    if (file) formData.append("file", file);
    if (text) formData.append("text", text);
    if (shareId) formData.append("shareId", shareId); // ✅ send existing shareId

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed.");

      // Save or update shareId
      if (!shareId && data.shareId) {
        setShareId(data.shareId);
        localStorage.setItem("shareId", data.shareId);
      }

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
        {/* show share link at top and copy option */}
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
              className="ml-2  bg-green-100 hover:bg-green-200 p-2 rounded-lg cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                toast.success("Link copied to clipboard!");
              }}
            >
              <Copy className="w-4 h-4 inline" />
            </button>
          </div>
        )}
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
                className="flex-1 flex items-center justify-between rounded p-2 cursor-pointer border-black border-2"
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
              className="p-2 rounded h-24 resize-none border-black border-2 focus:outline-none"
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
