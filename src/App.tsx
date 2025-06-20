import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatState } from './types';
import ChatHeader from './components/ChatHeader';
import WelcomeScreen from './components/WelcomeScreen';
import ChatMessage from './components/ChatMessage';
import TypingIndicator from './components/TypingIndicator';
import ChatInput from './components/ChatInput';

function App() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isTyping: false,
    currentInput: ''
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.isTyping]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // محاكاة استجابة الذكاء الاصطناعي
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = [
      `شكراً لك على سؤالك: "${userMessage}". هذا سؤال رائع! دعني أفكر في أفضل إجابة لك.`,
      `أفهم ما تقصده. بخصوص "${userMessage}"، يمكنني مساعدتك بعدة طرق مختلفة.`,
      `هذا موضوع مثير للاهتمام! "${userMessage}" يتطلب تفكيراً عميقاً، وإليك وجهة نظري...`,
      `ممتاز! سؤالك حول "${userMessage}" يفتح المجال لمناقشة شيقة. دعني أشاركك أفكاري.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true
    }));

    try {
      const aiResponse = await generateAIResponse(content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date()
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isTyping: false
      }));
    } catch (error) {
      setChatState(prev => ({
        ...prev,
        isTyping: false
      }));
    }
  };

  const handleNewChat = () => {
    setChatState({
      messages: [],
      isTyping: false,
      currentInput: ''
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const showWelcome = chatState.messages.length === 0 && !chatState.isTyping;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: 'Tajawal, sans-serif' }}>
      {/* Header */}
      <ChatHeader onNewChat={handleNewChat} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showWelcome ? (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {chatState.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {chatState.isTyping && <TypingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={chatState.isTyping}
        placeholder={showWelcome ? "ابدأ محادثتك هنا..." : "اكتب رسالتك هنا..."}
      />
    </div>
  );
}

export default App;