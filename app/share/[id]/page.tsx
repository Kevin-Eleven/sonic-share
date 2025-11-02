"use client";
import Image from "next/image";
import React from "react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function SharePage({ params }: { params: { id: string } }) {
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { id } = React.use(params);
  useEffect(() => {
    const socket = io();
    socket.emit("join-room", id);
    socket.on("new-upload", (data: any) => {
      console.log("New upload received via socket:", data);
      setUploads((prev) => [data, ...prev]);
    });
    async function fetchUploads() {
      try {
        const res = await fetch(`/api/share/${id}`);
        const data = await res.json();
        console.log("Fetched data:");
        console.log(data);
        if (!data.error) setUploads(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUploads();
    return () => {
      socket.disconnect();
    };
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!uploads.length)
    return <p className="text-center mt-10">No files found</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#19485A] text-white p-4">
      <h1 className="text-2xl mb-6">Shared Content</h1>

      {uploads.map((upload) => {
        const fileUrl = `/api/file/${upload.fileName}`;

        return (
          <div key={upload._id} className="mb-6 w-full max-w-3xl">
            {upload.type === "text" ? (
              <iframe
                src={fileUrl}
                className="w-full h-80 bg-white text-black rounded-lg"
              ></iframe>
            ) : /\.(jpe?g|png)$/i.test(upload.fileName) ? (
              <Image
                src={fileUrl}
                alt="Shared file"
                className="w-full rounded"
                width={1000}
                height={600}
              />
            ) : upload.fileName.endsWith(".mp4") ? (
              <video controls src={fileUrl} className="w-full rounded" />
            ) : (
              <a
                href={fileUrl}
                download={upload.originalName || upload.fileName}
                className="bg-black p-2 rounded mt-4 inline-block"
              >
                Download {upload.originalName || upload.fileName}
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
