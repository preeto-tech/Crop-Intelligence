import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    User,
    MapPin,
    Phone,
    Send,
    Clock,
    ChevronRight,
    CheckCircle2,
    Calendar,
    Search,
    Filter,
    LayoutDashboard,
    LogOut,
    Bell,
    TrendingUp,
    MoreVertical,
    Sparkles,
    BookOpen,
    Copy,
    Check,
    LineChart
} from 'lucide-react';
import { communityAPI, mandiAPI, expertAPI, Post, User as UserType, AgmarknetRecord } from '../services/api';

export function ExpertDashboardPage({ user, onLogout }: { user: UserType, onLogout: () => void }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [answer, setAnswer] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // AI & Mandi Reference
    const [aiAdvice, setAiAdvice] = useState('');
    const [gettingAdvice, setGettingAdvice] = useState(false);
    const [mandiPrices, setMandiPrices] = useState<AgmarknetRecord[]>([]);
    const [mandiLoading, setMandiLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'ai' | 'mandi'>('ai');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchPosts();
        fetchMandiData();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await communityAPI.getPosts();
            setPosts(data.posts || []);
        } catch (err) {
            console.error('Failed to fetch posts', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMandiData = async () => {
        try {
            setMandiLoading(true);
            const response = await mandiAPI.getData(1, 10);
            setMandiPrices(response.data.records || []);
        } catch (err) {
            console.error('Failed to fetch mandi data', err);
        } finally {
            setMandiLoading(false);
        }
    };

    const handleGetAIAdvice = async () => {
        if (!selectedPost) return;
        try {
            setGettingAdvice(true);
            setAiAdvice('');
            const response = await expertAPI.getAIAdvice({
                question: selectedPost.body,
                crop: selectedPost.category,
                location: selectedPost.authorLocation
            });
            setAiAdvice(response.advice);
            setActiveTab('ai');
        } catch (err) {
            console.error('AI Advice error:', err);
        } finally {
            setGettingAdvice(false);
        }
    };

    const handleCopyAdvice = () => {
        setCopied(true);
        setAnswer(prev => prev + (prev ? '\n\n' : '') + aiAdvice);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAnswerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPost || !answer.trim()) return;

        try {
            setSubmitting(true);
            const postId = selectedPost._id || selectedPost.id || '';
            await communityAPI.addAnswer(postId, answer);
            setAnswer('');
            setAiAdvice('');
            // Refresh post
            const updated = await communityAPI.getById(postId);
            setSelectedPost(updated);
            fetchPosts();
        } catch (err) {
            alert('Failed to submit answer');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.body.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col h-full">
                <div className="p-8">
                     <div className="flex items-center gap-2.5">
                        <img src="/logo.png" alt="FarmIQ" className="h-9 w-auto" />
                        <span className="text-xl font-extrabold text-white tracking-tight">
                            Farm<span className="text-green-400">IQ</span>
                        </span>
                    </div>

                    <nav className="space-y-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-bold transition-all shadow-sm">
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                        </button>
                    
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white overflow-hidden shadow-sm">
                            <img
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 font-medium truncate uppercase tracking-widest">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex overflow-hidden">
                {/* Center Content: Questions & Details */}
                <div className="flex-1 flex flex-col h-full bg-white border-r border-slate-100">
                    {/* Header */}
                    <header className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md">
                        <div className="flex items-center gap-8 flex-1 max-w-2xl">
                            <div className="relative w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search community questions..."
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Questions List */}
                        <div className="w-[400px] border-r border-slate-100 flex flex-col h-full bg-slate-50/50">
                            <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-white">
                                <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
                                    New Questions
                                    <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                                        {filteredPosts.length}
                                    </span>
                                </h2>
                                <button className="text-slate-400 hover:text-slate-600"><Filter className="w-4 h-4" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse">
                                            <div className="h-4 bg-slate-100 rounded w-2/3 mb-4"></div>
                                            <div className="h-2 bg-slate-100 rounded w-full mb-2"></div>
                                        </div>
                                    ))
                                ) : (
                                    filteredPosts.map(post => (
                                        <div
                                            key={post._id || post.id}
                                            onClick={() => setSelectedPost(post)}
                                            className={`group relative bg-white p-6 rounded-2xl border transition-all cursor-pointer hover:shadow-lg ${selectedPost?._id === post._id ? 'border-green-500 shadow-md ring-1 ring-green-500' : 'border-slate-100 shadow-sm'}`}
                                        >
                                            <div className="flex items-center justify-between mb-3 text-[10px] font-bold uppercase tracking-wider">
                                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md">{post.category || 'General'}</span>
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-green-600 transition-colors">
                                                {post.title}
                                            </h3>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                <span className="text-[10px] font-bold text-slate-500">{post.author}</span>
                                                {post.answered && (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Question Detail View */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                            {selectedPost ? (
                                <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
                                    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                                        <div className="relative flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                <User className="w-6 h-6 text-green-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-black">{selectedPost.author}</h3>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                                        <MapPin className="w-3 h-3 text-green-500" />
                                                        {selectedPost.authorLocation || 'Not Specified'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-black text-slate-900 leading-tight">
                                            {selectedPost.title}
                                        </h2>
                                        <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                            {selectedPost.body}
                                        </p>
                                        {selectedPost.image && (
                                            <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-lg">
                                                <img src={selectedPost.image} alt="Crop Problem" className="w-full object-cover max-h-[300px]" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Expert Response Area */}
                                    <div className="pt-8 border-t border-slate-100 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Send className="text-green-600 w-5 h-5" />
                                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">Expert Solution</h4>
                                            </div>
                                        </div>

                                        <form onSubmit={handleAnswerSubmit} className="space-y-4">
                                            <textarea
                                                rows={5}
                                                className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-green-600/30 focus:bg-white transition-all text-base font-medium"
                                                placeholder="Write your professional advice here..."
                                                value={answer}
                                                onChange={(e) => setAnswer(e.target.value)}
                                            ></textarea>
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {submitting ? 'Submitting...' : 'Post Expert Solution'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
                                    <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
                                    <h3 className="text-xl font-black text-slate-800">Select a Question</h3>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Reference Center */}
                <aside className="w-[380px] bg-slate-50 flex flex-col h-full border-l border-slate-100">
                    <div className="p-6 border-b border-slate-200 bg-white">
                        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-green-600" />
                            Reference Center
                        </h2>
                    </div>

                    <div className="flex p-2 bg-slate-100 m-4 rounded-xl">
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === 'ai' ? 'bg-white shadow-md text-green-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            AI Helper
                        </button>
                        <button
                            onClick={() => setActiveTab('mandi')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-black transition-all ${activeTab === 'mandi' ? 'bg-white shadow-md text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LineChart className="w-3.5 h-3.5" />
                            Mandi Prices
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {activeTab === 'ai' ? (
                            <div className="space-y-4">
                                {!selectedPost ? (
                                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2 opacity-60">
                                        <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">Select a post to use AI</p>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleGetAIAdvice}
                                            disabled={gettingAdvice}
                                            className="w-full p-4 bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-green-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {gettingAdvice ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                    Analyzing...
                                                </span>
                                            ) : 'Get Expert AI Suggestion'}
                                        </button>

                                        {aiAdvice && (
                                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in zoom-in-95 duration-300">
                                                <div className="p-4 bg-green-50 border-b border-green-100 flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-green-700 uppercase">AI Recommendation</span>
                                                    <button
                                                        onClick={handleCopyAdvice}
                                                        className={`p-1.5 rounded-md transition-all ${copied ? 'bg-green-600 text-white' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                                                    >
                                                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                                <div className="p-5 text-xs font-medium text-slate-700 leading-relaxed prose prose-slate">
                                                    {aiAdvice.split('\n').map((line, i) => (
                                                        <p key={i} className="mb-2">{line}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-2 mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Rates</span>
                                    <button onClick={fetchMandiData} className="text-[10px] font-black text-blue-600 uppercase hover:underline">Refresh</button>
                                </div>
                                {mandiLoading ? (
                                    [1, 2, 3, 4].map(i => (
                                        <div key={i} className="bg-white h-16 rounded-xl border border-slate-100 animate-pulse"></div>
                                    ))
                                ) : (
                                    mandiPrices.map((record, i) => (
                                        <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition-colors">
                                            <div>
                                                <p className="text-xs font-bold text-slate-900">{record.cmdt_name}</p>
                                                <p className="text-[10px] font-medium text-slate-500">{record.reported_date}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-blue-600">₹{record.as_on_price}</p>
                                                <p className={`text-[9px] font-bold ${record.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {record.trend === 'up' ? '↑' : '↓'} Market Trend
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </main>
        </div>
    );
}

