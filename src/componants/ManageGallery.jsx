import { useEffect, useState, useRef } from 'react';
import {
  getGallery,
  addGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  reorderGallery,
} from '../api/gallery.js';

export default function ManageGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getGallery();
      setImages(res.data.images);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const res = await addGalleryImage(file);
      setImages((prev) => [...prev, res.data.image]);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReplace = async (id, file) => {
    try {
      const res = await updateGalleryImage(id, { file });
      setImages((prev) => prev.map((img) => (img._id === id ? res.data.image : img)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to replace image');
    }
  };

  const handleCaptionSave = async (id, caption) => {
    try {
      const res = await updateGalleryImage(id, { caption });
      setImages((prev) => prev.map((img) => (img._id === id ? res.data.image : img)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update caption');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this image from the gallery?')) return;
    try {
      await deleteGalleryImage(id);
      setImages((prev) => prev.filter((img) => img._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete image');
    }
  };

  // --- Priority-number-based reordering ---
  // The admin types a plain number into a "Priority" field on each card.
  // Lower number = shown first. On save we re-sort the WHOLE list by the
  // new numbers (ties keep their existing relative order), then send that
  // full id order to /gallery/reorder, which re-normalizes everyone to
  // clean 0,1,2... priorities. This means the admin never has to worry
  // about picking unique numbers or leaving gaps -- "put a 1 here" just
  // means "this one goes first."
  const handlePriorityChange = async (id, rawValue) => {
    const typed = Number(rawValue);
    if (Number.isNaN(typed)) return;

    const currentIndex = images.findIndex((img) => img._id === id);
    if (currentIndex === -1) return;

    // Build a sortable list: everyone keeps their current priority except
    // the one being edited, which takes the typed value. Array index is
    // used as a tiebreaker so equal priorities don't jump around randomly.
    const withNewValue = images.map((img, idx) => ({
      id: img._id,
      sortKey: img._id === id ? typed : img.priority,
      idx,
    }));

    withNewValue.sort((a, b) => a.sortKey - b.sortKey || a.idx - b.idx);

    const newOrderIds = withNewValue.map((item) => item.id);

    // Reflect the new order (and re-normalized 0-based priorities) locally
    // right away for a snappy feel, then persist to the server.
    setImages((prev) => {
      const byId = new Map(prev.map((img) => [img._id, img]));
      return newOrderIds.map((imgId, idx) => ({
        ...byId.get(imgId),
        priority: idx,
      }));
    });

    try {
      const res = await reorderGallery(newOrderIds);
      setImages(res.data.images);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save new order');
      load(); // re-sync with server if the save failed
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading gallery...</p>;
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="gallery-upload"
        />
        <label
          htmlFor="gallery-upload"
          className="inline-block text-xs font-semibold bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors cursor-pointer"
        >
          {uploading ? 'Uploading...' : '+ Add Image'}
        </label>
        <p className="text-xs text-gray-400 mt-2">
          Lower "Priority" number shows first. Change the number and it saves automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img) => (
          <GalleryCard
            key={img._id}
            image={img}
            onPriorityChange={(value) => handlePriorityChange(img._id, value)}
            onReplace={(file) => handleReplace(img._id, file)}
            onCaptionSave={(caption) => handleCaptionSave(img._id, caption)}
            onDelete={() => handleDelete(img._id)}
          />
        ))}
      </div>

      {images.length === 0 && (
        <p className="text-sm text-gray-400">No gallery images yet. Add one above.</p>
      )}
    </div>
  );
}

function GalleryCard({ image, onPriorityChange, onReplace, onCaptionSave, onDelete }) {
  const [caption, setCaption] = useState(image.caption || '');
  // Local text state for the priority input so the admin can freely type
  // (e.g. clear the field, type "10") without it being fought over by the
  // prop value on every keystroke. It syncs back up whenever the server
  // confirms a new value (see the useEffect below).
  const [priorityInput, setPriorityInput] = useState(String(image.priority));
  const replaceInputRef = useRef(null);

  useEffect(() => {
    setPriorityInput(String(image.priority));
  }, [image.priority]);

  const captionDirty = caption !== (image.caption || '');
  const priorityDirty = priorityInput !== String(image.priority) && priorityInput.trim() !== '';

  const commitPriority = () => {
    if (priorityDirty) onPriorityChange(priorityInput);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm relative">
      {/* Visible priority badge in the corner -- shows current display order */}
      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded-full z-10">
        #{image.priority}
      </div>

      <img
        src={image.imageUrl}
        alt={image.caption || 'Gallery image'}
        className="w-full h-40 object-cover"
      />

      <div className="p-3">
        <label className="block text-xs font-semibold text-gray-500 mb-1">Priority (lower shows first)</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="number"
            value={priorityInput}
            onChange={(e) => setPriorityInput(e.target.value)}
            onBlur={commitPriority}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="w-20 text-sm border border-gray-200 rounded px-2 py-1"
          />
          {priorityDirty && (
            <button
              onClick={commitPriority}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              Save order
            </button>
          )}
        </div>

        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)"
          className="w-full text-sm border border-gray-200 rounded px-2 py-1 mb-2"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            {captionDirty && (
              <button
                onClick={() => onCaptionSave(caption)}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700"
              >
                Save
              </button>
            )}
            <button
              onClick={() => replaceInputRef.current?.click()}
              className="text-xs text-gray-500 hover:text-gray-800"
            >
              Replace
            </button>
            <input
              ref={replaceInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onReplace(file);
                e.target.value = '';
              }}
            />
          </div>
          <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}