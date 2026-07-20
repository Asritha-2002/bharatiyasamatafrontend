import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Standalone page bar -- no shared Header/Footer here, just Back */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[#344256] font-semibold hover:text-[#F4882A] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-[#F4882A] font-heading text-sm font-semibold uppercase tracking-wide">Legal</p>
        <h1 className="font-heading text-2xl md:text-4xl font-bold text-[#344256] mt-2">
          Privacy Policy
        </h1>
        <div className="w-20 h-0.5 bg-[#F4882A] my-6" />

        <div className="bg-white rounded shadow-sm p-6 md:p-10 space-y-8 text-gray-700 leading-relaxed">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          <p>
            <strong>Bharatiya Samata Hindi Prachar Parishad</strong> ("we", "us", or "our") respects your privacy and
            is committed to protecting your personal data. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you visit our website or
            use our services.
          </p>

          <Section title="1. Information We Collect">
            <p>We may collect the following types of information:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Personal Information:</strong> name, email address, phone number, billing and shipping address.</li>
              <li><strong>Payment Information:</strong> processed securely through third-party payment gateways; we do not store full card details.</li>
              <li><strong>Usage Data:</strong> IP address, browser type, pages visited, and time spent on our site.</li>
              <li><strong>Cookies and Tracking Data:</strong> collected through cookies and similar technologies.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the collected information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Process and fulfill your orders or bookings</li>
              <li>Communicate with you about your account, orders, or inquiries</li>
              <li>Improve our website, products, and services</li>
              <li>Send promotional communications, where you have opted in</li>
              <li>Comply with legal obligations and prevent fraud</li>
            </ul>
          </Section>

          <Section title="3. Cookies">
            <p>
              We use cookies and similar tracking technologies to enhance your browsing
              experience, analyze site traffic, and personalize content. You can control cookie
              preferences through your browser settings.
            </p>
          </Section>

          <Section title="4. Sharing of Information">
            <p>
              We do not sell your personal information. We may share your data with trusted
              third-party service providers (such as payment processors, shipping partners, or
              analytics providers) who assist us in operating our website, provided they agree to
              keep this information confidential.
            </p>
          </Section>

          <Section title="5. Data Security">
            <p>
              We implement reasonable technical and organizational measures to protect your
              personal information from unauthorized access, alteration, disclosure, or
              destruction. However, no method of transmission over the internet is completely
              secure.
            </p>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your personal information only for as long as necessary to fulfill the
              purposes outlined in this policy, unless a longer retention period is required by
              law.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>
              Depending on your jurisdiction, you may have the right to access, correct, delete,
              or restrict the use of your personal data, and to withdraw consent for marketing
              communications at any time. To exercise these rights, please contact us using the
              details below.
            </p>
          </Section>

          <Section title="8. Third-Party Links">
            <p>
              Our website may contain links to third-party websites. We are not responsible for
              the privacy practices or content of such external sites.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              Our services are not directed at individuals under the age of 18, and we do not
              knowingly collect personal information from children.
            </p>
          </Section>

          <Section title="10. Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on
              this page with a revised "Last updated" date.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p>
              If you have any questions about this Privacy Policy or how your data is handled,
              please contact us at{' '}
              <a href="mailto:bharatiyasamata@gmail.com" className="text-[#F4882A] font-semibold hover:underline">
                bharatiyasamata@gmail.com
              </a>.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="font-heading text-lg md:text-xl font-bold text-[#344256] mb-2">{title}</h2>
      {children}
    </div>
  );
}