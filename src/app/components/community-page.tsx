import { useState, useEffect } from 'react';
import {
    MessageSquare,
    Search,
    Plus,
    User,
    Clock,
    ChevronRight,
    Filter,
    Send,
    X,
    MessageCircle,
    Image as ImageIcon,
    Tag,
    Trash2,
    ThumbsUp,
    Eye,
    TrendingUp,
    Zap,
    CheckCircle2
} from 'lucide-react';
import { communityAPI, Post, Reply } from '../services/api';

export function CommunityPage({ user }: { user?: any }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showNewPostModal, setShowNewPostModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // New Post Form State
    const [newPost, setNewPost] = useState({
        title: '',
        body: '',
        category: 'General',
        tags: [] as string[],
        image: '' as string | null
    });
    const [tagInput, setTagInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reply Form State
    const [replyBody, setReplyBody] = useState('');

    const categories = ['All', 'General', 'Pests', 'Fertilizers', 'Market', 'Irrigation'];

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await communityAPI.getPosts();
            setPosts(data.posts || []);
        } catch (err) {
            setError('Failed to fetch community posts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await communityAPI.createPost({
                title: newPost.title,
                body: newPost.body,
                category: newPost.category,
                tags: newPost.tags,
                image: newPost.image || undefined
            });
            setNewPost({ title: '', body: '', category: 'General', tags: [], image: null });
            setShowNewPostModal(false);
            fetchPosts();
        } catch (err) {
            alert('Failed to create post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File size should be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPost({ ...newPost, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!newPost.tags.includes(tagInput.trim())) {
                setNewPost({ ...newPost, tags: [...newPost.tags, tagInput.trim().toLowerCase()] });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setNewPost({ ...newPost, tags: newPost.tags.filter(t => t !== tagToRemove) });
    };

    const handleUpvote = async (postId: string) => {
        try {
            await communityAPI.upvotePost(postId);
            fetchPosts();
            if (selectedPost && (selectedPost._id === postId || selectedPost.id === postId)) {
                const updated = await communityAPI.getById(postId);
                setSelectedPost(updated);
            }
        } catch (err) {
            console.error('Failed to upvote', err);
        }
    };

    const handleAddAnswer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyBody.trim() || !selectedPost) return;

        try {
            const postId = selectedPost._id || selectedPost.id;
            if (!postId) return;

            await communityAPI.addAnswer(postId, replyBody);
            setReplyBody('');
            const updated = await communityAPI.getById(postId);
            setSelectedPost(updated);
            fetchPosts();
        } catch (err) {
            alert('Failed to add reply');
        }
    };

    const filteredPosts = Array.isArray(posts) ? posts.filter(post =>
        (post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.body.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedCategory === 'All' || post.category === selectedCategory)
    ) : [];

    // Real-time Analytics Calculations
    const totalPosts = posts.length;
    const activeMembers = new Set(posts.map(p => p.author)).size;
    const solvedQueries = posts.filter(p => p.answered || (p.answers && p.answers.length > 0)).length;
    const newToday = posts.filter(p => {
        const created = p.createdAt ? new Date(p.createdAt) : new Date();
        const today = new Date();
        return created.toDateString() === today.toDateString();
    }).length;

    // Trending Topics (based on tags)
    const allTags = posts.flatMap(p => p.tags || []);
    const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const trendingTopics = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([tag]) => ({ name: tag.charAt(0).toUpperCase() + tag.slice(1) }));

    // Community Pulse (latest replies)
    const allReplies = posts.flatMap(p =>
        (p.answers || []).map(a => ({ ...a, postTitle: p.title, postId: p._id || p.id }))
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    if (loading && posts.length === 0) {
        return (
            <div className="flex-1 p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                        Farmer Community Forum
                    </h2>
                    <p className="text-slate-600 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Connect, share, and grow with 500+ local farmers
                    </p>
                </div>

                <button
                    onClick={() => setShowNewPostModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/30 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Start a Discussion
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search discussions, questions, or tips..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === cat
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-white/50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Discussion List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map(post => (
                            <div
                                key={post._id || post.id}
                                onClick={() => setSelectedPost(post)}
                                className="group bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-green-200 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-green-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-white overflow-hidden shadow-sm">
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.author)}`}
                                                alt={post.author}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 group-hover:text-green-700 transition-colors">
                                                {post.author}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {post.expertAnswered && (
                                            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black border border-amber-100 animate-pulse">
                                                <TrendingUp className="w-3 h-3" />
                                                EXPERT ANSWERED
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                                            <MessageCircle className="w-3 h-3" />
                                            {post.answers?.length || 0}
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-2">{post.title}</h3>
                                {post.image && (
                                    <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 max-h-60">
                                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-4">
                                    {post.body}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                            {post.category || 'General'}
                                        </span>
                                        {post.tags?.map(t => (
                                            <span key={t} className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-medium italic">
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-400">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleUpvote(post._id || post.id || ''); }}
                                            className="flex items-center gap-1 hover:text-green-600 transition-colors"
                                        >
                                            <ThumbsUp className="w-3.5 h-3.5" />
                                            <span className="text-xs">{post.upvotes || 0}</span>
                                        </button>
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-3.5 h-3.5" />
                                            <span className="text-xs">{post.views || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No discussions found</h3>
                            <p className="text-slate-500">Try adjusting your search or category filter</p>
                        </div>
                    )}
                </div>

                {/* Sidebar / Stats */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        <h3 className="text-lg font-bold mb-4 relative z-10">Real-time Pulse</h3>
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-green-100 text-sm">Active Farmers</span>
                                <span className="font-bold">{activeMembers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-green-100 text-sm">Solved Queries</span>
                                <span className="font-bold">{solvedQueries}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-green-100 text-sm">New Discussions</span>
                                <span className="font-bold">{newToday}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            Trending Topics
                        </h3>
                        <div className="space-y-3">
                            {trendingTopics.length > 0 ? trendingTopics.map(topic => (
                                <div key={topic.name} className="flex items-center gap-3 p-2 hover:bg-green-50 rounded-lg cursor-pointer transition-colors group">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-green-700">#{topic.name}</span>
                                </div>
                            )) : (
                                <p className="text-xs text-slate-400 italic">No topics trending yet</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                Community Pulse
                            </h3>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase tracking-tighter animate-pulse border border-red-100">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                Live
                            </div>
                        </div>
                        <div className="space-y-4">
                            {allReplies.length > 0 ? allReplies.map((reply, idx) => (
                                <div key={idx} className="group border-l-2 border-green-100 pl-4 py-1 hover:border-green-500 transition-all cursor-default">
                                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1 truncate">
                                        {reply.author}
                                    </p>
                                    <p className="text-xs text-slate-700 line-clamp-2 font-medium mb-1 italic group-hover:text-slate-900 transition-colors">
                                        "{reply.body}"
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-bold truncate">
                                        on {reply.postTitle}
                                    </p>
                                </div>
                            )) : (
                                <div className="text-center py-4 text-slate-400">
                                    <p className="text-xs">Waiting for newest replies...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* New Post Modal */}
            {showNewPostModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setShowNewPostModal(false)}
                    ></div>
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-900">Start new discussion</h3>
                            <button
                                onClick={() => setShowNewPostModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleCreatePost} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Topic Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g., How to treat yellow leaves?"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Category</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                        value={newPost.category}
                                        onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                                    >
                                        {categories.filter(c => c !== 'All').map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Provide more details about your question or topic..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
                                    value={newPost.body}
                                    onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Tags (Press Enter to add)</label>
                                <div className="flex flex-wrap gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-green-500/20">
                                    {newPost.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder="Add tags..."
                                        className="flex-1 bg-transparent border-none outline-none text-sm p-1"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={addTag}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Attach Image</label>
                                <div className="relative group cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className={`w-full h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${newPost.image ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-50 group-hover:border-green-400 group-hover:bg-green-50/50'}`}>
                                        {newPost.image ? (
                                            <div className="relative w-full h-full p-2 flex items-center justify-center">
                                                <img src={newPost.image} alt="Preview" className="h-full rounded-lg object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setNewPost({ ...newPost, image: null }); }}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-20"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                                                <p className="text-xs text-slate-500 font-medium">Click or drag image to upload</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setShowNewPostModal(false)}
                                    className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? 'Posting...' : <><Send className="w-4 h-4" /> Post Discussion</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Post Detail Drawer / View */}
            {selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-end">
                    <div
                        className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"
                        onClick={() => setSelectedPost(null)}
                    ></div>
                    <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180" /> Back to Forum
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">General</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">👤</div>
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-900">{selectedPost.author}</h3>
                                        <p className="text-xs text-slate-500">{selectedPost.createdAt ? new Date(selectedPost.createdAt).toLocaleString() : 'Just now'}</p>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">{selectedPost.title}</h2>
                                {selectedPost.image && (
                                    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                        <img src={selectedPost.image} alt={selectedPost.title} className="w-full object-cover max-h-[400px]" />
                                    </div>
                                )}
                                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    {selectedPost.body}
                                </div>
                                {selectedPost.tags && selectedPost.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {selectedPost.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5">
                                                <Tag className="w-3 h-3" />
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Replies Section */}
                            <div className="space-y-6">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                                    <MessageSquare className="w-5 h-5 text-green-600" />
                                    Replies ({selectedPost.answers?.length || 0})
                                </h4>

                                <div className="space-y-4">
                                    {selectedPost.answers && selectedPost.answers.length > 0 ? (
                                        selectedPost.answers.map((reply: any, idx: number) => (
                                            <div key={reply.id || idx} className={`rounded-2xl p-5 border transition-all ${reply.isExpert
                                                ? 'bg-green-50/80 border-green-200 shadow-lg shadow-green-500/5 ring-1 ring-green-400/20'
                                                : 'bg-slate-50/50 border-slate-100'
                                                }`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 text-sm">{reply.author}</span>
                                                        {reply.isExpert && (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-600 text-white rounded-md text-[9px] font-black uppercase tracking-wider">
                                                                <CheckCircle2 className="w-2.5 h-2.5" />
                                                                Certified Expert
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className={`text-sm leading-relaxed ${reply.isExpert ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
                                                    {reply.body}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-400">
                                            <p className="text-sm">No replies yet. Be the first to help!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Reply Bar */}
                        <div className="p-6 border-t border-slate-100 bg-white">
                            <form onSubmit={handleAddAnswer} className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Write a helpful reply..."
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    value={replyBody}
                                    onChange={(e) => setReplyBody(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
