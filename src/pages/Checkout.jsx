import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios.js';
import { DashboardLoading } from '../componants/DashboardStates.jsx';
import { OfflineBanner, DashboardIssueCard } from '../componants/ConnectionNotice.jsx';

// Price is per book, in your currency's smallest sensible display unit.
// Kept as a single constant so it's easy to find and change later.
const PRICE_PER_BOOK = 60;

// Preset quantities the person can pick with one tap. "My wish" reveals a
// free-entry field instead of one of these fixed numbers.
const BOOK_OPTIONS = [2, 5, 10, 20, 30, 40, 100, 200];
const CUSTOM_OPTION = 'custom';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  // If we arrived here via navigate('/checkout', { state: {...} }) from the
  // dashboard, we already have the person's info and can skip the fetch.
  // Otherwise (direct link, refresh) we fetch it ourselves so the prefilled
  // fields are still correct.
  const [data, setData] = useState(location.state?.dashboardData || null);
  const [loading, setLoading] = useState(!location.state?.dashboardData);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  // Add this state near your other useState calls
const [processing, setProcessing] = useState(false);
const [paymentError, setPaymentError] = useState('');



  const [form, setForm] = useState({
    name: '',
    contactNumber: '',
    email: '',
    introducedByRegId: '',
    myRegId: '',
    bookSelection: 2,
    customBookCount: '',
  });

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (data) return; // already have it from navigation state

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/dashboard/me');
        if (!cancelled) setData(res.data);
      } catch (err) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          navigate('/login', { replace: true });
          return;
        }
        if (!cancelled) {
          setError({
            title: 'Could not load your details',
            message: "We couldn't fetch your account info. Please try again.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [data, navigate]);

  // Once we have the person's data, prefill the form from it.
  useEffect(() => {
    if (!data) return;
    setForm((f) => ({
      ...f,
      name: f.name || data.me.name || '',
      contactNumber: f.contactNumber || data.me.contactNumber || '',
      email: f.email || data.me.email || '',
      introducedByRegId: data.parent?.regNo || '',
      myRegId: data.me.regNo || '',
    }));
  }, [data]);

  const bookCount = useMemo(() => {
    if (form.bookSelection === CUSTOM_OPTION) {
      const n = Number(form.customBookCount);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    }
    return Number(form.bookSelection) || 0;
  }, [form.bookSelection, form.customBookCount]);

  const totalAmount = bookCount * PRICE_PER_BOOK;

  const isFormValid =
    form.name.trim() &&
    form.contactNumber.trim() &&
    form.email.trim() &&
    bookCount > 0;

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

 const handleProceedToPayment = async () => {
  setPaymentError('');
  setProcessing(true);

  try {
    const { data: orderData } = await api.post('/purchase/create-order', {
      name: form.name.trim(),
      contactNumber: form.contactNumber.trim(),
      email: form.email.trim(),
      introducedByRegId: form.introducedByRegId,
      bookCount
    });

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Bharatiya Samata Hindi Prachar Parishad',
      description: `${bookCount} book${bookCount === 1 ? '' : 's'} purchase`,
      order_id: orderData.orderId,
      prefill: {
        name: form.name.trim(),
        email: form.email.trim(),
        contact: form.contactNumber.trim()
      },
      theme: { color: '#F4882A' },
      handler: async function (response) {
        try {
          await api.post('/purchase/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            registrationId: orderData.registrationId
          });
          setSubmitted(true);
          // Send them back to their dashboard after a short pause so they see the confirmation
          setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
          setPaymentError('Payment succeeded but verification failed. Please contact support with your payment ID.');
        } finally {
          setProcessing(false);
        }
      },
      modal: {
        ondismiss: function () {
          setProcessing(false);
        }
      }
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
  } catch (err) {
    setPaymentError(err.response?.data?.error || 'Something went wrong creating your order.');
    setProcessing(false);
  }
};

  if (!isOnline) {
    // Still render the banner even mid-load so the person isn't left guessing.
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <OfflineBanner onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <DashboardIssueCard error={error} onRetry={() => window.location.reload()} onLogout={() => navigate('/login')} />
        </div>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <DashboardLoading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Checkout</h1>
        <p className="text-sm text-gray-500 mb-6">Fill in your details and choose how many books you'd like.</p>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Your details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Mobile number</label>
              <input
                type="tel"
                value={form.contactNumber}
                onChange={(e) => handleChange('contactNumber', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Introduced by (Reg ID)
              </label>
              <input
                type="text"
                value={form.introducedByRegId}
                readOnly
                placeholder="No parent on record"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Your Reg ID</label>
              <input
                type="text"
                value={form.myRegId}
                readOnly
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Number of books</h2>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {BOOK_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleChange('bookSelection', n)}
                className={`text-sm font-semibold rounded-lg px-3 py-2 border transition-colors ${
                  form.bookSelection === n
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300'
                }`}
              >
                {n} book{n === 1 ? '' : 's'}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleChange('bookSelection', CUSTOM_OPTION)}
              className={`text-sm font-semibold rounded-lg px-3 py-2 border transition-colors ${
                form.bookSelection === CUSTOM_OPTION
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300'
              }`}
            >
              My wish
            </button>
          </div>

          {form.bookSelection === CUSTOM_OPTION && (
            <div className="mt-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Enter number of books</label>
              <input
                type="number"
                min="1"
                value={form.customBookCount}
                onChange={(e) => handleChange('customBookCount', e.target.value)}
                placeholder="e.g. 15"
                className="w-40 text-sm border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Order summary</h2>

          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Books selected</span>
            <span className="font-medium text-gray-900">{bookCount || 0}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <span>Price per book</span>
            <span className="font-medium text-gray-900">₹{PRICE_PER_BOOK}</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-800">Total funding</span>
            <span className="text-xl font-bold text-gray-900">₹{totalAmount}</span>
          </div>
        </div>

        {paymentError && (
  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
    {paymentError}
  </div>
)}

{submitted && (
  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3 mb-4">
    Payment successful! Redirecting to your dashboard...
  </div>
)}

<button
  onClick={handleProceedToPayment}
  disabled={!isFormValid || processing}
  className="w-full text-sm font-semibold bg-orange-500 text-white px-5 py-3 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
  {processing ? 'Processing...' : 'Proceed to Payment'}
</button>

        {!isFormValid && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Fill in your name, mobile, email, and choose a valid number of books to continue.
          </p>
        )}
      </div>
    </div>
  );
}