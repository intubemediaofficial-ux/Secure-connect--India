'use client';

import { useState, useEffect } from 'react';
import { Star, User, TrendingUp } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface Review { id: string; rating: number; review?: string; createdAt: string; user?: { name?: string }; }

export default function ExpertRatingsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [distribution, setDistribution] = useState<number[]>([0, 0, 0, 0, 0]);

  useEffect(() => { fetchRatings(); }, [page]);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('expertToken');
      const res = await fetch(`${API_BASE}/api/experts/ratings?page=${page}&limit=10`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data.ratings || []);
        setTotal(data.data.total || 0);
        setAvgRating(data.data.averageRating || 0);
        if (data.data.distribution) setDistribution(data.data.distribution);
      }
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-700'}`} />
      ))}
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Rating Summary */}
      <div className="card">
        <div className="flex items-start gap-8">
          <div className="text-center">
            <p className="text-5xl font-bold text-white">{avgRating.toFixed(1)}</p>
            <div className="flex gap-0.5 mt-2 justify-center">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-700'}`} />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">{total} reviews</p>
          </div>

          {/* Distribution Bars */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = distribution[star - 1] || 0;
              const pct = total > 0 ? (count / total) * 100 : 0;
              const barColors = ['from-red-500 to-red-400', 'from-orange-500 to-orange-400', 'from-amber-500 to-amber-400', 'from-lime-500 to-lime-400', 'from-emerald-500 to-emerald-400'];
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 w-8">{star} ★</span>
                  <div className="flex-1 h-2.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${barColors[star - 1]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <div className="card text-center py-12">
          <Star className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <p className="text-gray-400">No reviews yet</p>
          <p className="text-gray-600 text-sm mt-1">Reviews will appear here after consultations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-full flex items-center justify-center border border-amber-500/20">
                    <User className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-200">{r.user?.name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                {renderStars(r.rating)}
              </div>
              {r.review && <p className="text-gray-400 text-sm pl-13">{r.review}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 10 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-gray-400 hover:bg-white/[0.1] disabled:opacity-30 transition">
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 10)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 10)}
            className="px-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm text-gray-400 hover:bg-white/[0.1] disabled:opacity-30 transition">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
