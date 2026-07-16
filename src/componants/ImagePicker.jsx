import { useState, useRef } from 'react';

// A styled drag-and-drop / click-to-browse image picker with a live preview.
// previewUrl: existing/selected image to show (object URL or a remote URL)
// onSelect(file): called with the chosen File
// onClear(): optional -- if provided, shows a "Remove" button
export default function ImagePicker({ previewUrl, onSelect, onClear, label }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    const file = fileList?.[0];
    if (file) onSelect(file);
  };

  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>}

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