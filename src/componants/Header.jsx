import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import logo from "../assets/logo.webp";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Book Donation", href: "#books" },
    { label: "How Do I Help", href: "#help" },
    { label: "About", href: "#about" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md py-2" : "bg-white/90 py-3"}`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
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
          <a
            href="https://rzp.io/l/Freebooksdonation"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[#344256] hover:text-accent transition-colors"
          >
            Donate
          </a>
          <Link to='/view-blogs'
          className="text-sm font-semibold text-[#344256] hover:text-accent transition-colors"
          >Blogs</Link>
          
          <a
              key="#contact"
              href="#contact"
              className="text-sm font-semibold text-[#344256] hover:text-accent transition-colors"
            >
              Contact
            </a>

          {/* Login / Dashboard link — shown before Donate */}
          <Link
            to={
              user
                ? user.role === "ADMIN"
                  ? "/admin"
                  : "/dashboard"
                : "/login"
            }
            className="bg-[#F4882A] text-white px-4 py-3 text-center font-semibold"
          >
            {user ? "Dashboard" : "Login"}
          </Link>
        </nav>

        <button
          className="lg:hidden text-primary"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <span className="font-heading font-bold text-primary">Menu</span>
            <button onClick={() => setMenuOpen(false)}>
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
            <a
              href="https://rzp.io/l/Freebooksdonation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-primary hover:text-accent"
            >
              Donate
            </a>
            <Link
              to="/view-blogs"
              onClick={() => setMenuOpen(false)}
              className="text-lg font-semibold text-primary hover:text-accent"
            >
              Blogs
            </Link>
            {/* Login / Dashboard link — mobile menu */}
            <Link
              to={
                user
                  ? user.role === "ADMIN"
                    ? "/admin"
                    : "/dashboard"
                  : "/login"
              }
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