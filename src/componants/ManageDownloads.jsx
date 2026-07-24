import { useEffect, useState, useRef } from 'react';
import {
  getDownloads,
  addDownload,
  updateDownload,
  deleteDownload,
  reorderDownloads,
} from '../api/downloads.js';

function RequiredMark() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

// A click-to-browse / drag-and-drop PDF picker. Shows the selected/existing
// filename instead of an image preview, since PDFs can't be thumbnailed
// without an extra library.
function PdfPicker({ currentUrl, selectedFile, onSelect, onClear, label = 'PDF file', fileName = 'file' }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const file = fileList?.[0];
    if (file) onSelect(file);
  };

  const displayName = selectedFile
    ? selectedFile.name
    : currentUrl
    ? currentUrl.split('/').pop()
    : null;

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>

      {displayName ? (
        <div className="flex items-center justify-between gap-3 border border-gray-200 rounded-lg px-3 py-3 bg-gray-50">
          <div className="flex items-center gap-2 min-w-0">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-gray-700 truncate">{displayName}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {currentUrl && !selectedFile && (
              <a
                href={currentUrl}
                download={`${fileName}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700"
              >
                Download
              </a>
            )}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs font-semibold text-gray-600 hover:text-gray-800"
            >
              Change
            </button>
            {selectedFile && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="text-xs font-semibold text-red-500 hover:text-red-700"
              >
                Cancel
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
          className={`flex flex-col items-center justify-center h-28 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
            dragActive ? 'border-orange-400 bg-orange-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
        >
          <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs font-medium text-gray-500">Click to upload or drag a PDF here</span>
          <span className="text-[11px] text-gray-400 mt-0.5">PDF only, up to 15MB</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}

const EMPTY_FORM = { title: '', description: '', priority: '', file: null };

export default function ManageDownloads() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getDownloads();
      setDownloads(res.data.downloads);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required');
      return;
    }
    if (!form.file) {
      setError('A PDF file is required');
      return;
    }

    setCreating(true);
    setError('');
    try {
      const res = await addDownload({
        title: form.title,
        description: form.description,
        priority: form.priority,
        file: form.file,
      });
      setDownloads((prev) => [...prev, res.data.download].sort((a, b) => a.priority - b.priority));
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create download');
    } finally {
      setCreating(false);
    }
  };

  const handleFieldSave = async (id, fields) => {
    try {
      const res = await updateDownload(id, fields);
      setDownloads((prev) => prev.map((d) => (d._id === id ? res.data.download : d)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update download');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this download?')) return;
    try {
      await deleteDownload(id);
      setDownloads((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete download');
    }
  };

  const handlePriorityChange = async (id, rawValue) => {
    const typed = Number(rawValue);
    if (Number.isNaN(typed)) return;

    const withNewValue = downloads.map((d, idx) => ({
      id: d._id,
      sortKey: d._id === id ? typed : d.priority,
      idx,
    }));

    withNewValue.sort((a, b) => a.sortKey - b.sortKey || a.idx - b.idx);
    const newOrderIds = withNewValue.map((item) => item.id);

    setDownloads((prev) => {
      const byId = new Map(prev.map((d) => [d._id, d]));
      return newOrderIds.map((id, idx) => ({
        ...byId.get(id),
        priority: idx,
      }));
    });

    try {
      const res = await reorderDownloads(newOrderIds);
      setDownloads(res.data.downloads);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save new order');
      load();
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading downloads...</p>;
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
        <h3 className="text-sm font-semibold text-gray-800 mb-4">New download</h3>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Title<RequiredMark />
          </label>
          <input
            type="text"
            placeholder="e.g. Volunteer Registration Form"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Description<RequiredMark />
          </label>
          <textarea
            placeholder="What's this file for?"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
            rows={4}
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Priority <span className="font-normal text-gray-400">(optional -- defaults to last)</span>
          </label>
          <input
            type="number"
            placeholder="e.g. 0"
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
            className="w-full sm:w-40 text-sm border border-gray-200 rounded-lg px-3 py-2"
          />
        </div>

        <div className="mb-5">
          <PdfPicker
            selectedFile={form.file}
            onSelect={(file) => setForm((f) => ({ ...f, file }))}
            onClear={() => setForm((f) => ({ ...f, file: null }))}
            label={<>PDF file<RequiredMark /></>}
            fileName={form.title || 'file'}
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full sm:w-auto text-xs font-semibold bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {creating ? 'Creating...' : '+ Add Download'}
        </button>
      </form>

      <p className="text-xs text-gray-400 mb-3">
        Lower "Priority" number shows first. Change the number on any card and it saves automatically.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {downloads.map((download) => (
          <DownloadCard
            key={download._id}
            download={download}
            onPriorityChange={(value) => handlePriorityChange(download._id, value)}
            onFieldSave={(fields) => handleFieldSave(download._id, fields)}
            onDelete={() => handleDelete(download._id)}
          />
        ))}
      </div>

      {downloads.length === 0 && (
        <p className="text-sm text-gray-400">No downloads yet. Add one above.</p>
      )}
    </div>
  );
}

function DownloadCard({ download, onPriorityChange, onFieldSave, onDelete }) {
  const [title, setTitle] = useState(download.title);
  const [description, setDescription] = useState(download.description);
  const [priorityInput, setPriorityInput] = useState(String(download.priority));
  const [pendingFile, setPendingFile] = useState(null);

  useEffect(() => {
    setPriorityInput(String(download.priority));
  }, [download.priority]);

  const fieldsDirty = title !== download.title || description !== download.description;
  const priorityDirty = priorityInput !== String(download.priority) && priorityInput.trim() !== '';

  const commitPriority = () => {
    if (priorityDirty) onPriorityChange(priorityInput);
  };

  const commitFields = () => {
    if (!fieldsDirty) return;
    onFieldSave({ title, description });
  };

  const commitFile = (file) => {
    setPendingFile(file);
    onFieldSave({ file });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm relative">
      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded-full z-10">
        #{download.priority}
      </div>

      <div className="p-4 pt-9">
        <div className="mb-3">
          <PdfPicker
            currentUrl={download.pdfUrl}
            selectedFile={pendingFile}
            onSelect={commitFile}
            onClear={() => setPendingFile(null)}
            fileName={download.title}
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