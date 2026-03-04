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
    MessageCircle
} from 'lucide-react';
import { communityAPI, Post, Reply } from '../services/api';

export function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showNewPostModal, setShowNewPostModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // New Post Form State
    const [newPost, setNewPost] = useState({ title: '', body: '' });
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
            setPosts(data);
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
            // Using a mocked author for now as we don't have full auth state in this view yet
            await communityAPI.createPost({
                title: newPost.title,
                body: newPost.body,
                author: 'Rajesh Kumar'
            });
            setNewPost({ title: '', body: '' });
            setShowNewPostModal(false);
            fetchPosts();
        } catch (err) {
            alert('Failed to create post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredPosts = posts.filter(post =>
        (post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.body.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedCategory === 'All' || post.title.toLowerCase().includes(selectedCategory.toLowerCase()))
    );

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
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border border-white">
                                            <User className="w-5 h-5 text-slate-500" />
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
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                                        <MessageCircle className="w-3 h-3" />
                                        {post.replies?.length || 0}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-2">{post.title}</h3>
                                <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-4">
                                    {post.body}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                                    <div className="flex gap-2">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                            General
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-bold text-green-600 group-hover:gap-2 transition-all">
                                        Read Discussion <ChevronRight className="w-4 h-4" />
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
                    <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
                        <h3 className="text-lg font-bold mb-4">Community Stats</h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-green-100 text-sm">Active Members</span>
                                <span className="font-bold">1.2k+</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-green-100 text-sm">Solved Queries</span>
                                <span className="font-bold">850</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-green-100 text-sm">New Today</span>
                                <span className="font-bold">24</span>
                            </div>
                        </div>
                        <div className="mt-8 p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
                            <p className="text-xs font-medium leading-relaxed">
                                "Knowledge grows when shared. Help a fellow farmer today!"
                            </p>
                        </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Trending Topics</h3>
                        <div className="space-y-3">
                            {['Wheat Rust Prevention', 'Drip Irrigation Tips', 'Organic Fertilizer', 'Kharif Season Prep'].map(topic => (
                                <div key={topic} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                    <span className="text-sm font-medium text-slate-700 group-hover:text-green-700">{topic}</span>
                                </div>
                            ))}
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
                        <form onSubmit={handleCreatePost} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Topic Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., How to treat yellow leaves in Tomato plants?"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Description</label>
                                <textarea
                                    required
                                    rows={6}
                                    placeholder="Provide more details about your question or topic..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
                                    value={newPost.body}
                                    onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex gap-4 pt-2">
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
                                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    {selectedPost.body}
                                </div>
                            </div>

                            {/* Replies Section */}
                            <div className="space-y-6">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                                    <MessageSquare className="w-5 h-5 text-green-600" />
                                    Replies ({selectedPost.replies?.length || 0})
                                </h4>

                                <div className="space-y-4">
                                    {selectedPost.replies && selectedPost.replies.length > 0 ? (
                                        selectedPost.replies.map((reply, idx) => (
                                            <div key={reply._id || idx} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-bold text-slate-900 text-sm">{reply.author}</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(reply.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed">
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
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Write a helpful reply..."
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    value={replyBody}
                                    onChange={(e) => setReplyBody(e.target.value)}
                                />
                                <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all flex items-center gap-2">
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
