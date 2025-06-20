import { Server } from "socket.io";

const SocketHandler = (req, res) => {
    console.log("called api")
    if (res.socket.server.io) {
        console.log("socket already running")
    } else {        const io = new Server(res.socket.server)
        res.socket.server.io = io
          io.on('connection', (socket) => {
            console.log("server is connected")
            
            socket.on('join-room', (roomId, userId) => {
                console.log(`a new user ${userId} joined room ${roomId}`)
                socket.join(roomId)
                
                // Store user ID in socket data for future reference
                socket.data.userId = userId;
                socket.data.roomId = roomId;
                
                // Notify others in the room about the new user
                socket.to(roomId).emit('user-connected', userId)
                
                // Send welcome message to chat
                socket.to(roomId).emit('receive-message', {
                    content: `User ${userId.substring(0, 8)}... has joined the room`,
                    sender: 'system',
                    timestamp: new Date().toISOString()
                })
            })
            
            // Handle requests for video state
            socket.on('request-video-state', ({userId, targetId, roomId}) => {
                console.log(`User ${userId} requesting video state from ${targetId} in room ${roomId}`);
                
                // Forward the request to the target user
                socket.to(roomId).emit('video-state-requested', {
                    requesterId: userId,
                    roomId: roomId
                });
            })

            socket.on('user-toggle-audio', (userId, roomId) => {
                socket.join(roomId)
                socket.broadcast.to(roomId).emit('user-toggle-audio', userId)
            })

            socket.on('user-toggle-video', (userId, roomId) => {
                socket.join(roomId)
                socket.broadcast.to(roomId).emit('user-toggle-video', userId)
            })
              // Handle direct video state updates
            socket.on('user-video-state', ({userId, roomId, playing}) => {
                console.log(`User ${userId} sending video state: playing=${playing}`)
                socket.join(roomId)
                
                // Broadcast the video state to everyone in the room
                socket.broadcast.to(roomId).emit('user-video-state', {
                    userId: userId,
                    playing: playing
                })
            })
            
            // Keep for backward compatibility
            socket.on('initial-state', ({userId, roomId, playing}) => {
                console.log(`User ${userId} sending initial state: playing=${playing}`)
                socket.join(roomId)
                
                // Broadcast the initial state to everyone in the room
                socket.broadcast.to(roomId).emit('user-video-state', {
                    userId: userId,
                    playing: playing
                })
            })

            socket.on('user-leave', (userId, roomId) => {
                socket.join(roomId)
                socket.broadcast.to(roomId).emit('user-leave', userId)
            })            // Handle joining a chat room specifically for chat messages
            socket.on('join-chat-room', (roomId, userId) => {
                console.log(`User ${userId} joining chat room ${roomId}`);
                // Ensure the user has joined the room
                socket.join(roomId);
                
                // Store user data in socket for reference
                socket.data.userId = userId;
                socket.data.roomId = roomId;
            });
            
            // Handle chat messages
            socket.on('send-message', (messageData) => {
                console.log(`message sent in room ${messageData.roomId} by ${messageData.sender}: ${messageData.content}`)
                
                // Make sure the socket has joined the room
                if (!socket.rooms.has(messageData.roomId)) {
                    socket.join(messageData.roomId);
                }
                
                // Send to everyone else in the room except the sender
                socket.to(messageData.roomId).emit('receive-message', {
                    content: messageData.content,
                    sender: messageData.sender,
                    timestamp: messageData.timestamp
                })
            })
        })
    }
    res.end();
}


export default SocketHandler;

