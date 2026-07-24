import { useEffect, useState, useRef } from 'react';
import {
  getAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  reorderAppointments,
} from '../api/appointments.js';

function RequiredMark() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

// A styled drag-and-drop / click-to-browse image picker with a live preview.
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

// Dynamic list of { label, url } rows -- add/remove/edit any number of links.
function LinksEditor({ links, onChange }) {
  const updateLink = (index, field, value) => {
    const next = links.map((l, i) => (i === index ? { ...l, [field]: value } : l));
    onChange(next);
  };

  const removeLink = (index) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const addLink = () => {
    onChange([...links, { label: '', url: '' }]);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">Links</label>

      {links.length === 0 && (
        <p className="text-xs text-gray-400 italic mb-2">No links added yet.</p>
      )}

      <div className="space-y-2">
        {links.map((link, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Label (e.g. Register here)"
              value={link.label}
              onChange={(e) => updateLink(index, 'label', e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="https://..."
              value={link.url}
              onChange={(e) => updateLink(index, 'url', e.target.value)}
              className="flex-[1.5] text-sm border border-gray-200 rounded-lg px-3 py-2 font-mono"
            />
            <button
              type="button"
              onClick={() => removeLink(index)}
              className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 shrink-0"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addLink}
        className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700"
      >
        + Add link
      </button>
    </div>
  );
}

const EMPTY_FORM = { title: '', description: '', priority: '', links: [], file: null };

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState(null);

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
      const res = await getAppointments();
      setAppointments(res.data.appointments);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Only send links that actually have both a label and a url -- drop empty
  // rows the admin added but never filled in.
  const cleanLinks = (links) =>
    links.filter((l) => l.label.trim() && l.url.trim()).map((l) => ({ label: l.label.trim(), url: l.url.trim() }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required');
      return;
    }

    setCreating(true);
    setError('');
    try {
      const res = await addAppointment({
        title: form.title,
        description: form.description,
        priority: form.priority,
        links: cleanLinks(form.links),
        file: form.file,
      });
      setAppointments((prev) => [...prev, res.data.appointment].sort((a, b) => a.priority - b.priority));
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create appointment');
    } finally {
      setCreating(false);
    }
  };

  const handleFieldSave = async (id, fields) => {
    try {
      const res = await updateAppointment(id, fields);
      setAppointments((prev) => prev.map((a) => (a._id === id ? res.data.appointment : a)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete appointment');
    }
  };

  const handlePriorityChange = async (id, rawValue) => {
    const typed = Number(rawValue);
    if (Number.isNaN(typed)) return;

    const withNewValue = appointments.map((a, idx) => ({
      id: a._id,
      sortKey: a._id === id ? typed : a.priority,
      idx,
    }));

    withNewValue.sort((a, b) => a.sortKey - b.sortKey || a.idx - b.idx);
    const newOrderIds = withNewValue.map((item) => item.id);

    setAppointments((prev) => {
      const byId = new Map(prev.map((a) => [a._id, a]));
      return newOrderIds.map((id, idx) => ({
        ...byId.get(id),
        priority: idx,
      }));
    });

    try {
      const res = await reorderAppointments(newOrderIds);
      setAppointments(res.data.appointments);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save new order');
      load();
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading appointments...</p>;
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
        <h3 className="text-sm font-semibold text-gray-800 mb-4">New appointment info</h3>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Title<RequiredMark />
          </label>
          <input
            type="text"
            placeholder="e.g. Volunteer Orientation Session"
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
            placeholder="What's this appointment about?"
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
          <LinksEditor
            links={form.links}
            onChange={(links) => setForm((f) => ({ ...f, links }))}
          />
        </div>

        <div className="mb-5">
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
          {creating ? 'Creating...' : '+ Add Appointment'}
        </button>
      </form>

      <p className="text-xs text-gray-400 mb-3">
        Lower "Priority" number shows first. Change the number on any card and it saves automatically.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment._id}
            appointment={appointment}
            onPriorityChange={(value) => handlePriorityChange(appointment._id, value)}
            onFieldSave={(fields) => handleFieldSave(appointment._id, fields)}
            onDelete={() => handleDelete(appointment._id)}
          />
        ))}
      </div>

      {appointments.length === 0 && (
        <p className="text-sm text-gray-400">No appointments yet. Add one above.</p>
      )}
    </div>
  );
}

function AppointmentCard({ appointment, onPriorityChange, onFieldSave, onDelete }) {
  const [title, setTitle] = useState(appointment.title);
  const [description, setDescription] = useState(appointment.description);
  const [links, setLinks] = useState(appointment.links || []);
  const [priorityInput, setPriorityInput] = useState(String(appointment.priority));
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreview, setPendingPreview] = useState(null);

  useEffect(() => {
    setPriorityInput(String(appointment.priority));
  }, [appointment.priority]);

  useEffect(() => {
    if (!pendingFile) {
      setPendingPreview(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPendingPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const linksChanged = JSON.stringify(links) !== JSON.stringify(appointment.links || []);
  const fieldsDirty = title !== appointment.title || description !== appointment.description || linksChanged;
  const priorityDirty = priorityInput !== String(appointment.priority) && priorityInput.trim() !== '';

  const commitPriority = () => {
    if (priorityDirty) onPriorityChange(priorityInput);
  };

  const commitFields = () => {
    if (!fieldsDirty) return;
    const cleanedLinks = links.filter((l) => l.label.trim() && l.url.trim()).map((l) => ({ label: l.label.trim(), url: l.url.trim() }));
    setLinks(cleanedLinks);
    onFieldSave({ title, description, links: cleanedLinks });
  };

  const commitImage = (file) => {
    setPendingFile(file);
    onFieldSave({ file });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm relative">
      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-semibold px-2 py-0.5 rounded-full z-10">
        #{appointment.priority}
      </div>

      <div className="p-4">
        <div className="mb-3">
          <ImagePicker
            previewUrl={pendingPreview || appointment.imageUrl}
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

        <div className="mb-2">
          <LinksEditor links={links} onChange={setLinks} />
        </div>

        {(fieldsDirty || linksChanged) && (
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