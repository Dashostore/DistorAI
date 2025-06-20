import React, { useState, useRef, useEffect } from 'react';
import { Send, Edit3 } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "اكتب رسالتك هنا..." 
}) => {
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (!message.trim()) {
      setIsEditing(false);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className={`relative flex items-end gap-3 p-3 border rounded-2xl transition-all duration-200 ${
          isEditing || message.trim() 
            ? 'border-indigo-300 bg-white shadow-sm' 
            : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-gray-400'
        }`}>
          
          {/* Edit Icon */}
          <div className={`flex-shrink-0 transition-colors duration-200 ${
            isEditing || message.trim() ? 'text-indigo-500' : 'text-gray-400'
          }`}>
            <Edit3 className="w-5 h-5" />
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 resize-none border-none outline-none bg-transparent text-gray-800 placeholder-gray-500 min-h-[24px] max-h-[120px] leading-6"
            rows={1}
            style={{ direction: 'rtl' }}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              message.trim() && !disabled
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Character count or hint */}
        {(isEditing || message.trim()) && (
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>اضغط Enter للإرسال، Shift+Enter لسطر جديد</span>
            <span>{message.length}/2000</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatInput;