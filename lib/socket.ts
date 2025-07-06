import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  timestamp: number;
  meeting_id: string;
  type: 'chat' | 'system';
}

interface TranscriptEntry {
  id: string;
  speaker: string;
  speakerId: string;
  text: string;
  timestamp: Date;
  confidence: number;
  meeting_id: string;
  audioSource?: 'local' | 'remote' | 'mixed';
}

export const initSocket = (res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...');
    
    const corsOrigin = process.env.SOCKET_IO_CORS_ORIGIN || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const isProduction = process.env.NODE_ENV === 'production';
    
    const io = new ServerIO(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: isProduction ? corsOrigin : "*",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Enhanced error handling
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Join meeting room
      socket.on('join-meeting', (meetingId: string, userData: { userId: string; userName: string }) => {
        try {
          socket.join(meetingId);
          console.log(`User ${userData.userName} joined meeting ${meetingId}`);
          
          // Notify others that user joined
          socket.to(meetingId).emit('user-joined', {
            userId: userData.userId,
            userName: userData.userName,
            socketId: socket.id
          });
        } catch (error) {
          console.error('Error joining meeting:', error);
          socket.emit('error', { message: 'Failed to join meeting' });
        }
      });

      // Handle chat messages
      socket.on('send-message', (data: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        try {
          if (!data.meeting_id || !data.user_name || !data.text?.trim()) {
            socket.emit('error', { message: 'Invalid message data' });
            return;
          }

          const message: ChatMessage = {
            ...data,
            id: `${data.user_id}-${Date.now()}`,
            timestamp: Date.now()
          };

          // Broadcast to all users in the meeting
          io.to(data.meeting_id).emit('new-message', message);
          
          // Send notification to other users
          socket.to(data.meeting_id).emit('message-notification', {
            userName: data.user_name,
            messagePreview: data.text.length > 50 ? data.text.substring(0, 50) + '...' : data.text
          });
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing-start', (data: { meeting_id: string; user_name: string }) => {
        socket.to(data.meeting_id).emit('user-typing', {
          userName: data.user_name,
          isTyping: true
        });
      });

      socket.on('typing-stop', (data: { meeting_id: string; user_name: string }) => {
        socket.to(data.meeting_id).emit('user-typing', {
          userName: data.user_name,
          isTyping: false
        });
      });

      // Handle transcript sharing
      socket.on('send-transcript', (data: Omit<TranscriptEntry, 'id' | 'timestamp'> & { meeting_id: string }) => {
        const transcript: TranscriptEntry = {
          ...data,
          id: `${data.speakerId}-${Date.now()}`,
          timestamp: new Date()
        };

        // Broadcast transcript to all users in the meeting
        io.to(data.meeting_id).emit('new-transcript', transcript);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });

      // Leave meeting room
      socket.on('leave-meeting', (meetingId: string, userData: { userId: string; userName: string }) => {
        socket.leave(meetingId);
        console.log(`User ${userData.userName} left meeting ${meetingId}`);
        
        // Notify others that user left
        socket.to(meetingId).emit('user-left', {
          userId: userData.userId,
          userName: userData.userName
        });
      });
    });

    res.socket.server.io = io;
  }
  
  return res.socket.server.io;
};
