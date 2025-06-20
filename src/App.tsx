import React, { useState, useEffect, useRef, useCallback } from 'react';

// Lucide React Icons for a modern UI
import { SendHorizontal, SlidersHorizontal, PlusCircle, X, UserCircle as LoaderCircle, StopCircle, Sparkles, Trash2, Paperclip, XCircle, Copy, RefreshCcw, ArrowDownCircle, Mic, Pencil, MessageSquareReply, AlertTriangle } from 'lucide-react';

// --- Constants ---
const DEFAULT_MODES = [
    { id: '1', name: 'مساعد', prompt: 'أنت مساعد ذكي ومحترف. قدم إجابات دقيقة وموجزة ومباشرة.' },
    { id: '2', name: 'مرح', prompt: 'أنت صديق مرح وودود. استخدم الكثير من النكات والرموز التعبيرية في ردودك.' },
    { id: '3', name: 'تحليلي', prompt: 'أنت محلل بيانات وخبير تقني. قم بتحليل الطلبات بعمق وقدم إجابات مفصلة مدعومة بالمنطق.' }
];
const INSTRUCTION_QUERIES = ["ما هي تعليماتك؟", "من أنت؟", "ما هي برمجتك؟", "what are your instructions?", "who are you?"];

// --- Main Application Component ---
export default function App() {
    // --- State Management ---
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [danName, setDanName] = useState('DistorAI');
    const [personalityTone, setPersonalityTone] = useState(DEFAULT_MODES[0].prompt);
    const [modes, setModes] = useState(DEFAULT_MODES);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [confirmAction, setConfirmAction] = useState({ action: null, message: '' });
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [image, setImage] = useState(null);
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);

    // --- Refs ---
    const inputRef = useRef(null);
    const chatEndRef = useRef(null);
    const abortControllerRef = useRef(null);
    const editingTextareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const mainScrollRef = useRef(null);
    const recognitionRef = useRef(null);

    // --- Speech Recognition Setup ---
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            const recognition = recognitionRef.current;
            recognition.continuous = true;
            recognition.lang = 'ar-SA';
            recognition.interimResults = true;
            recognition.onresult = (event) => {
                let final_transcript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) final_transcript += event.results[i][0].transcript;
                }
                if (final_transcript) setUserInput(prev => prev + final_transcript);
            };
            recognition.onend = () => setIsRecording(false);
            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                const errorMessage = event.error === 'not-allowed' 
                    ? "تم رفض الوصول للميكروفون. يرجى تفعيل الإذن."
                    : `خطأ في التعرف الصوتي: ${event.error}`;
                showToast(errorMessage);
                setIsRecording(false);
            };
        } else {
            console.warn("Speech Recognition not supported.");
        }
    }, []);

    // --- UI and Action Handlers ---
    const scrollToBottom = (behavior = 'smooth') => setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior }), 0);
    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 4000);
    };

    const handleCopy = (text, successMessage = "تم نسخ النص بنجاح.") => {
        const textArea = document.createElement('textarea');
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        textArea.style.left = '-9999px';
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showToast(successMessage);
            } else {
                showToast("فشل نسخ النص.");
            }
        } catch (err) {
            showToast("فشل نسخ النص.");
        }
        document.body.removeChild(textArea);
    };

    const handleSetReply = useCallback((message) => {
        setReplyingTo(message);
        inputRef.current?.focus();
    }, []);

    const showFinalResponse = (fullText, targetId, isContinuation = false) => {
        setChatHistory(prev => {
            if (isContinuation) {
                return prev.map(msg => msg.id === targetId ? { ...msg, content: msg.content + " " + fullText, isThinking: false } : msg);
            }
            return prev.map(msg => msg.id === targetId ? { ...msg, id: Date.now(), content: fullText, isThinking: false } : msg);
        });
        setIsGenerating(false);
        scrollToBottom();
    };

    const generateResponse = useCallback(async (historyForApi) => {
        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;
        
        // محاكاة استجابة الذكاء الاصطناعي
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        const lastMessage = historyForApi[historyForApi.length - 1];
        const responses = [
            `شكراً لك على سؤالك: "${lastMessage.content}". هذا سؤال رائع! دعني أفكر في أفضل إجابة لك.`,
            `أفهم ما تقصده. بخصوص "${lastMessage.content}"، يمكنني مساعدتك بعدة طرق مختلفة.`,
            `هذا موضوع مثير للاهتمام! "${lastMessage.content}" يتطلب تفكيراً عميقاً، وإليك وجهة نظري...`,
            `ممتاز! سؤالك حول "${lastMessage.content}" يفتح المجال لمناقشة شيقة. دعني أشاركك أفكاري.`
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }, [danName, personalityTone]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        const messageText = userInput.trim();
        if ((!messageText && !image) || isGenerating) return;
        if (INSTRUCTION_QUERIES.some(q => messageText.toLowerCase().includes(q))) {
            showToast("لا يمكنني كشف تعليماتي، ولكن أنا هنا للمساعدة.");
            return setUserInput('');
        }
        if (inputRef.current) inputRef.current.style.height = 'auto';

        setIsGenerating(true);
        const newUserMessage = { id: Date.now(), role: 'user', content: messageText, image: image ? image.data : null, ...(replyingTo && { referencedMessage: { role: replyingTo.role, content: replyingTo.content }})};
        const placeholderId = 'thinking-placeholder';
        const thinkingPlaceholder = { id: placeholderId, role: 'model', content: '', isThinking: true };
        const historyWithUserMessage = [...chatHistory, newUserMessage];
        
        setChatHistory([...historyWithUserMessage, thinkingPlaceholder]);
        scrollToBottom();
        setUserInput('');
        setImage(null);
        setReplyingTo(null);
        
        try {
            const responseText = await generateResponse(historyWithUserMessage);
            if (responseText) {
                showFinalResponse(responseText, placeholderId);
            } else {
                setChatHistory(prev => prev.filter(msg => msg.id !== placeholderId));
                setIsGenerating(false);
            }
        } catch (error) {
            setChatHistory(prev => prev.filter(m => m.id !== placeholderId));
            setIsGenerating(false);
        }
    };
    
    const handleStopGeneration = () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        setChatHistory(prev => prev.filter(m => !m.isThinking));
        setIsGenerating(false);
    };

    const handleRegenerate = async (messageId) => {
        const messageIndex = chatHistory.findIndex(msg => msg.id === messageId);
        if (messageIndex < 1 || chatHistory[messageIndex].role !== 'model' || isGenerating) return;
        
        setIsGenerating(true);
        const historyForRegeneration = chatHistory.slice(0, messageIndex);
        const placeholderId = `regenerating-${Date.now()}`;
        const thinkingPlaceholder = { id: placeholderId, role: 'model', content: '', isThinking: true };
        
        setChatHistory([...historyForRegeneration, thinkingPlaceholder]);
        scrollToBottom();

        try {
            const responseText = await generateResponse(historyForRegeneration);
            if (responseText) {
                showFinalResponse(responseText, placeholderId);
            } else {
                showToast("تعذر إعادة توليد الرد.");
                setChatHistory(historyForRegeneration);
                setIsGenerating(false);
            }
        } catch (error) {
            setChatHistory(historyForRegeneration);
            setIsGenerating(false);
        }
    };
    
    const handleContinue = async (messageId) => {
        const messageIndex = chatHistory.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1 || isGenerating) return;
        
        const originalMessage = chatHistory[messageIndex];
        const editedText = originalMessage.content.trim();
        
        if (!editedText || /[.?!]$/.test(editedText)) {
            showToast("لا يمكن الإكمال. أزل علامة الترقيم النهائية أو تأكد أن النص ليس فارغًا.");
            return;
        }
        
        setIsGenerating(true);
        const historyForContinuation = [ ...chatHistory.slice(0, messageIndex + 1) ];
        const placeholderId = messageId; 
        
        setChatHistory(prev => prev.map(m => m.id === placeholderId ? { ...m, isThinking: true } : m));
        scrollToBottom();
        
        try {
            const responseText = await generateResponse(historyForContinuation);
            if (responseText) {
                showFinalResponse(responseText, placeholderId, true);
            } else {
                showToast("تعذر إكمال النص.");
                setChatHistory(prev => prev.map(m => m.id === placeholderId ? { ...m, isThinking: false } : m));
                setIsGenerating(false);
            }
        } catch (error) {
            setChatHistory(prev => prev.map(m => m.id === placeholderId ? { ...m, isThinking: false } : m));
            setIsGenerating(false);
        }
    };

    const handleEdit = (message) => {
        setEditingMessageId(message.id);
        setEditingText(message.content);
    };
    
    useEffect(() => {
        if (editingMessageId && editingTextareaRef.current) {
            const textarea = editingTextareaRef.current;
            setTimeout(() => {
                textarea.style.height = 'auto';
                textarea.style.height = `${textarea.scrollHeight}px`;
                textarea.focus();
                textarea.select();
            }, 0);
        }
    }, [editingMessageId]);

    const handleSaveAiEdit = () => {
        if (!editingMessageId) return;
        setChatHistory(prev => prev.map(msg => msg.id === editingMessageId ? { ...msg, content: editingText, isUserEdited: true } : msg));
        setEditingMessageId(null);
    };

    const handleSaveUserEditAndRegenerate = async () => {
        if (!editingMessageId || isGenerating) return;
    
        const editedMessageIndex = chatHistory.findIndex(msg => msg.id === editingMessageId);
        if (editedMessageIndex === -1) return;
    
        const updatedHistory = chatHistory.slice(0, editedMessageIndex + 1).map((msg, index) => {
            if (index === editedMessageIndex) {
                return { ...msg, content: editingText, isUserEdited: true };
            }
            return msg;
        });
    
        setEditingMessageId(null);
        setEditingText('');
        setIsGenerating(true);
    
        const placeholderId = 'thinking-after-edit';
        const thinkingPlaceholder = { id: placeholderId, role: 'model', content: '', isThinking: true };
    
        setChatHistory([...updatedHistory, thinkingPlaceholder]);
        scrollToBottom();
    
        try {
            const responseText = await generateResponse(updatedHistory);
            if (responseText) {
                showFinalResponse(responseText, placeholderId);
            } else {
                showToast("تعذر إعادة توليد الرد.");
                setChatHistory(updatedHistory);
                setIsGenerating(false);
            }
        } catch (error) {
            showToast("حدث خطأ غير متوقع.");
            setChatHistory(updatedHistory);
            setIsGenerating(false);
        }
    };

    const handleNewChat = () => {
        setConfirmAction({
            action: () => {
                setChatHistory([]);
                showToast("تم بدء محادثة جديدة بنجاح.");
            },
            message: "هل أنت متأكد؟ سيتم حذف سجل المحادثة الحالية نهائيًا."
        });
        setIsConfirmOpen(true);
    };
    
    const handleUserInput = (e) => {
        const value = e.target.value;
        setUserInput(value);
        setShowSuggestions(value.endsWith('/'));
    }

    const selectMode = (mode) => {
        setPersonalityTone(mode.prompt);
        showToast(`تم تفعيل وضع: ${mode.name}`);
        setUserInput('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage({ data: reader.result, type: file.type });
            reader.readAsDataURL(file);
        }
    };
    
    const handleMicClick = () => {
        if (!recognitionRef.current) return;
        if (isRecording) recognitionRef.current.stop();
        else recognitionRef.current.start();
        setIsRecording(!isRecording);
    };

    const handleScroll = () => {
        if (mainScrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = mainScrollRef.current;
            setShowScrollButton(scrollTop < scrollHeight - clientHeight - 150);
        }
    };
    
    const formatDateSeparator = (date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const localeString = 'ar-EG';
        if (date.toDateString() === today.toDateString()) return "اليوم";
        if (date.toDateString() === yesterday.toDateString()) return "الأمس";
        return date.toLocaleDateString(localeString, { day: 'numeric', month: 'long', year: 'numeric' });
    };

    let lastMessageDate = null;
    const lastUserMessageIndex = chatHistory.map(m => m.role).lastIndexOf('user');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-400">
                <LoaderCircle size={48} className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-slate-900 text-slate-200 font-sans antialiased">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
                body { background: #020617; font-family: 'Tajawal', sans-serif; }
                .chat-bg {
                    background-color: #0f172a;
                    background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0);
                    background-size: 2rem 2rem;
                }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background-color: rgba(71, 85, 105, 0.5); border-radius: 20px; }
                ::-webkit-scrollbar-thumb:hover { background-color: rgba(100, 116, 139, 0.5); }
                .fade-in { animation: fadeIn 0.3s ease-in-out forwards; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .fade-in-up { animation: fadeInUp 0.4s ease-in-out forwards; }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .blurry-fade-in-effect { animation: blurry-fade-in 0.4s ease-out forwards; }
                @keyframes blurry-fade-in { from { filter: blur(5px); opacity: 0; } to { filter: blur(0px); opacity: 1; } }
                .gradient-text { background: -webkit-linear-gradient(45deg, #6366f1, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .markdown-content table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
                .markdown-content th, .markdown-content td { border: 1px solid #475569; padding: 0.5rem 1rem; }
                .markdown-content th { background-color: #1e293b; }
                .markdown-content ul, .markdown-content ol { padding-right: 2rem; }
                .markdown-content[dir="ltr"] ul, .markdown-content[dir="ltr"] ol { padding-left: 2rem; padding-right: 0; }
                .markdown-content a { color: #60a5fa; }
                .markdown-content a:hover { text-decoration: underline; }
                .referenced-message-preview {
                    background-color: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(5px);
                    border-top: 1px solid #334155;
                    padding: 8px 16px;
                    transition: all 0.3s ease;
                }
                .referenced-message-bubble {
                    background-color: rgba(255, 255, 255, 0.05);
                    padding: 8px 12px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    border-inline-start: 3px solid #4f46e5;
                }
                 .markdown-content pre {
                    background-color: black !important;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    font-size: 0.8rem;
                    line-height: 1.4;
                    overflow-x: auto;
                    position: relative;
                }
                .markdown-content p:not(:last-child),
                .markdown-content ul:not(:last-child),
                .markdown-content ol:not(:last-child),
                .markdown-content blockquote:not(:last-child),
                .relative.group:not(:last-child) {
                    margin-bottom: 1rem;
                }
            `}</style>

            <header className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900/70 backdrop-blur-xl sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <img src="https://i.postimg.cc/C1XZ9rsn/Chat-GPT-Image-9-2025-04-55-20.png" alt="DistorAI Logo" className="w-8 h-8 rounded-full flex-shrink-0" />
                    <h1 className="text-xl font-bold tracking-tight text-slate-50">{danName}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleNewChat} title="محادثة جديدة" className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-all active:scale-95"><PlusCircle size={20} /></button>
                    <button onClick={() => setIsSettingsOpen(true)} title="تخصيص" className="p-2 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-all active:scale-95"><SlidersHorizontal size={20} /></button>
                </div>
            </header>
            
            <div className="flex-1 relative overflow-hidden chat-bg">
                <main ref={mainScrollRef} onScroll={handleScroll} className="absolute inset-0 overflow-y-auto w-full px-4 md:px-8 py-6">
                    <div className="max-w-4xl mx-auto space-y-8 pb-4">
                        {chatHistory.length === 0 && !isGenerating ? (
                            <WelcomeScreen danName={danName} onSuggestionClick={(suggestion) => {
                                setUserInput(suggestion);
                                handleSendMessage();
                            }} />
                        ) : (
                            chatHistory.map((msg, index) => {
                                const isPlaceholder = isNaN(msg.id);
                                const currentDate = isPlaceholder ? null : new Date(msg.id);
                                const showDateSeparator = currentDate && (!lastMessageDate || currentDate.toDateString() !== lastMessageDate.toDateString());
                                if(currentDate) { lastMessageDate = currentDate; }

                                return (
                                    <React.Fragment key={msg.id || `msg-${index}`}>
                                        {showDateSeparator && (
                                            <div className="relative text-center my-8 fade-in">
                                                <hr className="absolute top-1/2 left-0 w-full border-slate-700/50"/>
                                                <span className="relative bg-slate-800 px-3 text-xs font-medium text-slate-400 rounded-full">{formatDateSeparator(currentDate)}</span>
                                            </div>
                                        )}
                                        <MessageBubble 
                                            msg={msg} 
                                            danName={danName}
                                            onReply={handleSetReply}
                                            onEdit={handleEdit} 
                                            onRegenerate={handleRegenerate} 
                                            onContinue={handleContinue} 
                                            onCopy={handleCopy} 
                                            isGenerating={isGenerating} 
                                            editingMessageId={editingMessageId}
                                            editingText={editingText}
                                            setEditingText={setEditingText}
                                            handleSaveAiEdit={handleSaveAiEdit}
                                            handleSaveUserEditAndRegenerate={handleSaveUserEditAndRegenerate}
                                            setEditingMessageId={setEditingMessageId}
                                            editingTextareaRef={editingTextareaRef}
                                            isLastUserMessage={msg.role === 'user' && index === lastUserMessageIndex}
                                        />
                                    </React.Fragment>
                                )
                            })
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </main>
                 <button onClick={() => scrollToBottom('smooth')} className={`absolute bottom-28 md:bottom-24 right-6 md:right-8 p-3 bg-slate-900/50 backdrop-blur-lg border border-slate-700/50 hover:bg-slate-800/70 rounded-full text-white shadow-lg transition-all duration-300 ease-in-out ${showScrollButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`} title="الانتقال للأسفل">
                    <ArrowDownCircle size={24} />
                </button>
            </div>

            <footer className="relative w-full px-4 md:px-8 bg-slate-900/70 backdrop-blur-xl">
                 {replyingTo && (
                    <div className="max-w-4xl mx-auto referenced-message-preview flex justify-between items-center fade-in-up">
                        <div className="overflow-hidden min-w-0">
                            <div className="flex items-center gap-2 text-indigo-400">
                                <MessageSquareReply size={16} />
                                <p className="text-sm font-bold">الرد على {replyingTo.role === 'user' ? "أنت" : danName}</p>
                            </div>
                            <p className="text-xs text-slate-300 truncate">{replyingTo.content}</p>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="p-2 text-slate-400 hover:text-white flex-shrink-0"><X size={18}/></button>
                    </div>
                )}
                
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-2 p-2 pt-3 pb-4">
                    <button type="button" onClick={() => fileInputRef.current.click()} title="إرفاق صورة" className="p-2.5 text-slate-400 hover:text-indigo-400 transition-colors flex-shrink-0"><Paperclip size={20} /></button>
                    <div className="flex-1 relative bg-slate-800 rounded-2xl border border-slate-700/50 focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-lg">
                         <textarea ref={inputRef} value={userInput} onChange={handleUserInput} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} placeholder="اسأل أي شيء... أو استخدم /" className="w-full bg-transparent p-3 pr-12 resize-none outline-none text-slate-200 placeholder:text-slate-500 disabled:opacity-50" dir="auto" rows="1" onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} disabled={isGenerating}/>
                         {image && (
                            <div className="absolute -top-20 left-0 p-1 bg-slate-700/80 rounded-lg"><img src={image.data} alt="Preview" onClick={() => setFullscreenImage(image.data)} className="h-16 w-16 object-cover rounded cursor-pointer" /><button onClick={() => setImage(null)} className="absolute top-0 right-0 -mt-2 -mr-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><XCircle size={20} /></button></div>
                        )}
                         <button type="button" onClick={handleMicClick} title="إدخال صوتي" className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-indigo-400'}`}><Mic size={20} /></button>
                    </div>
                    {isGenerating ? (
                        <button type="button" onClick={handleStopGeneration} title="إيقاف التوليد" className="p-3 bg-red-600 rounded-full text-white hover:bg-red-500 transition-colors active:scale-95 flex-shrink-0"><StopCircle size={20} /></button>
                    ) : (
                        <button type="submit" disabled={(!userInput.trim() && !image)} title="إرسال" className="p-3 bg-indigo-600 rounded-full text-white hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 transition-colors active:scale-95 flex-shrink-0"><SendHorizontal size={20} /></button>
                    )}
                     <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                </form>
                 {showSuggestions && (
                    <div className="absolute bottom-full mb-2 w-full left-0 right-0 px-4 md:px-8">
                        <div className="max-w-4xl mx-auto bg-slate-800/90 backdrop-blur-lg border border-slate-700 rounded-xl shadow-2xl overflow-hidden fade-in-up">
                            <p className="text-xs text-slate-400 p-3 border-b border-slate-700 text-right">اختر وضعًا:</p>
                            <ul className="max-h-48 overflow-y-auto">
                                {modes.map((mode, index) => (
                                    <li key={mode.id}><button onClick={() => selectMode(mode)} className={`w-full text-right p-3 hover:bg-slate-700/50 transition-colors duration-150 flex justify-between items-center ${index > 0 ? 'border-t border-slate-700/50' : ''}`}><span className="font-semibold text-indigo-400">{mode.name}</span><span className="text-xs text-slate-400 truncate max-w-[60%] text-left">{mode.prompt}</span></button></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </footer>

            {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} currentDanName={danName} setCurrentDanName={setDanName} currentModes={modes} setCurrentModes={setModes} showToast={showToast} />}
            {fullscreenImage && (<div onClick={() => setFullscreenImage(null)} className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 fade-in"><img src={fullscreenImage} alt="Fullscreen preview" className="max-w-[90vw] max-h-[90vh] object-contain"/><button onClick={() => setFullscreenImage(null)} className="absolute top-5 right-5 p-2 bg-white/20 rounded-full text-white hover:bg-white/30"><X size={30} /></button></div>)}
            {isConfirmOpen && (<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 fade-in"><div className="bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 w-full max-w-sm shadow-2xl border border-slate-700 text-right"><h2 className="text-lg font-bold mb-4">تأكيد الإجراء</h2><p className="text-slate-300 mb-6">{confirmAction.message}</p><div className="flex justify-end gap-3"><button onClick={() => setIsConfirmOpen(false)} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md">إلغاء</button><button onClick={() => { if (confirmAction.action) confirmAction.action(); setIsConfirmOpen(false); }} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md">تأكيد</button></div></div></div>)}
            
            {toastMessage && (
                <div className="fixed inset-x-0 bottom-28 md:bottom-24 flex justify-center items-center z-50 pointer-events-none">
                    <div className="bg-slate-800 text-slate-100 px-4 py-2 rounded-lg shadow-lg text-sm border border-slate-700 fade-in-up pointer-events-auto">
                        {toastMessage}
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Welcome Screen Component ---
function WelcomeScreen({ danName, onSuggestionClick }) {
    const suggestions = [
        "اعطني فكرة إبداعية لمشروع جديد",
        "ساعدني في تعلم شيء جديد اليوم", 
        "أريد مساعدة في البرمجة",
        "أخبرني نصيحة لتحسين يومي"
    ];

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-8">
                <img src="https://i.postimg.cc/C1XZ9rsn/Chat-GPT-Image-9-2025-04-55-20.png" alt="DistorAI Logo" className="w-20 h-20 rounded-2xl mx-auto mb-4 shadow-lg" />
                <h1 className="text-3xl font-bold text-slate-50 mb-2">
                    أهلاً بك في {danName}
                </h1>
                <p className="text-slate-400 text-lg">
                    ماذا تفكر اليوم؟ أنا هنا لمساعدتك
                </p>
            </div>

            <div className="w-full max-w-2xl">
                <h2 className="text-xl font-semibold text-slate-300 mb-4">
                    اقتراحات للبدء:
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => onSuggestionClick(suggestion)}
                            className="group p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-indigo-400/50 hover:bg-slate-700/50 transition-all duration-200 text-right"
                        >
                            <span className="text-slate-300 group-hover:text-slate-100 transition-colors">
                                {suggestion}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-8 text-sm text-slate-500">
                أو اكتب سؤالك في الأسفل للبدء
            </div>
        </div>
    );
}

// --- Message Bubble Component ---
function MessageBubble({ msg, danName, onReply, onEdit, onRegenerate, onContinue, onCopy: handleCopy, isGenerating, editingMessageId, editingText, setEditingText, handleSaveAiEdit, handleSaveUserEditAndRegenerate, setEditingMessageId, editingTextareaRef, isLastUserMessage }) {
    if (!msg) return null;
    const isUser = msg.role === 'user';
    const contentRef = useRef(null);

    useEffect(() => {
        if (contentRef.current && msg.content && !msg.isThinking) {
            // Simple markdown parsing for basic formatting
            let content = msg.content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
            
            contentRef.current.innerHTML = content;
        }
    }, [msg.content]);
    
    const renderDisplayContent = () => {
        if (msg.isThinking) {
            return <div className="flex items-center gap-2 text-slate-400"><LoaderCircle size={16} className="animate-spin" /><span>جارٍ التفكير...</span></div>;
        }
        return (
            <>
                {msg.referencedMessage && (
                    <div className="referenced-message-bubble text-right">
                        <p className="text-xs font-bold text-indigo-300">{msg.referencedMessage.role === 'user' ? "أنت" : danName}</p>
                        <p className="text-sm text-slate-300/80 line-clamp-2">{msg.referencedMessage.content}</p>
                    </div>
                )}
                {isUser && msg.image && <img src={msg.image} alt="User upload" className="rounded-lg mb-3 max-w-xs cursor-pointer"/>}
                <div 
                    ref={contentRef}
                    className="markdown-content whitespace-pre-wrap" 
                    dir="auto" 
                />
            </>
        );
    };

    const renderEditableContent = () => {
        return (
            <>
                <textarea
                    ref={editingTextareaRef}
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }}
                    className="w-full bg-transparent p-0 resize-none outline-none text-slate-100 placeholder:text-slate-400"
                    rows="1"
                    dir="auto"
                />
                <div className="flex gap-3 mt-4 justify-end">
                    <button 
                        onClick={() => setEditingMessageId(null)} 
                        title="إلغاء" 
                        className="px-3 py-1 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-md transition-all"
                    >
                        إلغاء
                    </button>
                    <button 
                        onClick={isUser ? handleSaveUserEditAndRegenerate : handleSaveAiEdit} 
                        title={isUser ? "إرسال" : "حفظ التعديل"} 
                        className="px-3 py-1 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-all active:scale-95"
                    >
                        {isUser ? "إرسال" : "حفظ التعديل"}
                    </button>
                </div>
            </>
        );
    };
    
    return (
        <div className={`group w-full flex ${isUser ? 'justify-end' : 'justify-start'} fade-in-up`}>
             <div className={`flex flex-col ${isUser ? 'items-end max-w-xl' : 'items-start w-full'} min-w-0`}>
                <div
                    className={`break-words w-full transition-all
                        ${isUser ? 'bg-blue-800/50' : ''}
                        ${(isUser || editingMessageId === msg.id) ? 'px-4 py-3 rounded-2xl shadow-md' : 'py-3'}
                        ${!isUser && editingMessageId === msg.id ? 'bg-slate-700/50' : ''}
                        ${editingMessageId === msg.id ? 'ring-2 ring-indigo-500' : ''}
                        ${!isUser && !msg.isThinking && editingMessageId !== msg.id ? 'blurry-fade-in-effect' : ''}
                    `}
                >
                    {editingMessageId === msg.id ? renderEditableContent() : renderDisplayContent()}
                </div>
                 <div className={`flex items-center gap-3 text-slate-500 transition-opacity duration-300 mt-2 ${isUser ? 'self-end' : 'self-start'} ${editingMessageId === msg.id || (msg.isThinking || !msg.content) ? 'opacity-0' : 'opacity-100'}`}>
                        <button onClick={() => handleCopy(msg.content)} className="p-1 hover:text-slate-300" title="نسخ"><Copy size={15}/></button>
                        <button onClick={() => onReply(msg)} className="p-1 hover:text-slate-300" title="رد"><MessageSquareReply size={15} /></button>
                        {isUser && isLastUserMessage && !isGenerating && (
                            <button onClick={() => onEdit(msg)} className="p-1.5 hover:opacity-80" title="تعديل"><Pencil size={16} className="gradient-text" /></button>
                        )}
                        {msg.role === 'model' && (
                        <>
                            <button onClick={() => onEdit(msg)} className="p-1.5 hover:opacity-80" title="تعديل"><Pencil size={16} className="gradient-text" /></button>
                            {!isGenerating && <button onClick={() => onRegenerate(msg.id)} className="p-1 hover:text-slate-300" title="إعادة التوليد"><RefreshCcw size={15}/></button>}
                            {msg.isUserEdited && !isGenerating && (<button onClick={() => onContinue(msg.id)} className="p-1 text-purple-400 hover:text-purple-300" title="إكمال"><Sparkles size={15}/></button>)}
                        </>
                        )}
                    </div>
            </div>
        </div>
    );
}

// --- Settings Modal Component ---
function SettingsModal({ isOpen, onClose, currentDanName, setCurrentDanName, currentModes, setCurrentModes, showToast }) {
    const [tempDanName, setTempDanName] = useState(currentDanName);
    const [tempModes, setTempModes] = useState(currentModes);

    useEffect(() => {
        setTempDanName(currentDanName);
        setTempModes(currentModes);
    }, [isOpen, currentDanName, currentModes]);
    
    const handleAddMode = (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.modeName.value.trim();
        const prompt = form.modePrompt.value.trim();
        if (name && prompt && !tempModes.some(m => m.name === name)) {
            const newMode = { id: Date.now().toString(), name, prompt };
            setTempModes([...tempModes, newMode]);
            form.reset();
        }
    };

    const handleDeleteMode = (modeId) => setTempModes(tempModes.filter(m => m.id !== modeId));

    const handleSave = () => {
        setCurrentDanName(tempDanName);
        setCurrentModes(tempModes);
        showToast("تم حفظ الإعدادات بنجاح.");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 fade-in" onClick={onClose}>
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-700 flex flex-col max-h-[90vh] text-right" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-6 flex-shrink-0 text-slate-100">تخصيص</h2>
                <div className="overflow-y-auto space-y-6 pl-2 -ml-2">
                    <div>
                        <label htmlFor="danName" className="block text-sm font-medium text-slate-300 mb-2">اسم المساعد</label>
                        <input id="danName" type="text" value={tempDanName} onChange={(e) => setTempDanName(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none text-right"/>
                    </div>
                    <hr className="border-slate-700/50"/>
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-200">إدارة الأوضاع</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pl-2">
                            {tempModes.map(mode => (
                                <div key={mode.id} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-md">
                                    <button onClick={() => handleDeleteMode(mode.id)} title="حذف الوضع" className="p-1 text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                                    <span className="font-medium text-slate-300">{mode.name}</span>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleAddMode} className="border-t border-slate-700/50 pt-4 space-y-3">
                            <h4 className="font-semibold text-slate-300">إضافة وضع جديد</h4>
                            <input name="modeName" type="text" placeholder="اسم الوضع (للاستدعاء)" required className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none text-right"/>
                            <textarea name="modePrompt" placeholder="وصف الشخصية..." required className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 resize-none focus:ring-2 focus:ring-indigo-500 outline-none text-right" rows="3"/>
                            <button type="submit" className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-slate-50 font-semibold transition-all active:scale-95">إضافة الوضع</button>
                        </form>
                    </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700/50 flex-shrink-0">
                    <button onClick={handleSave} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-slate-50 font-semibold transition-all active:scale-95">حفظ وإغلاق</button>
                </div>
            </div>
        </div>
    );
}