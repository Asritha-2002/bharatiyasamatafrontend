import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getBlogs } from '../api/blogs.js';

export default function Blogs() {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchBlogs = useCallback(() => {
    setLoading(true);
    setLoadError('');

    getBlogs()
      .then((res) => {
        setBlogs(res.data.blogs || []);
      })
      .catch(() => {
        setLoadError("Couldn't load the blog posts. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Standalone page bar -- no shared Header/Footer here, just Back */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[#344256] font-semibold hover:text-[#F4882A] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-[#F4882A] font-heading text-sm font-semibold uppercase tracking-wide">How do I help</p>
        <h1 className="font-heading text-2xl md:text-4xl font-bold text-[#344256] mt-2">
          National Integration Programme - 2025
        </h1>
        <div className="w-20 h-0.5 bg-[#F4882A] my-6" />

        {loadError ? (
          <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={fetchBlogs}
              className="text-xs font-semibold uppercase tracking-wide text-red-700 hover:text-red-900 shrink-0"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded overflow-hidden shadow-sm">
                <div className="w-full h-52 bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-2">
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <p className="text-sm text-gray-500">No blog posts have been added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link
                key={blog._id}
                to={`/blogs/${blog.sku}`}
                className="block bg-white rounded shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <img src={blog.imageUrl} alt={blog.title} className="w-full h-52 object-cover" />
                <div className="p-5">
                  <h3 className="font-heading text-lg font-bold text-[#344256]">{blog.title}</h3>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{blog.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}