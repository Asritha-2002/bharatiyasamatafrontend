import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBlogs } from '../api/blogs.js';

const DISPLAY_LIMIT = 9;

export default function HowDoIHelp() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getBlogs()
      .then((res) => {
        if (!isMounted) return;
        setBlogs((res.data.blogs || []).slice(0, DISPLAY_LIMIT));
      })
      .catch(() => {
        // Public page -- fail quietly rather than showing an error card.
        if (isMounted) setBlogs([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Nothing to show yet and nothing loading -- don't render an empty section.
  if (!loading && blogs.length === 0) return null;

  return (
    <section id="help" className="py-16 bg-[#FFFFFF]">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-[#F4882A] font-heading text-sm font-semibold uppercase tracking-wide">How do I help</p>
        <h2 className="font-heading text-2xl md:text-4xl font-bold text-[#344256] mt-2">
          National Integration Programme - 2025
        </h2>
        <div className="w-20 h-0.5 bg-[#F4882A] my-6" />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
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
    </section>
  );
}