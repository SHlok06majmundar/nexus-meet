// Socket.io specific handler for Vercel
import { Server } from 'socket.io';

export default function handler(req, res) {
    // Return a basic response for health checks
    if (req.method === 'GET') {
        res.status(200).end();
        return;
    }
    
    // Initialize socket server if not already initialized
    if (!res.socket.server.io) {
        console.log('Socket.io server initializing from socketio.js handler');
        const io = new Server(res.socket.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            },
            transports: ['polling', 'websocket']
        });
        
        // Set up socket event handlers
        io.on('connection', (socket) => {
            console.log("socket connected from socketio.js handler");
            
            socket.on('join-room', (roomId, userId, userName) => {
                console.log(`a new user ${userName || userId} joined room ${roomId}`);
                socket.userName = userName;
                socket.userId = userId;
                socket.roomId = roomId;
                
                socket.join(roomId);
                socket.broadcast.to(roomId).emit('user-connected', userId, userName);
                
                // System message for user joining
                const systemMessage = {
                    content: `${userName || 'A user'} has joined the meeting`,
                    senderId: 'system',
                    senderName: 'System',
                    timestamp: new Date().toISOString(),
                };
                io.to(roomId).emit('chat-message', systemMessage);
            });
            
            // Handle disconnection
            socket.on('disconnect', () => {
                const { roomId, userName, userId } = socket;
                if (roomId) {
                    console.log(`User ${userName || userId} disconnected from room ${roomId}`);
                    socket.broadcast.to(roomId).emit('user-leave', userId, userName);
                    
                    // System message for user leaving
                    const systemMessage = {
                        content: `${userName || 'A user'} has left the meeting`,
                        senderId: 'system',
                        senderName: 'System',
                        timestamp: new Date().toISOString(),
                    };
                    socket.broadcast.to(roomId).emit('chat-message', systemMessage);
                }
            });
        });
        
        res.socket.server.io = io;
    }
    
    res.end();
}

export const config = {
    api: {
        bodyParser: false,
    },
};
