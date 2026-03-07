import { MessageCircle, ThumbsUp, User, Send, Eye, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { communityAPI, Post } from '../services/api';

interface CommunityCardProps {
  onViewAll?: () => void;
  user?: any;
}

export function CommunityCard({ onViewAll, user }: CommunityCardProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await communityAPI.getPosts();
      setPosts(data.posts || []);
    } catch (err) {
      setError('Failed to fetch community posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date?: string): string => {
    if (!date) return 'Just now';
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-20 bg-slate-100 rounded-xl"></div>
          <div className="h-20 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Community Updates</h3>
          <p className="text-xs text-slate-500 font-medium">Connect with fellow farmers</p>
        </div>
        <button
          onClick={onViewAll}
          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all group"
        >
          <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      <div className="space-y-4">
        {posts.slice(0, 3).map((post) => (
          <div
            key={post._id || post.id}
            className="group p-4 bg-white/40 border border-white/40 rounded-2xl hover:bg-white/80 hover:border-green-100 transition-all cursor-pointer"
            onClick={onViewAll}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-green-100 overflow-hidden flex-shrink-0 shadow-sm">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.author)}`}
                  alt={post.author}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{post.author}</h4>
                  <div className="flex items-center gap-2">
                    {post.expertAnswered && (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-[8px] font-black border border-amber-100 uppercase tracking-tighter">
                        Expert Answer
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-400">{getTimeAgo(post.createdAt)}</span>
                  </div>
                </div>
                <h5 className="text-xs font-bold text-green-700 line-clamp-1 mb-1">{post.title}</h5>

                {post.image && (
                  <div className="mb-2 rounded-lg overflow-hidden h-20 border border-slate-100">
                    <img src={post.image} alt="" className="w-full h-full object-cover" />
                  </div>
                )}

                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {post.body}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-1.5 overflow-hidden">
                    {post.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-medium italic truncate">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{post.upvotes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{post.answers?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400">No discussions found</p>
          </div>
        )}

        <button
          onClick={onViewAll}
          className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
        >
          Explore All Discussions
        </button>
      </div>
    </div>
  );
}