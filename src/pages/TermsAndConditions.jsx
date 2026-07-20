import { useNavigate } from 'react-router-dom';

export default function TermsAndConditions() {
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
          Terms and Conditions
        </h1>
        <div className="w-20 h-0.5 bg-[#F4882A] my-6" />

        <div className="bg-white rounded shadow-sm p-6 md:p-10 space-y-8 text-gray-700 leading-relaxed">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          <p>
            These Terms and Conditions ("Terms") govern your access to and use of this website
            and any services offered on it (collectively, the "Service"), operated by
            <strong> Bharatiya Samata Hindi Prachar Parishad </strong> ("we", "us", or "our"). By accessing or using
            the Service, you agree to be bound by these Terms. If you do not agree, please do not
            use the Service.
          </p>

          <Section title="1. Use of the Service">
            <p>
              You must be at least 18 years old, or the age of majority in your jurisdiction, to
              use this Service. You agree to use the Service only for lawful purposes and in a
              manner that does not infringe the rights of, or restrict or inhibit the use and
              enjoyment of the Service by, any third party.
            </p>
          </Section>

          <Section title="2. Account Registration">
            <p>
              If you create an account with us, you are responsible for maintaining the
              confidentiality of your login credentials and for all activities that occur under
              your account. You agree to notify us immediately of any unauthorized use of your
              account.
            </p>
          </Section>

          <Section title="3. Products and Services">
            <p>
              We strive to describe our products and services as accurately as possible. However,
              we do not warrant that product descriptions, pricing, or other content is accurate,
              complete, reliable, current, or error-free. We reserve the right to correct any
              errors and to change or update information at any time without prior notice.
            </p>
          </Section>

          <Section title="4. Pricing and Payment">
            <p>
              All prices listed on the Service are subject to change without notice. Payment must
              be made in full through the payment methods made available at checkout. We use
              third-party payment processors and are not responsible for any errors caused by
              these providers.
            </p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>
              All content on this website, including text, graphics, logos, images, and software,
              is the property of Bharatiya Samata Hindi Prachar Parishad or its licensors and is protected by
              applicable intellectual property laws. You may not reproduce, distribute, or create
              derivative works from any content without our prior written consent.
            </p>
          </Section>

          <Section title="6. User Conduct">
            <p>
              You agree not to misuse the Service, including but not limited to: attempting
              unauthorized access to our systems, transmitting harmful code, or engaging in any
              activity that disrupts or interferes with the Service.
            </p>
          </Section>

          <Section title="7. Third-Party Links">
            <p>
              Our Service may contain links to third-party websites. We are not responsible for
              the content, privacy policies, or practices of any third-party sites and encourage
              you to review their terms independently.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, Bharatiya Samata Hindi Prachar Parishad shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages arising from
              your use of, or inability to use, the Service.
            </p>
          </Section>

          <Section title="9. Termination">
            <p>
              We reserve the right to suspend or terminate your access to the Service, without
              prior notice, for conduct that we believe violates these Terms or is harmful to
              other users or us.
            </p>
          </Section>

          <Section title="10. Changes to These Terms">
            <p>
              We may update these Terms from time to time. Any changes will be posted on this
              page with a revised "Last updated" date. Continued use of the Service after changes
              are posted constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="11. Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of
             India, without regard to its conflict of law provisions.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              If you have any questions about these Terms, please contact us at{' '}
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