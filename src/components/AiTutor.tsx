import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Key, Sparkles, MessageCircle, RotateCcw, AlertCircle } from 'lucide-react';
import { aiTutorService, ChatMessage } from '../services/aiTutor';
import ReactMarkdown from 'react-markdown';

interface AiTutorProps {
    topicId?: string;
}

const AiTutor: React.FC<AiTutorProps> = ({ topicId }) => {
    const [isConfigured, setIsConfigured] = useState(aiTutorService.isConfigured());
    const [apiKey, setApiKey] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const suggestedQuestions = aiTutorService.getSuggestedQuestions(topicId);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle API key configuration
    const handleConfigureApi = () => {
        if (!apiKey.trim()) {
            setError('Por favor, introduce una API key válida');
            return;
        }

        const success = aiTutorService.setApiKey(apiKey.trim());
        if (success) {
            setIsConfigured(true);
            setError(null);
            // Welcome message
            setMessages([{
                role: 'assistant',
                content: '¡Hola! Soy tu tutor de armonía y análisis musical. Puedo ayudarte con cualquier duda sobre:\n\n- **Armonía tonal** (cadencias, modulaciones, acordes)\n- **Formas musicales** (sonata, fuga, rondó, lied)\n- **Análisis de obras** del repertorio clásico\n- **Contrapunto** y técnicas compositivas\n\n¿En qué puedo ayudarte hoy?'
            }]);
        } else {
            setError('Error al configurar la API. Verifica tu clave.');
        }
    };

    // Send message
    const handleSendMessage = async () => {
        const message = inputValue.trim();
        if (!message || isLoading) return;

        setInputValue('');
        setError(null);
        setMessages(prev => [...prev, { role: 'user', content: message }]);
        setIsLoading(true);

        try {
            const response = await aiTutorService.sendMessage(message);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    // Handle suggested question click
    const handleSuggestedQuestion = (question: string) => {
        setInputValue(question);
        inputRef.current?.focus();
    };

    // Start new conversation
    const handleNewConversation = () => {
        aiTutorService.startNewChat();
        setMessages([{
            role: 'assistant',
            content: '¡Nueva conversación iniciada! ¿En qué puedo ayudarte?'
        }]);
        setError(null);
    };

    // API key configuration screen
    if (!isConfigured) {
        return (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bot size={32} className="text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Tutor de Armonía IA</h2>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        Un asistente inteligente para resolver tus dudas de armonía, análisis y teoría musical.
                    </p>

                    <div className="max-w-sm mx-auto space-y-4">
                        <div className="text-left">
                            <label className="text-sm text-slate-400 flex items-center gap-2 mb-2">
                                <Key size={14} />
                                API Key de Gemini
                            </label>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleConfigureApi()}
                                placeholder="AIza..."
                                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleConfigureApi}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles size={18} />
                            Activar Tutor IA
                        </button>

                        <p className="text-xs text-slate-500">
                            Obtén tu API key gratuita en{' '}
                            <a 
                                href="https://aistudio.google.com/app/apikey" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline"
                            >
                                Google AI Studio
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Chat interface
    return (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <Bot size={20} className="text-blue-400" />
                    <span className="font-medium text-white">Tutor de Armonía IA</span>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Conectado</span>
                </div>
                <button
                    onClick={handleNewConversation}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                    title="Nueva conversación"
                >
                    <RotateCcw size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            msg.role === 'user' 
                                ? 'bg-blue-500/20 text-blue-400' 
                                : 'bg-purple-500/20 text-purple-400'
                        }`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>
                        <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                            msg.role === 'user'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-700 text-slate-200'
                        }`}>
                            {msg.role === 'assistant' ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            ) : (
                                <p>{msg.content}</p>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Bot size={16} className="text-purple-400" />
                        </div>
                        <div className="bg-slate-700 rounded-xl px-4 py-3">
                            <Loader2 size={20} className="animate-spin text-slate-400" />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions (shown when empty) */}
            {messages.length <= 1 && (
                <div className="px-4 pb-2">
                    <p className="text-xs text-slate-500 mb-2">Preguntas sugeridas:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.slice(0, 3).map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestedQuestion(q)}
                                className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-full text-slate-300 transition-colors"
                            >
                                {q.length > 50 ? q.substring(0, 50) + '...' : q}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Error display */}
            {error && (
                <div className="px-4 pb-2">
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Escribe tu pregunta de armonía..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputValue.trim()}
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AiTutor;
