// server.ts
import { createServer } from "http";
import next from "next";
import { Server as SocketIOServer, Socket } from "socket.io";
import { createRoom, getRoom, addClient, removeClient } from "./lib/rooms.ts";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = Number(process.env.PORT) || 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server for Next.js
  const httpServer = createServer(handler);

  // Initialize Socket.IO on top of the same server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // Allow all origins (customize for production)
    },
  });

  // ✅ Store globally so API routes can emit later
  (global as any).io = io;

  // Handle socket connections
  io.on("connection", (socket: Socket) => {
    console.log("🟢 Client connected:", socket.id);

    // Frontend asks for a new room when visiting "/"
    socket.on("create-room", () => {
      const room = createRoom();
      socket.emit("room-created", room.id);
      socket.join(room.id);
      addClient(room.id, socket.id);
      console.log(`Room auto-created: ${room.id}`);
    });

    // When someone visits a share link, they join that room
    socket.on("join-room", (roomId: string) => {
      const room = getRoom(roomId);
      if (!room) {
        socket.emit("room-not-found");
        return;
      }
      socket.join(roomId);
      addClient(roomId, socket.id);
      console.log(`👥 ${socket.id} joined ${roomId}`);
    });

    // File/text upload event
    socket.on("upload", ({ roomId, data }) => {
      const room = getRoom(roomId);
      if (!room) return;
      io.to(roomId).emit("new-upload", data);
    });

    // Handle disconnect
    socket.on("disconnecting", () => {
      const joinedRooms = Array.from(socket.rooms).filter(
        (r) => r !== socket.id
      );
      for (const roomId of joinedRooms) {
        removeClient(roomId, socket.id);
      }
    });
  });

  // Start server
  httpServer
    .once("error", (err) => {
      console.error("❌ Server error:", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Server ready at http://${hostname}:${port}`);
    });
});
