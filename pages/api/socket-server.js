import { Server as SocketServer } from "socket.io";

// This is a simplified socket server implementation
export default function handler(req, res) {
  // Health check for GET requests
  if (req.method === 'GET') {
    res.status(200).json({ status: 'Socket server is running' });
    return;
  }

  if (!res.socket.server.io) {
    console.log("* Initializing new socket.io server *");
    
    // Basic socket.io server with minimal configuration
    // This should work better with Vercel's serverless functions
    const io = new SocketServer(res.socket.server, {
      path: "/api/socket-server",
      addTrailingSlash: false,
      cors: { origin: "*" },
      transports: ['polling'],
      pingTimeout: 10000,
      pingInterval: 5000
    });
    
    // Setup socket event handlers
    io.on("connection", (socket) => {
      console.log("New socket connected:", socket.id);
      
      // Join a room
      socket.on("join-room", (roomId, userId, userName) => {
        console.log(`User ${userName || userId} joined room ${roomId}`);
        
        // Store user info in socket
        socket.userName = userName;
        socket.userId = userId;
        socket.roomId = roomId;
        
        // Join the room and notify others
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId, userName);
        
        // System message for user joining
        const systemMessage = {
          content: `${userName || 'A user'} has joined the meeting`,
          senderId: 'system',
          senderName: 'System',
          timestamp: new Date().toISOString(),
        };
        io.to(roomId).emit("chat-message", systemMessage);
      });
      
      // Handle disconnection
      socket.on("disconnect", () => {
        const { roomId, userName, userId } = socket;
        if (roomId) {
          console.log(`User ${userName || userId} disconnected from room ${roomId}`);
          socket.to(roomId).emit("user-leave", userId, userName);
          
          // System message for user leaving
          const systemMessage = {
            content: `${userName || 'A user'} has left the meeting`,
            senderId: 'system',
            senderName: 'System',
            timestamp: new Date().toISOString(),
          };
          socket.to(roomId).emit("chat-message", systemMessage);
        }
      });
      
      // Chat messages
      socket.on("chat-message", (message, roomId) => {
        io.to(roomId).emit("chat-message", message);
      });
      
      // Reactions
      socket.on("reaction", (reaction, roomId) => {
        socket.to(roomId).emit("reaction", reaction);
      });
      
      // Raise hand
      socket.on("raise-hand", (data, roomId) => {
        socket.to(roomId).emit("raise-hand", data);
      });
      
      // Media controls
      socket.on("toggle-mute", (userId, isMuted, roomId) => {
        socket.to(roomId).emit("toggle-mute", userId, isMuted);
      });
      
      socket.on("toggle-video", (userId, isVideoOn, roomId) => {
        socket.to(roomId).emit("toggle-video", userId, isVideoOn);
      });
    });
    
    // Store the io instance
    res.socket.server.io = io;
  }
  
  // End response to unblock request
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
