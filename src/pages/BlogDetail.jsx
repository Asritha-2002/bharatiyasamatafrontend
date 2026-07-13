import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function BlogDetail() {
  const { sku } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState('');

  const fetchBlog = useCallback(() => {
    setLoading(true);
    setLoadError('');
    setNotFound(false);

    api
      .get(`/blogs/${sku}`)
      .then((res) => {
        setBlog(res.data.blog);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setLoadError("Couldn't load this post. Please try again.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sku]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

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
        {loading ? (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 h-72 md:h-96 rounded bg-gray-200 animate-pulse" />
            <div className="w-full md:w-1/2 space-y-3">
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ) : notFound ? (
          <div className="text-center py-16">
            <h1 className="font-heading text-xl font-bold text-[#344256] mb-2">Post not found</h1>
            <p className="text-sm text-gray-500 mb-6">This blog post may have been removed or the link is incorrect.</p>
            <Link
              to="/"
              className="inline-block text-sm font-semibold bg-[#F4882A] text-white px-5 py-2.5 rounded-lg hover:bg-[#e67a17] transition-colors"
            >
              Back to Home
            </Link>
          </div>
        ) : loadError ? (
          <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={fetchBlog}
              className="text-xs font-semibold uppercase tracking-wide text-red-700 hover:text-red-900 shrink-0"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="w-full h-72 md:h-96 object-cover rounded shadow-sm"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-[#344256]">{blog.title}</h1>
              <div className="w-16 h-0.5 bg-[#F4882A] my-5" />
              <p className="text-sm md:text-base text-gray-700 whitespace-pre-line leading-relaxed">
                {blog.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}