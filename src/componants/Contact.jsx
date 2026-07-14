import { useState } from "react";
import image from "../assets/image.webp";
import { submitContactMessage } from "../api/contact.js";

const EMPTY_FORM = { name: "", mobile: "", email: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text }

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.mobile.trim() || !form.email.trim()) {
      setStatus({ type: "error", text: "Please fill in your name, mobile number, and email." });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      await submitContactMessage(form);
      setStatus({ type: "success", text: "Thanks for reaching out — we'll get back to you soon." });
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus({
        type: "error",
        text: err.response?.data?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 bg-[#F5F5F5]">
      <h2 className="font-heading text-center text-2xl md:text-4xl font-bold text-[#344256]">
        Let's Get In Touch
      </h2>
      <div className="w-20 h-0.5 bg-[#F4882A] mx-auto my-4" />

      <div className="max-w-5xl mx-auto px-4">
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left: org info */}
          <div className="text-left">
            <img
              src={image}
              alt="Bharatiya Samata Hindi Prachar Parishad"
              className="max-w-full md:max-w-md rounded shadow-md mx-auto lg:mx-0"
            />

            <p className="text-sm text-gray-600 mt-6">
              B.S.H.P.Parishad, Una Enclave, Mayur Vihar, New Delhi – 110091 – India.
            </p>

            <div className="mt-6 space-y-1">
              <p className="font-semibold text-[#344256]">Bharatiya samata Hindi Prachar Parishad</p>
              <p className="text-sm text-gray-700">Central office (South)</p>
              <p className="text-sm text-gray-700">Vijayawada – 530 004</p>
            </div>

            <p className="font-semibold text-[#344256] mt-6">
              ph: 98483 52011 , 7997724777
            </p>

            <p className="text-sm text-gray-600 mt-2">
              email: samatahindi@gmail.com
            </p>

            <p className="text-sm text-gray-700 mt-6">
              Bangalore – Kolkata – Hyderabad – Vijayawada – Bhuvaneshwar – Mumbai – Goa – Tiruvanantapur
            </p>

            <div className="flex gap-5 mt-8">
              <a
                href="https://www.facebook.com/SamataHindiPracharVibhag"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-[#344256] flex items-center justify-center hover:bg-[#F4882A] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>

              <a
                href="https://x.com/HindiSamata"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-10 h-10 rounded-full bg-[#344256] flex items-center justify-center hover:bg-[#F4882A] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/bharatiyasamata/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-[#344256] flex items-center justify-center hover:bg-[#F4882A] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="#ffffff" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right: contact form */}
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 text-left">
            <h3 className="text-lg font-semibold text-[#344256] mb-1">Send us a message</h3>
            <p className="text-sm text-gray-500 mb-6">We usually respond within a couple of business days.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Your full name"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F4882A]/40 focus:border-[#F4882A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Mobile number</label>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F4882A]/40 focus:border-[#F4882A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="you@example.com"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F4882A]/40 focus:border-[#F4882A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Message <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Tell us what this is about"
                  rows={4}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F4882A]/40 focus:border-[#F4882A]"
                />
              </div>

              {status && (
                <p className={`text-sm ${status.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
                  {status.text}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto font-semibold text-sm text-white bg-[#344256] px-6 py-2.5 rounded-lg hover:bg-[#F4882A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}