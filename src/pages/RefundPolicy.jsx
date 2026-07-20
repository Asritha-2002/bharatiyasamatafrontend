import { useNavigate } from 'react-router-dom';

export default function RefundPolicy() {
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
          Refund Policy
        </h1>
        <div className="w-20 h-0.5 bg-[#F4882A] my-6" />

        <div className="bg-white rounded shadow-sm p-6 md:p-10 space-y-8 text-gray-700 leading-relaxed">
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          <p>
            At <strong>Bharatiya Samata Hindi Prachar Parishad</strong>, we want you to be satisfied with your
            purchase. This Refund Policy explains the circumstances under which refunds are
            issued and how to request one.
          </p>

          <Section title="1. Eligibility for Refunds">
            <p>
              Refunds may be granted in the following situations:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The product or service was not delivered as described.</li>
              <li>The product received is defective, damaged, or significantly different from what was ordered.</li>
              <li>A duplicate or erroneous charge was made to your payment method.</li>
              <li>The service was cancelled within the applicable cancellation window (see our Cancellation Policy).</li>
            </ul>
          </Section>

          <Section title="2. Non-Refundable Items">
            <p>
              Certain items or services may not be eligible for a refund, including but not
              limited to digital products that have already been accessed or downloaded,
              services that have already been fully rendered, and items marked as
              "non-refundable" at the time of purchase.
            </p>
          </Section>

          <Section title="3. Refund Request Process">
            <p>
              To request a refund, please contact us at{' '}
              <a href="mailto:support@yourcompany.com" className="text-[#F4882A] font-semibold hover:underline">
                support@yourcompany.com
              </a>{' '}
              within <strong>[X days]</strong> of your purchase, along with your order number and
              a brief explanation of the issue. Our team will review your request and respond
              within <strong>[X business days]</strong>.
            </p>
          </Section>

          <Section title="4. Refund Method and Timeline">
            <p>
              Approved refunds will be credited back to the original payment method used at the
              time of purchase. Please allow <strong>[5–10 business days]</strong> for the refund
              to reflect in your account, depending on your bank or payment provider.
            </p>
          </Section>

          <Section title="5. Partial Refunds">
            <p>
              In some cases, partial refunds may be issued — for example, if a service was
              partially used or if a product is returned in a used or altered condition.
            </p>
          </Section>

          <Section title="6. Disputes">
            <p>
              If you are not satisfied with the outcome of your refund request, you may escalate
              the matter by contacting us directly, and we will make reasonable efforts to
              resolve the issue fairly.
            </p>
          </Section>

          <Section title="7. Changes to This Policy">
            <p>
              We may revise this Refund Policy from time to time. Updates will be posted on this
              page with a new "Last updated" date.
            </p>
          </Section>

          <Section title="8. Contact Us">
            <p>
              For any questions regarding refunds, please reach out to us at{' '}
              <a href="mailto:support@yourcompany.com" className="text-[#F4882A] font-semibold hover:underline">
                support@yourcompany.com
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