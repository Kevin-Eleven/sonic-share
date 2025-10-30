// lib/rooms.ts
type Room = {
  id: string;
  clients: Set<string>;
  createdAt: number;
  // timer?: NodeJS.Timeout;
};

const rooms: Record<string, Room> = {};

function generateRoomId() {
  return Math.random().toString(36).substring(2, 7);
}

export function createRoom(): Room {
  const id = generateRoomId();
  const room: Room = { id, clients: new Set(), createdAt: Date.now() };
  rooms[id] = room;

  // Optional 5-minute cleanup fallback
  // room.timer = setTimeout(() => {
  //   if (rooms[id] && rooms[id].clients.size === 0) {
  //     delete rooms[id];
  //     console.log(`🕒 Room ${id} expired`);
  //   }
  // }, 5 * 60 * 1000);

  console.log(`✅ Room created: ${id}`);
  return room;
}

export function getRoom(id: string) {
  return rooms[id];
}

export function deleteRoom(id: string) {
  const room = rooms[id];
  if (room) {
    // clearTimeout(room.timer);
    delete rooms[id];
    console.log(`❌ Room ${id} deleted`);
  }
}

export function addClient(roomId: string, socketId: string) {
  const room = getRoom(roomId);
  if (room) room.clients.add(socketId);
}

export function removeClient(roomId: string, socketId: string) {
  const room = getRoom(roomId);
  if (!room) return;

  room.clients.delete(socketId);
  if (room.clients.size === 0) deleteRoom(roomId);
}
