import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome to Bharatiya Samata</h1>
        <p className="text-sm text-gray-500 mb-6">
          Watch this quick video to understand how the platform works before you get started.
        </p>

        <div className="relative w-full rounded-lg overflow-hidden shadow-sm" style={{ paddingTop: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/embed/Hk8mPONhYvc?si=aPaNp1ojuPGiWe07"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 w-full sm:w-auto sm:px-10 bg-orange-500 text-white font-semibold py-2.5 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}