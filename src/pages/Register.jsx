import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [searchParams] = useSearchParams();
  const refFromUrl = searchParams.get('ref') || '';
  const hasReferral = refFromUrl.trim() !== '';

  const [form, setForm] = useState({
    name: '',
    email: '',
    contactNumber: '',
    password: '',
    referralCode: refFromUrl,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // When there's no ref code in the URL, we deliberately don't send a
      // referralCode field at all -- the backend treats a missing code as
      // "register under the main admin" and fills in that referredBy itself.
      // Keeping that decision server-side means it can't be spoofed by
      // editing form state or the request body in devtools.
      const { name, email, contactNumber, password, referralCode } = form;
      const payload = hasReferral
        ? { name, email, contactNumber, password, referralCode }
        : { name, email, contactNumber, password };

      await register(payload);
      navigate('/welcome');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Join Bharatiya Samata</h1>
        <p className="text-sm text-gray-500 mb-6">
          {hasReferral
            ? `Registering with recruitment code: ${refFromUrl}`
            : "You'll be registered under Bharatiya Samata's main network."}
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              value={form.contactNumber}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Referral Code only appears when the invite link actually carried
              one. With no ?ref= in the URL, this field is omitted entirely --
              not shown disabled, not shown pre-filled -- so there's nothing
              here for the person to second-guess or try to edit. */}
          {hasReferral && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recruitment Code</label>
              <input
                type="text"
                name="referralCode"
                value={form.referralCode}
                onChange={handleChange}
                placeholder="Code from the person who invited you"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 text-white font-semibold py-2.5 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-5">
          Already have an account? <Link to="/login" className="text-orange-600 font-semibold">Log in</Link>
        </p>
      </div>
    </div>
  );
}