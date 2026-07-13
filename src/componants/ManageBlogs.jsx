import { useEffect, useState, useRef } from 'react';
import {
  getBlogs,
  addBlog,
  updateBlog,
  deleteBlog,
  reorderBlogs,
} from '../api/blogs.js';

// Turns arbitrary text into a clean, URL-safe slug: lowercase, spaces/underscores
// become hyphens, anything that isn't a letter/digit/hyphen is stripped, and
// repeated or trailing hyphens are collapsed away. Used both to auto-generate
// the SKU from the title and to finalize whatever the admin typed manually.
function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Lighter sanitizer used while the admin is actively typing in the SKU field
// -- strips disallowed characters and lowercases immediately, but doesn't
// collapse/trim hyphens yet so typing "book-donation-" isn't fought mid-keystroke.
// The full slugify() runs on blur to finalize it.
function sanitizeSkuLive(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-');
}

function RequiredMark() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

// A styled drag-and-drop / click-to-browse image picker with a live preview.
// previewUrl: existing/selected image to show (object URL or a remote URL)
// onSelect(file): called with the chosen File
// onClear(): called when the user removes the current selection
function ImagePicker({ previewUrl, onSelect, onClear, label = 'Featured image' }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const file = fileList?.[0];
    if (file) onSelect(file);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>

      {previewUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 group">
          <img src={previewUrl} alt="Selected preview" className="w-full h-36 object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs font-semibold bg-white text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              Change
            </button>
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-semibold bg-white text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`flex flex-col items-center justify-center h-36 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
            dragActive ? 'border-orange-400 bg-orange-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
        >
          <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h.01M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z" />
          </svg>
          <span className="text-xs font-medium text-gray-500">Click to upload or drag an image here</span>
          <span className="text-[11px] text-gray-400 mt-0.5">JPG, PNG or WEBP</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

const EMPTY_FORM = { title: '', sku: '', description: '', priority: '', file: null };

export default function ManageBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New-blog form state
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Tracks whether the admin has manually typed into the SKU field. While
  // false, SKU auto-follows the title (slugified). The moment they type into
  // SKU directly, it decouples from the title and stays exactly what they typed
  // (sanitized), so we never overwrite a deliberate choice.
  const [skuTouched, setSkuTouched] = useState(false);

  // Object URLs need explicit cleanup or they leak memory -- revoke the old
  // one whenever the selected file changes or the component unmounts.
  useEffect(() => {
    if (!form.file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(form.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.file]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getBlogs();
      setBlogs(res.data.blogs);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleTitleChange = (value) => {
    setForm((f) => ({
      ...f,
      title: value,
      sku: skuTouched ? f.sku : slugify(value),
    }));
  };

  const handleSkuChange = (value) => {
    setSkuTouched(true);
    setForm((f) => ({ ...f, sku: sanitizeSkuLive(value) }));
  };

  const handleSkuBlur = () => {
    setForm((f) => ({ ...f, sku: slugify(f.sku) }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required');
      return;
    }

    // SKU is optional to type, but the URL still needs something -- fall back
    // to a fresh slug of the title (or a timestamp, if the title had nothing
    // slug-able in it, e.g. it was only emoji/punctuation).
    const finalSku = slugify(form.sku) || slugify(form.title) || `blog-${Date.now()}`;

    setCreating(true);
    setError('');
    try {
      const res = await addBlog({
        title: form.title,
        sku: finalSku,
        description: form.description,
        priority: form.priority,
        file: form.file,
      });
      setBlogs((prev) => [...prev, res.data.blog].sort((a, b) => a.priority - b.priority));
      setForm(EMPTY_FORM);
      setSkuTouched(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create blog');
    } finally {
      setCreating(false);
    }
  };

  const handleFieldSave = async (id, fields) => {
    try {
      const res = await updateBlog(id, fields);
      setBlogs((prev) => prev.map((b) => (b._id === id ? res.data.blog : b)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update blog');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog?')) return;
    try {
      await deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete blog');
    }
  };

  // --- Priority-number-based reordering (same pattern as the gallery) ---
  // Typing a number re-sorts the whole list around that value, then the
  // full new id order is sent to /blogs/reorder, which re-normalizes
  // everyone to clean 0,1,2... priorities.
  const handlePriorityChange = async (id, rawValue) => {
    const typed = Number(rawValue);
    if (Number.isNaN(typed)) return;

    const withNewValue = blogs.map((b, idx) => ({
      id: b._id,
      sortKey: b._id === id ? typed : b.priority,
      idx,
    }));

    withNewValue.sort((a, b) => a.sortKey - b.sortKey || a.idx - b.idx);
    const newOrderIds = withNewValue.map((item) => item.id);

    setBlogs((prev) => {
      const byId = new Map(prev.map((b) => [b._id, b]));
      return newOrderIds.map((blogId, idx) => ({
        ...byId.get(blogId),
        priority: idx,
      }));
    });

    try {
      const res = await reorderBlogs(newOrderIds);
      setBlogs(res.data.blogs);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save new order');
      load();
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading blogs...</p>;
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
          {error}
        </div>
      )}

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-gray-800 mb-4">New blog post</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Title<RequiredMark />
            </label>
            <input
              type="text"
              placeholder="e.g. 5 Tips for Better Onboarding"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              SKU <span className="font-normal text-gray-400">(auto-generated from title -- used in the post URL)</span>
            </label>
            <input
              type="text"
              placeholder="auto-filled as you type the title"
              value={form.sku}
              onChange={(e) => handleSkuChange(e.target.value)}
              onBlur={handleSkuBlur}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 font-mono"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Only lowercase letters, numbers, and hyphens -- everything else is removed automatically.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Description<RequiredMark />
          </label>
          <textarea
            placeholder="What's this post about?"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Priority <span className="font-normal text-gray-400">(optional -- defaults to last)</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 0"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>

          <ImagePicker
            previewUrl={previewUrl}
            onSelect={(file) => setForm((f) => ({ ...f, file }))}
            onClear={() => setForm((f) => ({ ...f, file: null }))}
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full sm:w-auto text-xs font-semibold bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {creating ? 'Creating...' : '+ Add Blog'}
        </button>
      </form>

      <p className="text-xs text-gray-400 mb-3">
        Lower "Priority" number shows first. Change the number on any card and it saves automatically.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogs.map((blog) => (
          <BlogCard
            key={blog._id}
            blog={blog}
            onPriorityChange={(value) => handlePriorityChange(blog._id, value)}
            onFieldSave={(fields) => handleFieldSave(blog._id, fields)}
            onDelete={() => handleDelete(blog._id)}
          />
        ))}
      </div>

      {blogs.length === 0 && (
        <p className="text-sm text-gray-400">No blogs yet. Add one above.</p>
      )}
    </div>
  );
}

function BlogCard({ blog, onPriorityChange, onFieldSave, onDelete }) {
  const [title, setTitle] = useState(blog.title);
  const [sku, setSku] = useState(blog.sku);
  const [description, setDescription] = useState(blog.description);
  const [priorityInput, setPriorityInput] = useState(String(blog.priority));
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreview, setPendingPreview] = useState(null);

  useEffect(() => {
    setPriorityInput(String(blog.priority));
  }, [blog.priority]);

  useEffect(() => {
    if (!pendingFile) {
      setPendingPreview(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPendingPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const fieldsDirty =
    title !== blog.title || sku !== blog.sku || description !== blog.description;
  const priorityDirty = priorityInput !== String(blog.priority) && priorityInput.trim() !== '';

  const commitPriority = () => {
    if (priorityDirty) onPriorityChange(priorityInput);
  };

  const commitFields = () => {
    if (!fieldsDirty) return;
    // Finalize the slug on save so nothing malformed ever gets sent, even if
    // an edge case slipped past the live sanitizer while typing.
    const cleanSku = slugify(sku) || blog.sku;
    setSku(cleanSku);
    onFieldSave({ title, sku: cleanSku, description });
  };

  const commitImage = (file) => {
    setPendingFile(file);
    onFieldSave({ file });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm relative">
      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded-full z-10">
        #{blog.priority}
      </div>

      <div className="p-4">
        <div className="mb-3">
          <ImagePicker
            previewUrl={pendingPreview || blog.imageUrl}
            onSelect={commitImage}
            label="Featured image"
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-500 mb-1">Priority</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={priorityInput}
              onChange={(e) => setPriorityInput(e.target.value)}
              onBlur={commitPriority}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
              className="w-20 text-sm border border-gray-200 rounded-lg px-2 py-1.5"
            />
            {priorityDirty && (
              <button onClick={commitPriority} className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                Save order
              </button>
            )}
          </div>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Title<RequiredMark />
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitFields}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            SKU <span className="font-normal text-gray-400">(used in the post URL)</span>
          </label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(sanitizeSkuLive(e.target.value))}
            onBlur={commitFields}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 font-mono"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Changing this changes the post's URL. Only lowercase letters, numbers, and hyphens are kept.
          </p>
        </div>

        <div className="mb-2">
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Description<RequiredMark />
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={commitFields}
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5"
          />
        </div>

        {fieldsDirty && (
          <button
            onClick={commitFields}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 mb-2"
          >
            Save details
          </button>
        )}

        <div className="flex justify-end pt-1 border-t border-gray-100 mt-2">
          <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}