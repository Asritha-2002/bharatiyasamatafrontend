import { useEffect, useState } from 'react';
import {
  getContactMessages,
  markContactMessageRead,
  deleteContactMessage,
} from '../api/contact.js';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function ManageContact() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getContactMessages();
      setMessages(res.data.messages);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      const res = await markContactMessageRead(id);
      setMessages((prev) => prev.map((m) => (m._id === id ? res.data.contactMessage : m)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update message');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return;
    try {
      await deleteContactMessage(id);
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete message');
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading messages...</p>;
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {messages.length} submission{messages.length === 1 ? '' : 's'} total
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-xl p-8 text-sm text-gray-400 italic text-center">
          No contact form submissions yet.
        </div>
      ) : (
        <>
          {/* Desktop / tablet: table */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Contact</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Message</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Received</th>
                  <th className="px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                 
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m._id} className="border-b border-gray-100 last:border-0 align-top">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{m.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <p className="whitespace-nowrap">{m.mobile}</p>
                      <p className="text-xs text-gray-400 break-all">{m.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      {m.message ? (
                        <p className="line-clamp-3">{m.message}</p>
                      ) : (
                        <span className="text-gray-300 italic">No message</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(m.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          m.isRead ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {m.isRead ? 'Read' : 'New'}
                      </span>
                    </td>
                   
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards */}
          <div className="md:hidden space-y-3">
            {messages.map((m) => (
              <div key={m._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      m.isRead ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {m.isRead ? 'Read' : 'New'}
                  </span>
                </div>

                <p className="text-xs text-gray-500">{m.mobile}</p>
                <p className="text-xs text-gray-500 break-all mb-2">{m.email}</p>

                {m.message ? (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2 mb-2">{m.message}</p>
                ) : (
                  <p className="text-sm text-gray-300 italic mb-2">No message</p>
                )}

                <p className="text-xs text-gray-400 mb-3">{formatDate(m.createdAt)}</p>

                
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}