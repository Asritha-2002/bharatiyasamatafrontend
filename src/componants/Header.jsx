import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/logo.webp";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const { user } = useAuth();
  const closeTimerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Help Book", href: "#books" },
  ];

  // Small delay before closing on mouse-leave so moving from "About" down
  // into the dropdown panel doesn't accidentally close it mid-hover.
  const handleMouseEnter = () => {
    clearTimeout(closeTimerRef.current);
    setDropdownOpen(true);
  };
  const handleMouseLeave = () => {
    closeTimerRef.current = setTimeout(() => setDropdownOpen(false), 150);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md py-2" : "bg-white/90 py-3"}`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 shrink-0">
          <img
            src={logo}
            alt="Logo"
            className="w-15 h-15 rounded-full object-cover"
          />
          <div className="leading-tight">
            <p className="font-heading font-bold text-sm text-primary">
              Bharatiya Samata
            </p>
            <p className="text-[10px] text-muted-foreground">
              Hindi Prachar Parishad
            </p>
          </div>
        </a>

        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-[#344256] hover:text-accent transition-colors"
            >
              {l.label}
            </a>
          ))}

          <Link
            to="/how-do-i-help"
            className="text-sm font-semibold text-[#344256] hover:text-accent transition-colors"
          >
            How Do I Help
          </Link>

          {/* About -- clicking navigates to the #about section on the
              homepage as before; hovering reveals sub-links that go to
              separate pages instead. */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <a
              href="#about"
              className="flex items-center gap-1 text-sm font-semibold text-[#344256] hover:text-accent transition-colors"
              aria-expanded={dropdownOpen}
            >
              About
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </a>

            {dropdownOpen && (
              <div className="absolute top-full left-0 pt-2 min-w-[180px]">
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                  <Link
                    to="/appointments"
                    className="block px-4 py-2 text-sm font-medium text-[#344256] hover:bg-gray-50 hover:text-accent transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Appointments
                  </Link>
                  <Link
                    to="/download"
                    className="block px-4 py-2 text-sm font-medium text-[#344256] hover:bg-gray-50 hover:text-accent transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Download
                  </Link>
                </div>
              </div>
            )}
          </div>

          <a
            href="https://rzp.io/l/Freebooksdonation"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#344256] hover:text-accent transition-colors"
          >
            Help Needy
          </a>
          <Link
            to="/view-blogs"
            className="text-sm font-semibold text-[#344256] hover:text-accent transition-colors"
          >
            Blogs
          </Link>

          <a
            href="#contact"
            className="text-sm font-semibold text-[#344256] hover:text-accent transition-colors"
          >
            Contact
          </a>

          <Link
            to={
              user
                ? user.role === "ADMIN"
                  ? "/admin"
                  : "/dashboard"
                : "/login"
            }
            className="bg-[#F4882A] text-white px-4 py-3 text-center font-semibold whitespace-nowrap"
          >
            {user ? "Dashboard" : "Login"}
          </Link>
        </nav>

        <button
          className="lg:hidden text-primary"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b shrink-0">
            <span className="font-heading font-bold text-primary">Menu</span>
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col p-4 gap-4">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="text-lg font-semibold text-primary hover:text-accent"
              >
                {l.label}
              </a>
            ))}

            <Link
              to="/how-do-i-help"
              onClick={() => setMenuOpen(false)}
              className="text-lg font-semibold text-primary hover:text-accent"
            >
              How Do I Help
            </Link>

            {/* About -- tap the label to navigate to #about, tap the
                chevron separately to expand sub-links, since hover isn't
                available on touch devices. */}
            <div>
              <div className="flex items-center justify-between">
                <a
                  href="#about"
                  onClick={() => setMenuOpen(false)}
                  className="text-lg font-semibold text-primary hover:text-accent"
                >
                  About
                </a>
                <button
                  onClick={() => setMobileDropdownOpen((v) => !v)}
                  aria-expanded={mobileDropdownOpen}
                  aria-label="Toggle About sub-links"
                  className="p-1"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${mobileDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {mobileDropdownOpen && (
                <div className="flex flex-col gap-3 mt-3 pl-4 border-l-2 border-gray-100">
                  <Link
                    to="/appointments"
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileDropdownOpen(false);
                    }}
                    className="text-base font-medium text-[#344256] hover:text-accent"
                  >
                    Appointments
                  </Link>
                  <Link
                    to="/download"
                    onClick={() => {
                      setMenuOpen(false);
                      setMobileDropdownOpen(false);
                    }}
                    className="text-base font-medium text-[#344256] hover:text-accent"
                  >
                    Download
                  </Link>
                </div>
              )}
            </div>
              <a
            
              href="https://rzp.io/l/Freebooksdonation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-primary hover:text-accent"
            >
              Help Needy
            </a>
            <Link
              to="/view-blogs"
              onClick={() => setMenuOpen(false)}
              className="text-lg font-semibold text-primary hover:text-accent"
            >
              Blogs
            </Link>
            <a
              href="#contact"
              onClick={() => setMenuOpen(false)}
              className="text-lg font-semibold text-primary hover:text-accent"
            >
              Contact
            </a>

            <Link
              to={
                user
                  ? user.role === "ADMIN"
                    ? "/admin"
                    : "/dashboard"
                  : "/login"
              }
              onClick={() => setMenuOpen(false)}
              className="bg-[#F4882A] text-white px-4 py-3 text-center font-semibold"
            >
              {user ? "Dashboard" : "Login"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}