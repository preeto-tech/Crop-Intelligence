import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, ChevronUp, ChevronDown, Circle, Phone } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { chatAPI, transportAPI, marketAPI, ChatMessage, User } from '../services/api';

interface GlobalChatWidgetProps {
    currentUser: User | null;
}

interface ActiveChat {
    id: string; // transport request ID is the room ID
    otherUserName: string;
    cropName: string;
    hasUnread: boolean;
    messages: ChatMessage[];
    isLoadingHistory: boolean;
    type?: 'transport' | 'market';
}

export function GlobalChatWidget({ currentUser }: GlobalChatWidgetProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const [chats, setChats] = useState<ActiveChat[]>([]);
    const [activeTab, setActiveTab] = useState<string | null>(null); // which chat is currently maximizing within the widget
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingInitial, setIsLoadingInitial] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const activeTabRef = useRef(activeTab);
    const isWidgetOpenRef = useRef(isWidgetOpen);

    useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
    useEffect(() => { isWidgetOpenRef.current = isWidgetOpen; }, [isWidgetOpen]);

    // Auto-scroll when active tab or its messages change
    useEffect(() => {
        if (activeTab) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chats, activeTab]);

    // Handle custom open-chat event
    useEffect(() => {
        const handleOpenChat = (e: Event) => {
            const customEvent = e as CustomEvent;
            const { requestId, type, otherUserName, cropName } = customEvent.detail;
            if (requestId) {
                setChats(prev => {
                    const exists = prev.find(c => c.id === requestId);
                    if (!exists) {
                        const newChat: ActiveChat = {
                            id: requestId,
                            otherUserName: otherUserName || 'Unknown',
                            cropName: cropName || 'Item',
                            hasUnread: false,
                            messages: [],
                            isLoadingHistory: false,
                            type: type || 'transport'
                        };
                        // Automatically join the newly created room
                        if (socket) {
                            socket.emit('join_room', requestId);
                        }
                        return [...prev, newChat];
                    }
                    return prev;
                });

                setIsWidgetOpen(true);
                setActiveTab(requestId);
            }
        };

        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, [socket]);

    // Initialize Global Socket and fetch active transport requests
    useEffect(() => {
        if (!currentUser) return;

        const initChat = async () => {
            setIsLoadingInitial(true);
            try {
                // Fetch all requests/orders
                let transportReqs: any[] = [];
                let marketOrders: any[] = [];

                if (currentUser.role === 'farmer') {
                    transportReqs = await transportAPI.getMyRequests();
                    try {
                        marketOrders = await marketAPI.getFarmerOrders();
                    } catch (e) { console.error('Error fetching farmer orders', e) }
                } else if (currentUser.role === 'transporter') {
                    const allReqs = await transportAPI.getAllRequests();
                    // transporters only chat with requests they accepted
                    transportReqs = allReqs.filter(r => r.driverId === currentUser._id);
                } else if (currentUser.role === 'buyer') {
                    try {
                        marketOrders = await marketAPI.getMyOrders();
                    } catch (e) { console.error('Error fetching buyer orders', e) }
                }

                // Filter to only accepted transport requests
                const activeTransportReqs = transportReqs.filter(r => r.status === 'Accepted');

                // Active market orders (anything not Cancelled/Completed if you want, currently default is Negotiating)
                const activeMarketOrders = marketOrders;

                // Initialize chat state
                const initialChats: ActiveChat[] = [
                    ...activeTransportReqs.map(r => ({
                        id: r.id,
                        otherUserName: currentUser.role === 'farmer' ? r.driverName : r.farmerName,
                        cropName: r.crop,
                        hasUnread: false,
                        messages: [],
                        isLoadingHistory: true,
                        type: 'transport' as const
                    })),
                    ...activeMarketOrders.map(o => ({
                        id: o.id,
                        otherUserName: currentUser.role === 'farmer' ? o.buyerName : o.farmerName,
                        cropName: o.crop,
                        hasUnread: false,
                        messages: [],
                        isLoadingHistory: true,
                        type: 'market' as const
                    }))
                ];

                setChats(initialChats);

                // Initialize Socket Connection
                const newSocket = io('https://backend-crop-intelligence.onrender.com');
                setSocket(newSocket);

                // Join all rooms for active chats
                initialChats.forEach(chat => {
                    newSocket.emit('join_room', chat.id);
                });

                // Global listener for incoming messages
                newSocket.on('receive_message', (message: ChatMessage) => {
                    setChats(prevChats => prevChats.map(c => {
                        if (c.id === message.requestId) {
                            // If this message belongs to this chat room
                            // Check if the chat is currently open and focused
                            const isFocus = isWidgetOpenRef.current && activeTabRef.current === message.requestId;
                            // Only add if it's not a duplicate (basic check)
                            const isDuplicate = c.messages.some(m =>
                                (m.id && message.id && m.id === message.id) ||
                                (m.timestamp === message.timestamp && m.senderId === message.senderId)
                            );

                            return {
                                ...c,
                                messages: isDuplicate ? c.messages : [...c.messages, message],
                                hasUnread: !isFocus && message.senderId !== currentUser._id ? true : c.hasUnread
                            };
                        }
                        return c;
                    }));
                });

                // Fetch history for each room
                initialChats.forEach(async (chat) => {
                    try {
                        const history = await chatAPI.getHistory(chat.id);
                        setChats(prev => prev.map(c => {
                            if (c.id === chat.id) {
                                return { ...c, messages: history, isLoadingHistory: false };
                            }
                            return c;
                        }));
                    } catch (e) {
                        console.error(`Failed to fetch history for ${chat.id}`, e);
                        setChats(prev => prev.map(c => c.id === chat.id ? { ...c, isLoadingHistory: false } : c));
                    }
                });

            } catch (err) {
                console.error("Failed to initialize global chat", err);
            } finally {
                setIsLoadingInitial(false);
            }
        };

        if (currentUser.role === 'farmer' || currentUser.role === 'transporter' || currentUser.role === 'buyer') {
            initChat();
        }

        return () => {
            if (socket) socket.disconnect();
        };
    }, [currentUser]); // Re-run if user logs in/out

    // Mark as read when opening a specific chat
    useEffect(() => {
        if (activeTab && isWidgetOpen) {
            setChats(prev => prev.map(c => c.id === activeTab ? { ...c, hasUnread: false } : c));
        }
    }, [activeTab, isWidgetOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !activeTab || !currentUser) return;

        const messageData = {
            requestId: activeTab,
            text: newMessage.trim(),
            senderId: currentUser._id,
            senderName: currentUser.name,
            timestamp: new Date().toISOString()
        };

        // Emit through socket for real-time display globally
        socket.emit('send_message', messageData);
        setNewMessage('');

        // Also save to database via REST API
        try {
            await chatAPI.saveMessage(messageData);
        } catch (err) {
            console.error('Failed to save message to db:', err);
        }
    };

    if (!currentUser || (currentUser.role !== 'farmer' && currentUser.role !== 'transporter' && currentUser.role !== 'buyer')) {
        return null;
    }

    if (chats.length === 0) {
        return null; // Don't show widget if no active jobs exist
    }

    const unreadTotal = chats.filter(c => c.hasUnread).length;

    return (
        <div className="fixed bottom-0 right-10 z-[100] flex items-end drop-shadow-2xl">
            {/* The Main Widget Container */}
            <div className={`bg-white border-x border-t border-slate-200 rounded-t-2xl flex flex-col transition-all duration-300 ease-in-out w-80 ${isWidgetOpen ? 'h-[500px]' : 'h-14 cursor-pointer hover:bg-slate-50'}`}>

                {/* Header (Always Visible) */}
                <div
                    className="h-14 px-4 flex items-center justify-between border-b border-slate-100 shrink-0"
                    onClick={() => {
                        setIsWidgetOpen(!isWidgetOpen);
                        if (!isWidgetOpen && !activeTab && chats.length > 0) {
                            setActiveTab(chats[0].id); // Default select first chat when opening
                        }
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-slate-700" />
                            </div>
                            {unreadTotal > 0 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-[9px] font-bold text-white">{unreadTotal}</span>
                                </div>
                            )}
                        </div>
                        <span className="font-bold text-slate-900 text-sm">Messages</span>
                    </div>
                    <div className="text-slate-400">
                        {isWidgetOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </div>
                </div>

                {/* Expanded Content Area */}
                {isWidgetOpen && (
                    <div className="flex flex-1 overflow-hidden">

                        {/* Sidebar: List of Active Chats */}
                        {chats.length > 1 && (
                            <div className="w-16 border-r border-slate-100 bg-slate-50/50 flex flex-col py-2 gap-2 items-center overflow-y-auto custom-scrollbar">
                                {chats.map(chat => (
                                    <button
                                        key={chat.id}
                                        onClick={() => setActiveTab(chat.id)}
                                        className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeTab === chat.id ? 'bg-white shadow border border-slate-200' : 'hover:bg-slate-200 text-slate-500'}`}
                                        title={`${chat.otherUserName} - ${chat.cropName}`}
                                    >
                                        <div className="text-[10px] font-bold leading-tight uppercase tracking-tighter">
                                            {chat.cropName.substring(0, 3)}
                                        </div>
                                        {chat.hasUnread && activeTab !== chat.id && (
                                            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-50"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Active Chat Area */}
                        {activeTab ? (() => {
                            const currentChat = chats.find(c => c.id === activeTab);
                            if (!currentChat) return null;

                            return (
                                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                                    {/* Chat Specific Header */}
                                    {chats.length > 1 && (
                                        <div className="px-4 py-2 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2 shrink-0">
                                            <span className="text-xs font-bold text-slate-700 truncate">{currentChat.otherUserName}</span>
                                            <span className="text-[10px] font-medium text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">{currentChat.cropName}</span>
                                        </div>
                                    )}

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white custom-scrollbar">
                                        {currentChat.isLoadingHistory ? (
                                            <div className="h-full flex items-center justify-center">
                                                <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
                                            </div>
                                        ) : currentChat.messages.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-50">
                                                <Phone className="w-8 h-8 text-slate-300 mb-2" />
                                                <p className="text-xs font-medium text-slate-500">Coordinate pickup details here.</p>
                                            </div>
                                        ) : (
                                            currentChat.messages.map((msg, idx) => {
                                                const isMe = msg.senderId === currentUser._id;
                                                const showName = idx === 0 || currentChat.messages[idx - 1].senderId !== msg.senderId;

                                                return (
                                                    <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                        {!isMe && showName && (
                                                            <span className="text-[9px] font-bold text-slate-400 ml-1 mb-0.5">{msg.senderName}</span>
                                                        )}
                                                        <div className={`px-3 py-2 rounded-2xl max-w-[85%] ${isMe ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                                                            <p className="text-xs font-medium">{msg.text}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Box */}
                                    <form onSubmit={handleSendMessage} className="p-2 bg-white border-t border-slate-100 shrink-0">
                                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-slate-400 transition-colors">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="Type a message..."
                                                className="flex-1 bg-transparent px-3 py-2 text-xs focus:outline-none font-medium text-slate-700"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className="px-3 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-30 disabled:hover:text-slate-400"
                                            >
                                                <Send className="w-4 h-4 ml-1" />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            );
                        })() : (
                            <div className="flex-1 flex flex-col items-center justify-center bg-white opacity-50">
                                <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                                <p className="text-xs font-medium text-slate-500">Select a chat</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Add these custom scrollbar styles to your global CSS (e.g. index.css)
// .custom-scrollbar::-webkit-scrollbar { width: 4px; }
// .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
// .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
