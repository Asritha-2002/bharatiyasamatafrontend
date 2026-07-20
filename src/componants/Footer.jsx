import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#344256] text-white py-8 text-center">
      <div className="max-w-4xl mx-auto px-4">
        <p className="font-heading font-bold">Bharatiya Samata Hindi Prachar Parishad</p>
        <p className="text-sm text-white/70 mt-2">Sabki Hindi ...Sabkeliye Hindi</p>

        {/* Legal links -- wraps on small screens, single row on larger screens */}
        <nav className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link to="/terms-and-conditions" className="text-white/80 hover:text-[#F4882D] transition-colors">
            Terms & Conditions
          </Link>
          <span className="hidden sm:inline text-white/30">|</span>
          <Link to="/refund-policy" className="text-white/80 hover:text-[#F4882D] transition-colors">
            Refund Policy
          </Link>
          <span className="hidden sm:inline text-white/30">|</span>
          <Link to="/cancellation-policy" className="text-white/80 hover:text-[#F4882D] transition-colors">
            Cancellation Policy
          </Link>
          <span className="hidden sm:inline text-white/30">|</span>
          <Link to="/privacy-policy" className="text-white/80 hover:text-[#F4882D] transition-colors">
            Privacy Policy
          </Link>
        </nav>

        <a href="#top" className="inline-block mt-6 text-[#F4882D] text-sm font-semibold hover:underline">
          Scroll to the top of the page ↑
        </a>
      </div>
    </footer>
  );
}