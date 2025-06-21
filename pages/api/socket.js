import { Server } from "socket.io";

const SocketHandler = (req, res) => {
    console.log("called api")
    if (res.socket.server.io) {
        console.log("socket already running")
    } else {
        const io = new Server(res.socket.server)
        res.socket.server.io = io
    
        io.on('connection', (socket) => {
            console.log("server is connected")

            socket.on('join-room', (roomId, userId, userName) => {
                console.log(`a new user ${userName || userId} joined room ${roomId}`)
                // Store the user name in the socket object for later reference
                socket.userName = userName
                socket.userId = userId
                socket.roomId = roomId
                
                socket.join(roomId)
                // Send the join notification with userName
                socket.broadcast.to(roomId).emit('user-connected', userId, userName)
                
                // Also emit a system message for user joining
                const systemMessage = {
                    content: `${userName || 'A user'} has joined the meeting`,
                    senderId: 'system',
                    senderName: 'System',
                    timestamp: new Date().toISOString(),
                    isSystemMessage: true                
                }
                io.to(roomId).emit('new-message', systemMessage)
            })
            
            socket.on('user-toggle-audio', (userId, roomId) => {
                socket.join(roomId)
                socket.broadcast.to(roomId).emit('user-toggle-audio', userId)
            })
            
            socket.on('user-toggle-video', (userId, roomId, videoState) => {
                socket.join(roomId)
                // Always pass the explicit videoState in the event
                console.log(`Broadcasting video toggle: userId=${userId}, videoState=${videoState}`)
                socket.broadcast.to(roomId).emit('user-toggle-video', userId, videoState)
            })
            
            socket.on('user-leave', (userId, roomId, userName) => {
                socket.join(roomId)
                // Use the stored userName if available and not provided
                const userDisplayName = userName || socket.userName || `User ${userId.substring(0, 5)}`
                socket.broadcast.to(roomId).emit('user-leave', userId)
                
                // Send a system message for user leaving
                const systemMessage = {
                    content: `${userDisplayName} has left the meeting`,
                    senderId: 'system',
                    senderName: 'System',
                    timestamp: new Date().toISOString(),
                    isSystemMessage: true
                }
                io.to(roomId).emit('new-message', systemMessage)
            })
            
            // Handle disconnection properly
            socket.on('disconnect', () => {
                if (socket.userId && socket.roomId) {
                    const userDisplayName = socket.userName || `User ${socket.userId.substring(0, 5)}`
                    console.log(`User ${userDisplayName} disconnected from room ${socket.roomId}`)
                    
                    // Notify others about the leave
                    socket.broadcast.to(socket.roomId).emit('user-leave', socket.userId)
                    
                    // Send system message about disconnection
                    const systemMessage = {
                        content: `${userDisplayName} has left the meeting (disconnected)`,
                        senderId: 'system',
                        senderName: 'System',
                        timestamp: new Date().toISOString(),
                        isSystemMessage: true
                    }
                    io.to(socket.roomId).emit('new-message', systemMessage)
                }
            })
            
            // Chat functionality
            socket.on('send-message', (message, roomId) => {
                console.log(`Message in room ${roomId} from ${message.senderName || message.senderId}: ${message.content}`)
                socket.join(roomId)
                // Broadcast to everyone except sender
                socket.broadcast.to(roomId).emit('new-message', message)
            })
            
            // Screen sharing
            socket.on('screen-share', (data, roomId) => {
                console.log(`User ${data.userId} is ${data.sharing ? 'sharing' : 'stopped sharing'} their screen in room ${roomId}`)
                socket.join(roomId)
                socket.broadcast.to(roomId).emit('user-screen-share', data.userId, data.sharing)
                
                // Send a system message for screen sharing
                if (data.sharing) {
                    const systemMessage = {
                        content: `A user started sharing their screen`,
                        senderId: 'system',
                        senderName: 'System',
                        timestamp: new Date().toISOString(),
                        isSystemMessage: true
                    }
                    io.to(roomId).emit('new-message', systemMessage)
                }
            })
            
            // Reactions
            socket.on('reaction', (data, roomId) => {
                console.log(`User ${data.userId} sent a reaction ${data.emoji} in room ${roomId}`)
                socket.join(roomId)
                // Broadcast to everyone including sender (using io instead of socket.broadcast)
                io.to(roomId).emit('user-reaction', data.userId, data.emoji)
            })
            
            // Handle raise hand events
            socket.on('raise-hand', (data, roomId) => {
                console.log(`User ${data.userId} raised hand in room ${roomId}`)
                socket.join(roomId)
                
                // Broadcast hand raise to everyone
                io.to(roomId).emit('user-raised-hand', data.userId, data.userName)
                
                // Send system message for raised hand
                const systemMessage = {
                    content: `${data.userName || 'A user'} raised their hand`,
                    senderId: 'system',
                    senderName: 'System',
                    timestamp: new Date().toISOString(),
                    isSystemMessage: true
                }
                io.to(roomId).emit('new-message', systemMessage)
            })
            
            // Handle lower hand events
            socket.on('lower-hand', (data, roomId) => {
                console.log(`User ${data.userId} lowered hand in room ${roomId}`)
                socket.join(roomId)
                
                // Broadcast hand lowered to everyone
                io.to(roomId).emit('user-lowered-hand', data.userId)
            })
        })
    }
    res.end();
}

export default SocketHandler;

