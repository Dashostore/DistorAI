import React from 'react';
import { MessageCircle, Lightbulb, BookOpen, Code, Heart } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuggestionClick }) => {
  const suggestions = [
    {
      icon: <Lightbulb className="w-5 h-5" />,
      text: "اعطني فكرة إبداعية لمشروع جديد",
      prompt: "اعطني فكرة إبداعية لمشروع جديد"
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      text: "ساعدني في تعلم شيء جديد اليوم",
      prompt: "ساعدني في تعلم شيء جديد اليوم"
    },
    {
      icon: <Code className="w-5 h-5" />,
      text: "أريد مساعدة في البرمجة",
      prompt: "أريد مساعدة في البرمجة"
    },
    {
      icon: <Heart className="w-5 h-5" />,
      text: "أخبرني نصيحة لتحسين يومي",
      prompt: "أخبرني نصيحة لتحسين يومي"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      {/* Logo and Welcome */}
      <div className="mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
          <MessageCircle className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          أهلاً بك في DistorAI
        </h1>
        <p className="text-gray-600 text-lg">
          ماذا تفكر اليوم؟ أنا هنا لمساعدتك
        </p>
      </div>

      {/* Suggestions */}
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          اقتراحات للبدء:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200 text-right"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center text-indigo-600 group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                  {suggestion.icon}
                </div>
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                  {suggestion.text}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-8 text-sm text-gray-500">
        أو اكتب سؤالك في الأسفل للبدء
      </div>
    </div>
  );
};

export default WelcomeScreen;