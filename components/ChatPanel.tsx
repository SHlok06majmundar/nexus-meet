'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCallStateHooks } from '@stream-io/video-react-sdk';
import { Send, Smile, Bell, BellOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useSocket } from '@/providers/SocketProvider';
import { useToast } from './ui/use-toast';
import { useParams } from 'next/navigation';

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  timestamp: number;
  meeting_id: string;
  type: 'chat' | 'system';
}

const ChatPanel = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const { socket, isConnected } = useSocket();
  const { toast } = useToast();
  const params = useParams();
  const meetingId = params?.id as string;

  // SSR safety check
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.IO connection for this meeting
  useEffect(() => {
    if (!isMounted || !socket || !isConnected || !localParticipant || !meetingId) return;

    // Join meeting room
    socket.emit('join-meeting', meetingId, {
      userId: localParticipant.userId,
      userName: localParticipant.name || localParticipant.userId,
    });

    // Listen for new messages
    socket.on('new-message', (message: ChatMessage) => {
      setMessages((prev) => {
        // Prevent duplicate messages
        if (prev.some((msg) => msg.id === message.id)) return prev;
        return [...prev, message];
      });

      // Increment unread count if message is not from current user
      if (message.user_id !== localParticipant.userId) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    // Listen for message notifications
    socket.on(
      'message-notification',
      (data: { userName: string; messagePreview: string }) => {
        if (notificationsEnabled && data.userName !== localParticipant.name) {
          toast({
            title: `New message from ${data.userName}`,
            description: data.messagePreview,
            duration: 3000,
          });

          // Browser notification if permission granted
          if (Notification.permission === 'granted') {
            try {
              const notification = new Notification(
                `New message from ${data.userName}`,
                {
                  body: data.messagePreview,
                  icon: '/icons/logo.svg',
                }
              );
              // Optional: auto-close after 5 seconds
              setTimeout(() => notification.close(), 5000);
            } catch (error) {
              console.log('Notification failed:', error);
            }
          }
        }
      }
    );

    // Listen for typing indicators
    socket.on(
      'user-typing',
      (data: { userName: string; isTyping: boolean }) => {
        if (data.userName !== localParticipant.name) {
          setTypingUsers((prev) => {
            if (data.isTyping) {
              return [
                ...prev.filter((u) => u !== data.userName),
                data.userName,
              ];
            } else {
              return prev.filter((u) => u !== data.userName);
            }
          });
        }
      }
    );

    // Listen for user join/leave events
    socket.on('user-joined', (data: { userId: string; userName: string }) => {
      const systemMessage: ChatMessage = {
        id: `system-join-${Date.now()}`,
        user_id: 'system',
        user_name: 'System',
        text: `${data.userName} joined the meeting`,
        timestamp: Date.now(),
        meeting_id: meetingId,
        type: 'system',
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    socket.on('user-left', (data: { userId: string; userName: string }) => {
      const systemMessage: ChatMessage = {
        id: `system-leave-${Date.now()}`,
        user_id: 'system',
        user_name: 'System',
        text: `${data.userName} left the meeting`,
        timestamp: Date.now(),
        meeting_id: meetingId,
        type: 'system',
      };
      setMessages((prev) => [...prev, systemMessage]);
    });

    // Cleanup
    return () => {
      socket.off('new-message');
      socket.off('message-notification');
      socket.off('user-typing');
      socket.off('user-joined');
      socket.off('user-left');
      socket.emit('leave-meeting', meetingId, {
        userId: localParticipant.userId,
        userName: localParticipant.name || localParticipant.userId,
      });
    };
  }, [
    isMounted,
    socket,
    isConnected,
    localParticipant,
    meetingId,
    notificationsEnabled,
    toast,
  ]);

  // Request notification permission on mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Handle input changes with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!socket || !isConnected || !localParticipant) return;

    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      socket.emit('typing-start', {
        meeting_id: meetingId,
        user_name: localParticipant.name || localParticipant.userId,
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing indicator after 1 second of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing-stop', {
        meeting_id: meetingId,
        user_name: localParticipant.name || localParticipant.userId,
      });
    }, 1000);
  };
  // Send message
  const sendMessage = async () => {
    if (
      !newMessage.trim() ||
      !socket ||
      !isConnected ||
      !localParticipant ||
      !meetingId
    )
      return;

    const messageData = {
      user_id: localParticipant.userId,
      user_name: localParticipant.name || localParticipant.userId,
      text: newMessage.trim(),
      meeting_id: meetingId,
      type: 'chat' as const,
    };

    try {
      // Send message via Socket.IO
      socket.emit('send-message', messageData);

      setNewMessage('');
      setUnreadCount(0); // Reset unread count when user sends a message

      // Stop typing indicator
      setIsTyping(false);
      socket.emit('typing-stop', {
        meeting_id: meetingId,
        user_name: localParticipant.name || localParticipant.userId,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get user color based on user ID
  const getUserColor = (userId: string) => {
    const colors = [
      'text-blue-400',
      'text-purple-400',
      'text-green-400',
      'text-yellow-400',
      'text-pink-400',
      'text-cyan-400',
      'text-orange-400',
    ];
    const index = userId
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  // Clear unread count when panel is focused
  const handleFocus = () => {
    setUnreadCount(0);
  };

  return (
    <div
      className="flex size-full flex-col bg-gradient-to-b from-dark-1 to-dark-2"
      onClick={handleFocus}
    >
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-r from-purple-1/20 to-pink-1/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              Live Chat
              {unreadCount > 0 && (
                <span className="min-w-[20px] rounded-full bg-red-500 px-2 py-1 text-center text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </h3>
            <p className="text-sm text-white/60">
              Real-time messaging with notifications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className="text-white/60 hover:text-white"
            >
              {notificationsEnabled ? (
                <Bell size={16} />
              ) : (
                <BellOff size={16} />
              )}
            </Button>
            <div
              className={`flex items-center gap-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}
            >
              <div
                className={`size-2 rounded-full ${isConnected ? 'animate-pulse bg-green-400' : 'bg-red-400'}`}
              ></div>
              <span className="text-xs">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-4xl">💬</div>
              <p className="text-sm text-white/60">
                No messages yet. Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="flex flex-col">
                {message.type === 'system' ? (
                  <div className="flex justify-center">
                    <div className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
                      {message.text}
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className={`flex ${message.user_id === localParticipant?.userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                          message.user_id === localParticipant?.userId
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        {message.user_id !== localParticipant?.userId && (
                          <p
                            className={`mb-1 text-xs font-medium ${getUserColor(message.user_id)}`}
                          >
                            {message.user_name}
                          </p>
                        )}
                        <p className="break-words text-sm">{message.text}</p>
                      </div>
                    </div>
                    <p
                      className={`mt-1 text-xs text-white/40 ${
                        message.user_id === localParticipant?.userId
                          ? 'text-right'
                          : 'text-left'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="flex gap-1">
                  <div className="size-1 animate-bounce rounded-full bg-white/60 [animation-delay:0ms]"></div>
                  <div className="size-1 animate-bounce rounded-full bg-white/60 [animation-delay:150ms]"></div>
                  <div className="size-1 animate-bounce rounded-full bg-white/60 [animation-delay:300ms]"></div>
                </div>
                <p className="text-xs text-white/60">
                  {typingUsers.join(', ')}{' '}
                  {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-white/10 bg-gradient-to-r from-dark-1 to-dark-2 p-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? 'Type a message...' : 'Connecting...'}
              disabled={!isConnected}
              className="border-white/20 bg-white/10 pr-10 text-white placeholder:text-white/50 focus:border-blue-400 disabled:opacity-50"
            />
            <button
              title="Add emoji"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 disabled:opacity-50"
              disabled={!isConnected}
            >
              <Smile size={16} />
            </button>
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-white/40">
          <span>Press Enter to send • Socket.IO real-time messaging</span>
          {notificationsEnabled && (
            <span className="text-green-400">🔔 Notifications enabled</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
