import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { chatAPI, ChatMessage, User } from '../services/api';

interface ChatModalProps {
    requestId: string;
    currentUser: User;
    otherUserName: string;
    onClose: () => void;
}

export function ChatModal({ requestId, currentUser, otherUserName, onClose }: ChatModalProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // 1. Fetch chat history
        const fetchHistory = async () => {
            try {
                const history = await chatAPI.getHistory(requestId);
                setMessages(history);
            } catch (err) {
                console.error("Failed to load chat history", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();

        // 2. Initialize Socket Connection
        const newSocket = io('https://backend-crop-intelligence.onrender.com'); // Ensure this matches your backend URL
        setSocket(newSocket);

        newSocket.emit('join_room', requestId);

        newSocket.on('receive_message', (message: ChatMessage) => {
            setMessages((prev) => [...prev, message]);
        });

        // Cleanup on unmount
        return () => {
            newSocket.disconnect();
        };
    }, [requestId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const messageData = {
            requestId,
            text: newMessage.trim(),
            senderId: currentUser._id,
            senderName: currentUser.name,
            timestamp: new Date().toISOString()
        };

        // Emit through socket for real-time display
        socket.emit('send_message', messageData);
        setNewMessage('');

        // Also save to database via REST API
        try {
            await chatAPI.saveMessage(messageData);
        } catch (err) {
            console.error('Failed to save message to db:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div>
                        <h3 className="font-bold text-slate-900">Chat with {otherUserName}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-medium text-green-600">Online</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex flex-col items-center justify-center rounded-full bg-white text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-colors shadow-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-4">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                <Send className="w-8 h-8 text-green-500 ml-1" />
                            </div>
                            <p className="text-slate-500 text-sm">Send a message to coordinate the pickup.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.senderId === currentUser._id;
                            const showName = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

                            return (
                                <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    {!isMe && showName && (
                                        <span className="text-[10px] font-bold text-slate-400 ml-1 mb-1">{msg.senderName}</span>
                                    )}
                                    <div
                                        className={`px-4 py-2.5 rounded-2xl max-w-[80%] ${isMe
                                            ? 'bg-green-600 text-white rounded-br-sm'
                                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
                                            }`}
                                    >
                                        <p className="text-sm font-medium">{msg.text}</p>
                                    </div>
                                    <span className="text-[9px] font-medium text-slate-400 mt-1 mx-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-green-500 focus:bg-white transition-all font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:shadow-none p-0"
                    >
                        <Send className="w-5 h-5 ml-1" />
                    </button>
                </form>
            </div>
        </div>
    );
}
