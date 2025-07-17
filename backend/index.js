const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Enable CORS for API routes
app.use(cors());

const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000", "https://your-frontend-domain.com"],
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
    if (users[roomID]) {
      users[roomID].push({ userId: socket.id, user });
    } else {
      users[roomID] = [{ userId: socket.id, user }];
    }

    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter(
      (user) => user.userId !== socket.id
    );
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
    io.emit("message", payload);
  });

  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      users[roomID] = room.filter((item) => item.userId !== socket.id);
    }
    socket.broadcast.emit("user left", socket.id);
  });
});

// Comment this out in production
// console.clear();

server.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
