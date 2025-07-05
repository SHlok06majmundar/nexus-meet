'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { Send, Smile } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  timestamp: number;
  type: 'chat' | 'system';
}

const ChatPanel = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const call = useCall();
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for custom events (chat messages)
  useEffect(() => {
    if (!call) return;

    const handleCustomEvent = (event: any) => {
      if (event.type === 'chat_message') {
        const message: ChatMessage = {
          id: event.custom.id || Date.now().toString(),
          user_id: event.user.id,
          user_name: event.user.name || event.user.id,
          text: event.custom.text,
          timestamp: Date.now(),
          type: 'chat'
        };
        setMessages(prev => [...prev, message]);
      } else if (event.type === 'user_typing') {
        const userId = event.user.id;
        const userName = event.user.name || event.user.id;
        
        if (event.custom.typing && userId !== localParticipant?.userId) {
          setTypingUsers(prev => [...prev.filter(u => u !== userName), userName]);
          // Remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => u !== userName));
          }, 3000);
        } else {
          setTypingUsers(prev => prev.filter(u => u !== userName));
        }
      }
    };

    // Subscribe to custom events
    call.on('custom', handleCustomEvent);

    return () => {
      call.off('custom', handleCustomEvent);
    };
  }, [call, localParticipant?.userId]);

  // Send typing indicator
  const sendTypingIndicator = (typing: boolean) => {
    if (!call || !localParticipant) return;
    
    call.sendCustomEvent({
      type: 'user_typing',
      typing
    });
  };

  // Handle input changes with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      sendTypingIndicator(true);
      
      // Stop typing indicator after 1 second of no typing
      setTimeout(() => {
        setIsTyping(false);
        sendTypingIndicator(false);
      }, 1000);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !call || !localParticipant) return;

    const messageId = `${localParticipant.userId}-${Date.now()}`;
    
    try {
      // Send message as custom event
      await call.sendCustomEvent({
        type: 'chat_message',
        id: messageId,
        text: newMessage.trim()
      });

      // Add message locally immediately for better UX
      const message: ChatMessage = {
        id: messageId,
        user_id: localParticipant.userId,
        user_name: localParticipant.name || localParticipant.userId,
        text: newMessage.trim(),
        timestamp: Date.now(),
        type: 'chat'
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Stop typing indicator
      setIsTyping(false);
      sendTypingIndicator(false);
    } catch (error) {
      console.error('Failed to send message:', error);
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
      minute: '2-digit' 
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
      'text-orange-400'
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className="flex size-full flex-col bg-gradient-to-b from-dark-1 to-dark-2">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-r from-purple-1/20 to-pink-1/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Live Chat</h3>
            <p className="text-sm text-white/60">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs text-green-400">Real-time</span>
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
                <div className={`flex ${message.user_id === localParticipant?.userId ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    message.user_id === localParticipant?.userId 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'bg-white/10 text-white'
                  }`}>
                    {message.user_id !== localParticipant?.userId && (
                      <p className={`mb-1 text-xs font-medium ${getUserColor(message.user_id)}`}>
                        {message.user_name}
                      </p>
                    )}
                    <p className="text-sm break-words">{message.text}</p>
                  </div>
                </div>
                <p className={`mt-1 text-xs text-white/40 ${
                  message.user_id === localParticipant?.userId ? 'text-right' : 'text-left'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
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
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
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
              placeholder="Type a message..."
              className="border-white/20 bg-white/10 pr-10 text-white placeholder:text-white/50 focus:border-blue-400"
            />
            <button 
              title="Add emoji"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80"
            >
              <Smile size={16} />
            </button>
          </div>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </Button>
        </div>
        <p className="mt-2 text-xs text-white/40">
          Press Enter to send • Real-time messaging
        </p>
      </div>
    </div>
  );
};

export default ChatPanel;
