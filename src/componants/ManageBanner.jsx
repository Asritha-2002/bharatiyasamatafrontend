import { useEffect, useRef, useState } from 'react';
import { getBanner, saveBanner, deleteBanner } from '../api/bannerApi.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, matches backend limit

function InlineError({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
      <span>{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-semibold uppercase tracking-wide text-red-700 hover:text-red-900 shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default function ManageBanner() {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const fileInputRef = useRef(null);

  const fetchBanner = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await getBanner();
      setBanner(res.data.banner);
    } catch (err) {
      setLoadError(err.response?.data?.message || "Couldn't load the current banner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner();
    // Clean up any object URL we created for a preview
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetSelection = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setFormError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFormError('Only JPG, PNG, and WEBP images are allowed.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFormError('Image must be 5MB or smaller.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFormError('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    setSaving(true);
    setFormError('');
    try {
      const res = await saveBanner(selectedFile);
      setBanner(res.data.banner);
      resetSelection();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save the banner. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteBanner();
      setBanner(null);
      setConfirmingDelete(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to delete the banner. Please try again.');
      setConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading banner…</div>;
  }

  if (loadError) {
    return <InlineError message={loadError} onRetry={fetchBanner} />;
  }

  return (
    <div className="space-y-6">
      {/* Current banner */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Current Banner</p>

        {banner ? (
          <>
            <img
              src={banner.imageUrl}
              alt="Site banner"
              className="w-full max-h-64 object-cover rounded-lg border border-gray-200 mb-4"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-semibold bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Replace Image
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="text-sm font-semibold text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-8">
            <p className="text-sm text-gray-500 mb-4">No banner has been uploaded yet.</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-semibold bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Upload Banner
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Confirm delete */}
      {confirmingDelete && (
        <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-700 mb-4">Delete the current banner? This can't be undone.</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm font-semibold bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Yes, delete it'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="text-sm font-semibold text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Preview of a newly selected file, before saving */}
      {previewUrl && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">New Banner Preview</p>

          <img
            src={previewUrl}
            alt="Selected banner preview"
            className="w-full max-h-64 object-cover rounded-lg border border-gray-200 mb-4"
          />

          {formError && <InlineError message={formError} />}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="text-sm font-semibold bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save Banner'}
            </button>
            <button
              type="button"
              onClick={resetSelection}
              disabled={saving}
              className="text-sm font-semibold text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!previewUrl && formError && <InlineError message={formError} />}
    </div>
  );
}