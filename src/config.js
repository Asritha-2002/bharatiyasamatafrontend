export const BOOK_PAYMENT_PAGE_URL = 'https://pages.razorpay.com/pl_TBLjEVbHrJAObW/view';

// Pre-fills the "Your REG NO" field on the Payment Page with this user's
// own regNo, so the webhook can identify them when the payment completes.
export function buildPaymentLink(regNo) {
  return `${BOOK_PAYMENT_PAGE_URL}?your_reg_no=${encodeURIComponent(regNo)}`;
}