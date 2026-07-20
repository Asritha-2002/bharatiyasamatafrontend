import { useNavigate } from 'react-router-dom';

export default function CancellationPolicy() {
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
          Cancellation Policy
        </h1>
        <div className="w-20 h-0.5 bg-[#F4882A] my-6" />

        <div className="bg-white rounded shadow-sm p-6 md:p-10 space-y-8 text-gray-700 leading-relaxed">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          <p>
            This Cancellation Policy outlines the terms under which you may cancel an order,
            booking, or subscription with <strong>Bharatiya Samata Hindi Prachar Parishad</strong>.
          </p>

          <Section title="1. Order/Booking Cancellations">
            <p>
              You may cancel your order or booking within <strong>3 days</strong> of
              placing it, provided that the product has not yet been shipped or the service has
              not yet commenced. To cancel, please contact us at{' '}
              <a href="mailto:bharatiyasamata@gmail.com" className="text-[#F4882A] font-semibold hover:underline">
                bharatiyasamata@gmail.com
              </a>{' '}
              with your order details.
            </p>
          </Section>

          <Section title="2. Cancellations After Processing">
            <p>
              Once an order has been shipped or a service has begun, cancellation may no longer
              be possible. In such cases, our standard Refund Policy will apply instead.
            </p>
          </Section>

          <Section title="4. Cancellations Initiated by Us">
            <p>
              We reserve the right to cancel an order or booking under certain circumstances,
              such as product unavailability, pricing errors, or suspected fraudulent activity.
              In such cases, you will be notified and any amount paid will be refunded in full.
            </p>
          </Section>

          <Section title="5. Cancellation Charges">
            <p>
              Depending on the timing of your cancellation, a cancellation fee may apply. Any
              applicable fees will be clearly communicated to you at the time of booking or
              purchase.
            </p>
          </Section>

          <Section title="6. How to Request a Cancellation">
            <p>
              To request a cancellation, please email us at{' '}
              <a href="mailto:bharatiyasamata@gmail.com" className="text-[#F4882A] font-semibold hover:underline">
                bharatiyasamata@gmail.com
              </a>{' '}
              with your order/booking number. We aim to process cancellation requests within
              <strong> 7 business days</strong>.
            </p>
          </Section>

          <Section title="7. Changes to This Policy">
            <p>
              We may update this Cancellation Policy periodically. Any changes will be reflected
              on this page with an updated "Last updated" date.
            </p>
          </Section>

          <Section title="8. Contact Us">
            <p>
              For any cancellation-related queries, reach out to us at{' '}
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