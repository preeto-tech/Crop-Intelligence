import { MessageCircle, ThumbsUp, User, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { communityAPI, Post as APIPost } from '../services/api';

interface Post {
  id?: string;
  author: string;
  title: string;
  body: string;
  createdAt?: string;
}

interface CommunityCardProps {
  onViewAll?: () => void;
}

export function CommunityCard({ onViewAll }: CommunityCardProps) {
  const [posts, setPosts] = useState<APIPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '', author: 'Rajesh Kumar' });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
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
    if (!newPost.title.trim() || !newPost.body.trim()) return;

    try {
      const created = await communityAPI.createPost(newPost);
      setPosts([created, ...posts]);
      setNewPost({ title: '', body: '', author: 'Rajesh Kumar' });
      setShowNewPost(false);
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const getTimeAgo = (date?: string): string => {
    if (!date) return 'Just now';
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
            <div className="h-24 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchPosts}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Community Updates</h3>
          <p className="text-sm text-slate-500">Recent discussions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewPost(!showNewPost)}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            {showNewPost ? 'Cancel' : 'New Post'}
          </button>
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
          >
            View All →
          </button>
        </div>
      </div>

      {showNewPost && (
        <form onSubmit={handleCreatePost} className="mb-4 p-4 bg-green-50/50 rounded-xl border border-green-200">
          <input
            type="text"
            placeholder="Post title..."
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            className="w-full px-3 py-2 mb-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <textarea
            placeholder="Share your thoughts..."
            value={newPost.body}
            onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
            className="w-full px-3 py-2 mb-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            rows={3}
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            <Send className="w-4 h-4" />
            Post
          </button>
        </form>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {posts.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No posts yet. Be the first to post!</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id || Math.random()}
              className="p-4 bg-slate-50/80 rounded-xl hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900">{post.author}</h4>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{getTimeAgo(post.createdAt)}</span>
                  </div>
                  <h5 className="font-medium text-slate-800 mt-1">{post.title}</h5>
                  <p className="text-sm text-slate-700 mt-1 line-clamp-2">
                    {post.body}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-13">
                <button className="flex items-center gap-1.5 text-slate-500 hover:text-green-600 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-xs font-medium">0</span>
                </button>
                <button className="flex items-center gap-1.5 text-slate-500 hover:text-green-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">0</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}