'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, User, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface Rating {
  id: string;
  rating: number;
  review: string | null;
  createdAt: string;
  user?: { name?: string; avatar?: string };
}

export default function ExpertRatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [avgRating, setAvgRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRatings = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('expertToken');
      const res = await fetch(`${API_BASE}/api/experts/ratings?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRatings(data.data.ratings || []);
        setTotalPages(data.data.pages || 1);
        setTotalCount(data.data.total || 0);

        // Calculate average
        if (data.data.ratings?.length > 0) {
          const sum = data.data.ratings.reduce((acc: number, r: Rating) => acc + r.rating, 0);
          setAvgRating(sum / data.data.ratings.length);
        }
      }
    } catch {
      setRatings([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchRatings(); }, [fetchRatings]);

  const renderStars = (count: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= count ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-amber-500">{avgRating.toFixed(1)}</p>
            <div className="flex gap-0.5 mt-2 justify-center">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-1">{totalCount} total reviews</p>
          </div>

          <div className="flex-1 w-full">
            {[5, 4, 3, 2, 1].map(star => {
              const count = ratings.filter(r => r.rating === star).length;
              const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-500 w-6">{star}</span>
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : ratings.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No reviews yet</p>
          <p className="text-xs mt-1">Reviews will appear after completed consultations</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ratings.map(r => (
            <div key={r.id} className="card">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{r.user?.name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  {renderStars(r.rating)}
                  {r.review && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{r.review}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-white dark:bg-gray-900 border hover:bg-gray-50 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-white dark:bg-gray-900 border hover:bg-gray-50 disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
