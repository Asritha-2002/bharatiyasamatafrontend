import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyKyc, submitKyc } from '../api/kyc.js';
import ImagePicker from '../componants/ImagePicker.jsx';

export default function Kyc() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    aadhaarNumber: '',
    accountHolderName: '',
    bankAccountNumber: '',
    ifscCode: '',
  });
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [chequeFile, setChequeFile] = useState(null);
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [chequePreview, setChequePreview] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyKyc();
      const existing = res.data.submission;
      setSubmission(existing);
      if (existing) {
        setForm({
          aadhaarNumber: existing.aadhaarNumber,
          accountHolderName: existing.accountHolderName,
          bankAccountNumber: existing.bankAccountNumber,
          ifscCode: existing.ifscCode,
        });
      }
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your KYC status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Object URL previews for newly selected files, cleaned up on change/unmount.
  useEffect(() => {
    if (!aadhaarFile) return;
    const url = URL.createObjectURL(aadhaarFile);
    setAadhaarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [aadhaarFile]);

  useEffect(() => {
    if (!chequeFile) return;
    const url = URL.createObjectURL(chequeFile);
    setChequePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [chequeFile]);

  const isResubmission = submission?.status === 'REJECTED';
  const isPending = submission?.status === 'PENDING';
  const isApproved = submission?.status === 'APPROVED';

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const isFormValid =
    form.aadhaarNumber.trim().length === 12 &&
    form.accountHolderName.trim() &&
    form.bankAccountNumber.trim() &&
    form.ifscCode.trim() &&
    (submission || (aadhaarFile && chequeFile)); // first-time submission needs both files

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await submitKyc({
        ...form,
        aadhaarImage: aadhaarFile,
        chequeImage: chequeFile,
      });
      setSubmission(res.data.submission);
      setAadhaarFile(null);
      setChequeFile(null);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit KYC details');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1">
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Complete Your KYC</h1>
        <p className="text-sm text-gray-500 mb-6">
          As a State Organizer, we need to verify your identity and bank details to enable payment disbursements to you.
        </p>

        {isApproved && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-6">
            ✓ Your KYC has been verified. No further action is needed.
          </div>
        )}

        {isPending && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 mb-6">
            Your KYC details are submitted and awaiting review by the admin team.
          </div>
        )}

        {isResubmission && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            <p className="font-semibold mb-1">Your previous submission was rejected.</p>
            <p>{submission.rejectionReason}</p>
            <p className="mt-1 text-red-600">Please review and resubmit your details below.</p>
          </div>
        )}

        {!isApproved && (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Identity Verification (Aadhaar)</h3>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Aadhaar Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  placeholder="12-digit Aadhaar number"
                  value={form.aadhaarNumber}
                  onChange={(e) => handleChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>

              <ImagePicker
                label="Aadhaar Card Image"
                previewUrl={aadhaarPreview || submission?.aadhaarImageUrl}
                onSelect={setAadhaarFile}
                onClear={() => setAadhaarFile(null)}
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 mt-4">Bank Details</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={form.accountHolderName}
                    onChange={(e) => handleChange('accountHolderName', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={form.ifscCode}
                    onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Bank Account Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.bankAccountNumber}
                  onChange={(e) => handleChange('bankAccountNumber', e.target.value.replace(/\D/g, ''))}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>

              <ImagePicker
                label="Cancelled Cheque Image"
                previewUrl={chequePreview || submission?.chequeImageUrl}
                onSelect={setChequeFile}
                onClear={() => setChequeFile(null)}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {success && (
              <p className="text-sm text-emerald-600">
                KYC details submitted successfully. We'll notify you once it's reviewed.
              </p>
            )}

            <button
              type="submit"
              disabled={!isFormValid || submitting}
              className="w-full sm:w-auto text-sm font-semibold bg-orange-500 text-white px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : isResubmission ? 'Resubmit KYC' : 'Submit KYC'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}