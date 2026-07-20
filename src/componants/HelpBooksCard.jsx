import { useNavigate } from 'react-router-dom';

export default function HelpBooksCard({ hasPurchasedBooks }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 text-xl">
        📚
      </div>
      <h3 className="font-bold text-gray-900 mb-1">Help Books</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
        {hasPurchasedBooks
          ? "You've already completed your initial books helping. You can still help more books toward your annual requirement anytime."
          : 'Help at least 2 books to unlock recruiting.'}
      </p>
      <button
        onClick={() => navigate('/checkout')}
        className="inline-block bg-orange-500 text-white font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-colors"
      >
        Help Books
      </button>
    </div>
  );
}