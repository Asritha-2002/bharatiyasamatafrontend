import image from "../assets/image.webp"

export default function Contact() {
  return (
    <section id="contact" className="py-16 bg-[#F5F5F5]">
      <h2 className="font-heading text-center text-2xl md:text-4xl font-bold text-[#344256] ">
        Let's Get In Touch
      </h2>
      <div className="w-20 h-0.5 bg-[#F4882A] mx-auto my-4" />
      <div className="max-w-3xl mx-auto px-4 text-left">

        <div className="mt-10 flex justify-center">
          <img
            src={image}
            alt="Bharatiya Samata Hindi Prachar Parishad"
            className="max-w-full md:max-w-md rounded shadow-md"
          />
        </div>

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

        <div className="flex justify-center gap-5 mt-8">
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
    </section>
  );
}