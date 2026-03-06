import { useState, useEffect, useRef } from 'react';
import {
    X,
    Send,
    Mic,
    MicOff,
    Sparkles,
    CloudSun,
    Navigation,
    MapPin,
    Bot,
    User as UserIcon,
    CircleDot,
    TrendingUp,
    ShieldAlert,
    Droplets,
    Leaf
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { weatherAPI, WeatherData } from '../services/api';
import { getCurrentCity, LocationData } from '../utils/geo';
import { generateAIResponse, AIResponsePayload, AIWidget } from '../services/ai-service';

interface Message {
    role: 'user' | 'assistant';
    content?: string;
    payload?: AIResponsePayload;
    isWeatherWidget?: boolean;
}

interface AIInsightsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AIInsightsModal({ isOpen, onClose }: AIInsightsModalProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [location, setLocation] = useState<LocationData | null>(null);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            initAI();
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const initAI = async () => {
        try {
            setIsLoading(true);
            setMessages([{ role: 'assistant', content: "Gathering local weather and field data for you..." }]);

            // 1. Get Location
            const loc = await getCurrentCity();
            setLocation(loc);

            // 2. Get Weather
            const weatherData = await weatherAPI.getCurrent(loc.city);
            setWeather(weatherData);

            // 3. Initial AI Greeting with Context
            const greeting = `Hello! I've detected you're in **${loc.city}**. The current weather is **${weatherData.temperature}°C with ${weatherData.condition}**. How can I help you with your crops today?`;

            setMessages([
                { role: 'assistant', content: greeting, isWeatherWidget: true }
            ]);
        } catch (error) {
            setMessages([{ role: 'assistant', content: "Hi! I couldn't fetch your exact location, but I'm still here to help. What's on your mind today?" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (text: string = input) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const aiPayload = await generateAIResponse(text, weather || undefined);
            setMessages(prev => [...prev, { role: 'assistant', payload: aiPayload }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Speech to Text Implementation
    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice recognition is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(transcript);
        };

        recognition.start();
    };

    const renderWidget = (widget: AIWidget, idx: number) => {
        const getIcon = () => {
            switch (widget.type) {
                case 'weather': return <CloudSun className="w-5 h-5 text-blue-500" />;
                case 'market': return <TrendingUp className="w-5 h-5 text-indigo-500" />;
                case 'health': return <ShieldAlert className="w-5 h-5 text-amber-500" />;
                case 'irrigation': return <Droplets className="w-5 h-5 text-cyan-500" />;
                case 'fertilizer': return <Leaf className="w-5 h-5 text-green-500" />;
                default: return <Sparkles className="w-5 h-5 text-slate-500" />;
            }
        };

        const getStatusColor = () => {
            switch (widget.status) {
                case 'positive': return 'bg-green-100 text-green-700 border-green-200';
                case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200';
                case 'neutral': return 'bg-slate-100 text-slate-700 border-slate-200';
                default: return 'bg-slate-100 text-slate-700 border-slate-200';
            }
        };

        return (
            <div key={idx} className={`p-4 rounded-2xl border ${getStatusColor()} flex flex-col gap-2`}>
                <div className="flex items-center gap-2 font-bold">
                    {getIcon()}
                    <span>{widget.title}</span>
                </div>
                <ul className="text-sm space-y-1 list-disc list-inside">
                    {widget.details.map((detail, i) => (
                        <li key={i}>{detail}</li>
                    ))}
                </ul>
                <div className="mt-2 pt-2 border-t border-black/10 text-xs font-bold uppercase tracking-wider">
                    {widget.summary}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl h-[85vh] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-white/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Crop Intelligence AI</h2>
                            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                <CircleDot className="w-3 h-3 animate-pulse" />
                                Live: Expert Assistant
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-slate-100 rounded-2xl transition-all"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Chat Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar"
                >
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-500`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-slate-100 text-slate-600' : 'bg-green-600 text-white'
                                }`}>
                                {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                            </div>

                            <div className={`max-w-[85%] space-y-3 ${msg.role === 'user' ? 'text-right' : ''}`}>
                                <div className={`p-5 rounded-3xl inline-block text-left shadow-sm ${msg.role === 'assistant'
                                    ? 'bg-white border border-slate-100 text-slate-800 w-full'
                                    : 'bg-green-600 text-white chat-bubble-user'
                                    }`}>
                                    {msg.content && (
                                        <div className="prose prose-slate max-w-none text-sm md:text-base whitespace-pre-line">
                                            {msg.content}
                                        </div>
                                    )}
                                    {msg.payload && (
                                        <div className="space-y-4 w-full">
                                            {msg.payload.image_keyword && (
                                                <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-4 relative">
                                                    <img
                                                        src={`https://image.pollinations.ai/prompt/${encodeURIComponent("professional photograph of " + msg.payload.image_keyword + " agriculture farm")}?width=800&height=600&nologo=true`}
                                                        alt={msg.payload.image_keyword}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                                </div>
                                            )}

                                            <div className="prose prose-slate max-w-none text-sm md:text-base">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.payload.main_response}
                                                </ReactMarkdown>
                                            </div>

                                            {msg.payload.widgets && msg.payload.widgets.length > 0 && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                                                    {msg.payload.widgets.map((widget, i) => renderWidget(widget, i))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {msg.isWeatherWidget && weather && (
                                    <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/20 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Current Weather</p>
                                            <h4 className="text-2xl font-bold">{weather.city}</h4>
                                            <p className="text-blue-50 font-medium mt-1">{weather.condition} • {weather.temperature}°C</p>
                                        </div>
                                        <CloudSun className="w-12 h-12 text-white/50" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                                <div className="h-4 bg-slate-100 rounded-full w-1/2" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 md:p-8 border-t border-slate-100 bg-white/50 backdrop-blur-md">
                    <div className="max-w-3xl mx-auto relative group">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your question or use the mic..."
                            className="w-full pl-6 pr-32 py-4 md:py-5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/50 transition-all text-sm md:text-base"
                        />

                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                                onClick={isListening ? () => { } : startListening}
                                className={`p-3 rounded-xl transition-all ${isListening
                                    ? 'bg-red-50 text-red-600 animate-pulse'
                                    : 'text-slate-400 hover:bg-slate-50 hover:text-green-600'
                                    }`}
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isLoading}
                                className="p-3 bg-green-600 text-white rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <p className="text-center mt-4 text-xs text-slate-400 font-medium font-sans">
                        "How can I improve my wheat yield?" • "What's the weather forecast?"
                    </p>
                </div>
            </div>
        </div>
    );
}
