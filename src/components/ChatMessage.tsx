import React from 'react';
import { User, Bot } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex gap-3 p-4 ${message.isUser ? 'bg-gray-50' : 'bg-white'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        message.isUser 
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' 
          : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
      }`}>
        {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className={`prose prose-sm max-w-none ${
          message.isUser ? 'text-gray-800' : 'text-gray-800 text-base leading-relaxed'
        }`}>
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
        
        {/* Timestamp */}
        <div className="text-xs text-gray-500 mt-2">
          {message.timestamp.toLocaleTimeString('ar-SA', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;