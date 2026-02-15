import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Loader2, ArrowRight, User, Zap, Volume2 } from 'lucide-react';
import { runGeneralChat } from '../services/geminiService';
import { saveChatHistory } from '../services/authService';
import { Brain } from 'lucide-react';
import { UserProfile, ChatMessage as ChatMessageType } from '../types';

interface PersonalAssistantProps {
  onBack: () => void;
  currentUser: UserProfile | null;
}

const CoolBotLogo = () => (
  <div className="relative w-10 h-10 flex items-center justify-center group">
    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative bg-black rounded-xl w-10 h-10 flex items-center justify-center border border-indigo-500/50 shadow-inner overflow-hidden">
       <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)', backgroundSize: '4px 4px' }}></div>
       <Brain size={20} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-300" />
       <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500/40 rounded-full blur-md animate-pulse"></div>
    </div>
    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full z-20"></div>
  </div>
);

const PersonalAssistant: React.FC<PersonalAssistantProps> = ({ onBack, currentUser }) => {
  const [messages, setMessages] = useState<ChatMessageType[]>(() => {
    if (currentUser && currentUser.chatHistory && currentUser.chatHistory.length > 0) {
      return currentUser.chatHistory;
    }
    return [{ role: 'model', text: "Hello! I'm your Personal FutureSelf Assistant. How can I help you optimize your habits today?", timestamp: Date.now() }];
  });

  const [inputText, setInputText] = useState("");
  const [isLoadingText, setIsLoadingText] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Voice State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Persistence
  useEffect(() => {
    if (currentUser && messages.length > 0) {
      const timer = setTimeout(() => {
        saveChatHistory(currentUser.id, messages);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages, currentUser]);

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim()) return;
    
    setInputText("");
    
    const newMessages = [...messages, { role: 'user', text: text, timestamp: Date.now() } as ChatMessageType];
    setMessages(newMessages);
    setIsLoadingText(true);

    try {
      // Map history for service
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const aiResponse = await runGeneralChat(text, history);
      setMessages(prev => [...prev, { role: 'model', text: aiResponse, timestamp: Date.now() }]);
      
      // Text to Speech if in voice mode (simple implementation)
      if (isListening) {
        speak(aiResponse);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now.", timestamp: Date.now() }]);
    } finally {
      setIsLoadingText(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- BROWSER SPEECH RECOGNITION ---
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input not supported in this browser.");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        handleSendMessage(transcript);
      }
    };
    
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shadow-sm z-20">
         <div className="flex items-center gap-4">
           <CoolBotLogo />
           <div>
             <h1 className="text-xl font-bold text-slate-900 dark:text-white">Personal Assistant</h1>
             <p className="text-xs text-slate-500 flex items-center gap-1">
               <Zap size={10} className="text-amber-500 fill-amber-500" /> Powered by OpenRouter
             </p>
           </div>
         </div>
         
         <button onClick={onBack} className="md:hidden text-slate-400">
            <ArrowRight className="rotate-180" />
         </button>
      </div>

      <div className="flex-1 w-full max-w-3xl p-4 flex flex-col h-[calc(100vh-80px)]">
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-transparent'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <CoolBotLogo />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100 rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isLoadingText && <div className="ml-12 text-xs text-slate-400 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Thinking...</div>}
              <div ref={chatEndRef} />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 relative flex items-center gap-2">
            <button 
              onClick={toggleListening}
              className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                placeholder={currentUser ? "Ask questions..." : "Ask questions..."} 
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
              <button 
                onClick={() => handleSendMessage()} 
                disabled={!inputText.trim() || isLoadingText} 
                className="absolute right-3 top-3 text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalAssistant;