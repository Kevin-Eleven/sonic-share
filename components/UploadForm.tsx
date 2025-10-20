"use client";
import { useState, useRef } from "react";
import { FileIcon } from "lucide-react";
import { toast } from "react-hot-toast";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [response, setResponse] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [view, setView] = useState<"file" | "text" | null>("text");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && text.trim() === "") {
      if (view === "file") {
        toast.error("Please select a file to share.");
      } else {
        toast.error("Please enter some text to share.");
      }
      return;
    }
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    if (text) {
      formData.append("text", text);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResponse(data);
      // console.log(data);
      // alert("Upload successful!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center h-full w-full">
      <div className="p-4 w-md mx-auto bg-[#19485A] my-auto rounded shadow-lg text-white  flex flex-col ">
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
          {view === "file" || !view ? (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleChange}
                className="hidden"
              />
              {/* Custom styled file button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-between rounded p-2 cursor-pointer border-black border-2 "
              >
                <span className="text-sm ">
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
