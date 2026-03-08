import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, X, Sparkles, Loader2, Bot, User as UserIcon, ShieldAlert, CheckCircle2, Leaf, CloudSun, Stethoscope, Droplets, ArrowRight } from 'lucide-react';
import { aiAPI, User } from '../services/api';

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    image?: string;
}

const PREDEFINED_PROMPTS = [
    { label: 'English', text: 'How do I detect late blight in my tomato crops early?' },
    { label: 'Hindi', text: 'मेरे गेहूं की फसल में पीले धब्बे क्यों पड़ रहे हैं?' }, // Why are there yellow spots on my wheat crop?
    { label: 'Punjabi', text: 'ਮੇਰੀ ਕਣਕ ਦੀ ਫਸਲ ਵਿੱਚ ਪੀਲੇ ਧੱਬੇ ਕਿਉਂ ਪੈ ਰਹੇ ਹਨ? ਇਸਦਾ ਕੀ ਇਲਾਜ ਹੈ?' }, // Punjabi variant
];

export function AIAssistantPage({ user }: { user: User }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'model',
            text: `Hello ${user.name}! I am FarmIQ AI, your personal agricultural expert. You can ask me questions in English, Hindi, Punjabi, Marathi, or any other language. \n\nUpload a picture of your crop or soil if you need an instant diagnosis. How can I help you today?`
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("Image must be smaller than 5MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = async (textToSend: string, imageToSend: string | null = null) => {
        const text = textToSend.trim();
        if (!text && !imageToSend) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text,
            image: imageToSend || undefined
        };

        setMessages(prev => [...prev, newMessage]);
        setInput('');
        setSelectedImage(null);
        setIsLoading(true);

        try {
            // Build history for the API (only text is needed for history usually, but let's keep it simple)
            const history = messages
                .filter(m => m.id !== '1') // Skip greeting
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            const res = await aiAPI.chat(text, imageToSend || undefined, history);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: res.reply
            };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error('AI Chat Error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: "I'm sorry, I'm having trouble connecting to the network right now. Please try again in a moment."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Advanced helper to parse AI text containing basic markdown (bold, bullets) AND Custom UI Widgets
    const formatText = (text: string) => {
        // 1. First, extract WIDGET_DIAGNOSIS
        const parts: React.ReactNode[] = [];
        let remainingText = text;

        const diagnosisRegex = /<WIDGET_DIAGNOSIS>([\s\S]*?)<\/WIDGET_DIAGNOSIS>/g;
        const cropRegex = /<WIDGET_CROP>([\s\S]*?)<\/WIDGET_CROP>/g;

        // Process all diagnosis widgets
        let match;
        const tempTextParts: { text: string, isWidget: boolean, type?: 'diagnosis' | 'crop', content?: string }[] = [];
        let cursor = 0;

        // A combined regex approach is safer, but let's do sequential passes building an array of segments
        // We will split the text by the tags manually to keep ordering

        const parseWidgets = (inputStr: string) => {
            const result: React.ReactNode[] = [];
            let currentStr = inputStr;

            while (currentStr.length > 0) {
                const diagIndex = currentStr.indexOf('<WIDGET_DIAGNOSIS>');
                const cropIndex = currentStr.indexOf('<WIDGET_CROP>');

                let nextTagIndex = -1;
                let nextTag: 'diagnosis' | 'crop' | null = null;

                if (diagIndex !== -1 && (cropIndex === -1 || diagIndex < cropIndex)) {
                    nextTagIndex = diagIndex;
                    nextTag = 'diagnosis';
                } else if (cropIndex !== -1) {
                    nextTagIndex = cropIndex;
                    nextTag = 'crop';
                }

                if (nextTagIndex === -1) {
                    // No more tags, just text
                    result.push(parseMarkdown(currentStr));
                    break;
                }

                // Push preceding text
                if (nextTagIndex > 0) {
                    result.push(parseMarkdown(currentStr.slice(0, nextTagIndex)));
                }

                // Extract widget content
                if (nextTag === 'diagnosis') {
                    const endTag = '</WIDGET_DIAGNOSIS>';
                    const endIndex = currentStr.indexOf(endTag, nextTagIndex);
                    if (endIndex !== -1) {
                        const content = currentStr.slice(nextTagIndex + '<WIDGET_DIAGNOSIS>'.length, endIndex);
                        result.push(<DiagnosisWidget key={Date.now() + Math.random()} content={content} />);
                        currentStr = currentStr.slice(endIndex + endTag.length);
                    } else {
                        // Fallback if tag is broken
                        currentStr = currentStr.slice(nextTagIndex + 1);
                    }
                } else if (nextTag === 'crop') {
                    const endTag = '</WIDGET_CROP>';
                    const endIndex = currentStr.indexOf(endTag, nextTagIndex);
                    if (endIndex !== -1) {
                        const content = currentStr.slice(nextTagIndex + '<WIDGET_CROP>'.length, endIndex);
                        result.push(<CropWidget key={Date.now() + Math.random()} content={content} />);
                        currentStr = currentStr.slice(endIndex + endTag.length);
                    } else {
                        // Fallback if tag is broken
                        currentStr = currentStr.slice(nextTagIndex + 1);
                    }
                }
            }
            return result;
        };

        const parseMarkdown = (plainText: string) => {
            return plainText.split('\n').map((line, i) => {
                if (!line.trim()) return null; // Skip empty lines between widgets

                // Very basic bold parsing `**bold**`
                const boldParsed = line.split(/(\*\*.*?\*\*)/).map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={index} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                });

                // Check for bullets
                if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                    return <div key={Date.now() + i} className="flex gap-2 mt-2 mb-1 pl-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                        <div className="leading-relaxed">{boldParsed.map((p, idx) => typeof p === 'string' ? p.replace(/^- /, '').replace(/^\* /, '') : p)}</div>
                    </div>
                }

                return <p key={Date.now() + i} className="mb-2 last:mb-0 leading-relaxed">{boldParsed}</p>;
            });
        };

        return <div className="space-y-3">{parseWidgets(text)}</div>;
    };

    // Sub-components for Widgets
    const DiagnosisWidget = ({ content }: { content: string }) => {
        // Parse the block
        // Expected format:
        // Disease: [Name]
        // Severity: [Low/Medium/Critical]
        // Treatment: [Treatment]
        const lines = content.trim().split('\n');
        let disease = 'Unknown';
        let severity = 'Medium';
        let treatment = '';

        lines.forEach(line => {
            if (line.toLowerCase().startsWith('disease:')) disease = line.replace(/disease:/i, '').trim();
            if (line.toLowerCase().startsWith('severity:')) severity = line.replace(/severity:/i, '').trim();
            if (line.toLowerCase().startsWith('treatment:')) treatment = line.replace(/treatment:/i, '').trim();
        });

        const isCritical = severity.toLowerCase().includes('high') || severity.toLowerCase().includes('critical');

        return (
            <div className="my-4 bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className={`p-4 border-b flex items-center gap-3 ${isCritical ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                    <div className={`p-2 rounded-xl ${isCritical ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className={`text-sm font-bold flex items-center gap-2 ${isCritical ? 'text-red-900' : 'text-orange-900'}`}>
                            Crop Issue Detected
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-black ${isCritical ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}`}>
                                {severity}
                            </span>
                        </h4>
                        <p className={`font-semibold capitalize ${isCritical ? 'text-red-700' : 'text-orange-700'}`}>{disease}</p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Recommended Treatment
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{treatment}</p>
                </div>
            </div>
        );
    };

    const CropWidget = ({ content }: { content: string }) => {
        const lines = content.trim().split('\n');
        let crop = 'Unknown';
        let season = 'All Season';
        let recommendation = '';

        lines.forEach(line => {
            if (line.toLowerCase().startsWith('crop:')) crop = line.replace(/crop:/i, '').trim();
            if (line.toLowerCase().startsWith('season:')) season = line.replace(/season:/i, '').trim();
            if (line.toLowerCase().startsWith('recommendation:')) recommendation = line.replace(/recommendation:/i, '').trim();
        });

        return (
            <div className="my-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-green-100 shadow-sm overflow-hidden">
                <div className="p-4 flex items-start gap-4">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600 border border-emerald-100">
                        <Leaf className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-emerald-900 text-lg capitalize">{crop}</h4>
                            <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-white text-emerald-700 border border-emerald-100 font-bold uppercase tracking-wider shadow-sm">
                                <CloudSun className="w-3 h-3" /> {season}
                            </span>
                        </div>
                        <div className="mt-3 bg-white/60 p-3 rounded-xl border border-white">
                            <p className="text-sm text-emerald-800 font-medium leading-relaxed flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                {recommendation}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] lg:h-screen bg-slate-50 relative">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none"></div>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-green-500/10 sticky top-0 z-30 flex-shrink-0">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                            FarmIQ AI
                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] uppercase tracking-wider font-black">Beta</span>
                        </h1>
                        <p className="text-sm font-medium text-slate-500">Your multi-lingual agricultural expert</p>
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 w-full max-w-4xl mx-auto">
                <div className="space-y-6 w-full">

                    {messages.map((message) => (
                        <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mt-1 shadow-sm ${message.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                }`}>
                                {message.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>

                            {/* Message Bubble */}
                            <div className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-5 shadow-sm border ${message.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none border-blue-700'
                                : 'bg-white text-slate-700 rounded-tl-none border-slate-200/60'
                                }`}>
                                {message.image && (
                                    <img src={message.image} alt="Uploaded crop" className="max-w-full h-auto rounded-xl mb-3 border border-black/10 shadow-sm max-h-60 object-cover" />
                                )}
                                <div className={`text-[15px] ${message.role === 'user' ? 'text-white' : 'text-slate-600'}`}>
                                    {message.role === 'user' ? message.text : formatText(message.text)}
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex-shrink-0 flex items-center justify-center mt-1 shadow-sm">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="bg-white rounded-3xl rounded-tl-none p-5 shadow-sm border border-slate-200/60 flex items-center gap-3">
                                <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
                                <span className="text-sm font-medium text-slate-500">FarmIQ AI is analyzing...</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input Area */}
            <footer className="bg-white border-t border-slate-200 flex-shrink-0 p-4 sm:px-6 lg:px-8 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10 w-full">
                <div className="max-w-4xl mx-auto w-full">

                    {/* Predefined Prompts - Only show if no user messages yet */}
                    {messages.length === 1 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 self-center">Try asking:</span>
                            {PREDEFINED_PROMPTS.map((prompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSend(prompt.text)}
                                    className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-full text-sm font-medium transition-colors border border-green-200/50"
                                    title={prompt.label}
                                >
                                    " {prompt.text} "
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Selected Image Preview */}
                    {selectedImage && (
                        <div className="mb-3 relative inline-block">
                            <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-green-500/30 shadow-sm" />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-2 -right-2 bg-slate-800 text-white p-1 rounded-full hover:bg-red-500 transition-colors shadow-md"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl shadow-inner focus-within:border-green-400 focus-within:ring-4 focus-within:ring-green-500/10 transition-all p-1">

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors shrink-0 cursor-pointer z-10 relative"
                            title="Upload image"
                        >
                            <ImageIcon className="w-6 h-6" />
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(input, selectedImage);
                                }
                            }}
                            placeholder="Ask anything about farming, crops, or upload a picture..."
                            className="flex-1 bg-transparent px-3 py-3 outline-none text-slate-800 font-medium placeholder:text-slate-400 placeholder:font-normal w-full"
                        />

                        <button
                            onClick={() => handleSend(input, selectedImage)}
                            disabled={(!input.trim() && !selectedImage) || isLoading}
                            className="p-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-colors shrink-0 shadow-sm ml-1 cursor-pointer z-10 relative"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-[-1px] mt-[1px]" />}
                        </button>
                    </div>

                    <p className="text-center text-[10px] text-slate-400 font-medium mt-3 uppercase tracking-widest">
                        Powered by FarmIQ Vision & LLM
                    </p>
                </div>
            </footer>
        </div>
    );
}
