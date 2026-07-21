import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../api/settings.js';

export default function ManageSettings() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getSettings();
      setForm(res.data.settings);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleNumberChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value === '' ? '' : Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const res = await updateSettings({
        pricePerBook: form.pricePerBook,
        annualBookTarget: form.annualBookTarget,
        soRequireFullBatch: form.soRequireFullBatch,
        soRequiredBatchSize: form.soRequiredBatchSize,
        soRequiredRoCount: form.soRequiredRoCount,
        soPayoutAmountPerMonth: form.soPayoutAmountPerMonth,
        soPayoutDurationMonths: form.soPayoutDurationMonths,
      });
      setForm(res.data.settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <p className="text-sm text-gray-500">Loading settings...</p>;
  }

  return (
    <div className="max-w-3xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-2 mb-4">
          Settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Book pricing */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Book Pricing & Annual Target</h3>
          <p className="text-xs text-gray-400 mb-4">
            Controls checkout pricing and the "X / target" progress shown on dashboards.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Price per book (₹)</label>
              <input
                type="number"
                min="1"
                value={form.pricePerBook}
                onChange={(e) => handleNumberChange('pricePerBook', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Annual book target</label>
              <input
                type="number"
                min="1"
                value={form.annualBookTarget}
                onChange={(e) => handleNumberChange('annualBookTarget', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* SO promotion rule */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">RO → SO Promotion Rule</h3>
          <p className="text-xs text-gray-400 mb-4">
            Controls when a Regional Organizer is automatically promoted to State Organizer.
          </p>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="requireFullBatch"
              checked={form.soRequireFullBatch}
              onChange={(e) => setForm((f) => ({ ...f, soRequireFullBatch: e.target.checked }))}
              className="w-4 h-4"
            />
            <label htmlFor="requireFullBatch" className="text-sm text-gray-700">
              Require a full batch before checking for an RO (stricter rule)
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Required batch size {!form.soRequireFullBatch && <span className="font-normal text-gray-400">(unused while the checkbox above is off)</span>}
              </label>
              <input
                type="number"
                min="1"
                value={form.soRequiredBatchSize}
                onChange={(e) => handleNumberChange('soRequiredBatchSize', e.target.value)}
                disabled={!form.soRequireFullBatch}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Minimum RO recruits required</label>
              <input
                type="number"
                min="1"
                value={form.soRequiredRoCount}
                onChange={(e) => handleNumberChange('soRequiredRoCount', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3">
            {form.soRequireFullBatch
              ? `A parent is promoted to SO once they have a batch of exactly ${form.soRequiredBatchSize || '—'} recruits, with at least ${form.soRequiredRoCount || '—'} of them being RO.`
              : `A parent is promoted to SO as soon as at least ${form.soRequiredRoCount || '—'} of their recruits (regardless of total recruit count) are RO.`}
          </p>
        </div>

        {/* SO payout schedule */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">SO Monthly Payout Schedule</h3>
          <p className="text-xs text-gray-400 mb-4">
            Applied to the 12-row payout schedule auto-generated when a KYC submission is approved.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Payout amount per month (₹)</label>
              <input
                type="number"
                min="0"
                value={form.soPayoutAmountPerMonth}
                onChange={(e) => handleNumberChange('soPayoutAmountPerMonth', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Payout duration (months)</label>
              <input
                type="number"
                min="1"
                value={form.soPayoutDurationMonths}
                onChange={(e) => handleNumberChange('soPayoutDurationMonths', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="text-sm font-semibold bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}