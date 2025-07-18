const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Enable CORS for API routes
app.use(cors());

const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000", "https://nexus-meet.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const users = {};
const socketToRoom = {};
const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);

  socket.on("join room", ({ roomID, user }) => {
    console.log(`User ${user?.name || 'Unknown'} joining room: ${roomID}`);
    
    // Join the socket to the room
    socket.join(roomID);
    
    // Add user to room
    if (users[roomID]) {
      users[roomID].push({ userId: socket.id, user });
    } else {
      users[roomID] = [{ userId: socket.id, user }];
    }

    socketToRoom[socket.id] = roomID;
    
    // Get other users in the room (excluding current user)
    const usersInThisRoom = users[roomID].filter(
      (u) => u.userId !== socket.id
    );
    
    console.log(`Room ${roomID} now has ${users[roomID].length} users`);
    
    // Send existing users to the new user
    socket.emit("all users", usersInThisRoom);
  });

  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
      user: payload.user,
    });
  });

  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("send message", (payload) => {
    // Send message to all users in the same room
    const roomID = payload.roomID;
    if (roomID) {
      io.to(roomID).emit("message", payload);
      console.log(`Message sent to room ${roomID}`);
    } else {
      // Fallback to broadcast to all (legacy support)
      io.emit("message", payload);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const roomID = socketToRoom[socket.id];
    
    if (roomID) {
      let room = users[roomID];
      if (room) {
        // Remove user from room
        users[roomID] = room.filter((item) => item.userId !== socket.id);
        console.log(`User left room ${roomID}. Remaining users: ${users[roomID].length}`);
        
        // Clean up empty rooms
        if (users[roomID].length === 0) {
          delete users[roomID];
          console.log(`Room ${roomID} deleted (empty)`);
        }
      }
      
      // Notify other users in the same room that this user left
      socket.to(roomID).emit("user left", socket.id);
    }
    
    // Clean up socket to room mapping
    delete socketToRoom[socket.id];
  });
});

// Health check endpoint for Render
app.get('/', (req, res) => {
  res.json({ 
    message: 'Nexus Meet Backend Server is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// Room status endpoint for debugging
app.get('/rooms', (req, res) => {
  const roomStatus = {};
  for (const [roomID, roomUsers] of Object.entries(users)) {
    roomStatus[roomID] = {
      userCount: roomUsers.length,
      users: roomUsers.map(u => ({
        socketId: u.userId,
        name: u.user?.name || 'Unknown',
        email: u.user?.email
      }))
    };
  }
  
  res.json({
    totalRooms: Object.keys(users).length,
    rooms: roomStatus,
    timestamp: new Date().toISOString()
  });
});

// Comment this out in production
// console.clear();

server.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
