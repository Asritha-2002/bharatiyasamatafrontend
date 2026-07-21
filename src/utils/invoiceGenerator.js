const PRICE_PER_BOOK = 60; // fallback if amount/count isn't reliable

// Generates and downloads a PDF invoice for a single purchase/payment record.
// `purchase` needs: _id, numberOfFreeBooks, amount, booksHelperName, regNo,
// createdAt, status, razorpayPaymentId.
export async function downloadInvoicePDF(purchase, fallbackPricePerBook = 60) {
  const { default: jsPDF } = await import('jspdf');
  const { default: html2canvas } = await import('html2canvas');

  const invoiceEl = document.createElement('div');
  invoiceEl.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    width: 794px; background: white; padding: 48px;
    font-family: Arial, sans-serif; color: #1a1a1a;
  `;

  const invoiceId = String(purchase._id).slice(-10).toUpperCase();
  const booksCount = purchase.numberOfFreeBooks || 0;
  const amount = purchase.amount || 0;
  const pricePerBook = booksCount > 0 ? (amount / booksCount) : fallbackPricePerBook;
  const purchaserName = purchase.booksHelperName || 'Volunteer';
  const regNo = purchase.regNo || '—';
  const dateStr = new Date(purchase.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
   const logoUrl = `${window.location.origin}/image.png`;

  invoiceEl.innerHTML = `
    <!-- Header -->
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:36px;">
      <img src="${logoUrl}" alt="Logo" style="width:100px; height:56px; object-fit:contain; border-radius:8px;" />
      <div style="text-align:right;">
        <div style="font-size:20px; font-weight:800; color:#7c2d12;">INVOICE</div>
        <div style="font-size:11px; color:#888; margin-top:4px;">#${invoiceId}</div>
        <div style="font-size:11px; color:#888;">${dateStr}</div>
      </div>
    </div>

    <div style="height:2px; background:linear-gradient(to right, #ea580c, #fb923c, #fed7aa); margin-bottom:28px; border-radius:2px;"></div>

    <!-- Bill To + Payment Info -->
    <div style="display:flex; justify-content:space-between; margin-bottom:28px; gap:24px;">
      <div style="flex:1;">
        <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#888; margin-bottom:8px;">
          Books Helped By
        </div>
        <div style="font-size:13px; font-weight:700; color:#7c2d12;">${purchaserName}</div>
        <div style="font-size:12px; color:#555; margin-top:4px;">Registration ID: ${regNo}</div>
      </div>
      <div style="flex:1; background:#fff7ed; border-radius:12px; padding:16px; border:1px solid #fed7aa;">
        <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#888; margin-bottom:10px;">
          Payment Info
        </div>
        
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="font-size:11px; color:#888;">Payment ID</span>
          <span style="font-size:10px; font-weight:700; font-family:monospace;">
            ${purchase.razorpayPaymentId || '—'}
          </span>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="font-size:11px; color:#888;">Date</span>
          <span style="font-size:11px; font-weight:700;">${dateStr}</span>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
      <thead>
        <tr style="background:#7c2d12; color:white;">
          <th style="padding:10px 8px; text-align:left; font-size:11px; border-radius:6px 0 0 0;">Item</th>
          <th style="padding:10px 8px; text-align:center; font-size:11px;">Quantity</th>
          <th style="padding:10px 8px; text-align:right; font-size:11px;">Unit Price</th>
          <th style="padding:10px 8px; text-align:right; font-size:11px; border-radius:0 6px 0 0;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #f0ede8;">
          <td style="padding: 10px 8px; font-size: 13px;">Books</td>
          <td style="padding: 10px 8px; font-size: 13px; text-align:center;">${booksCount}</td>
          <td style="padding: 10px 8px; font-size: 13px; text-align:right;">₹${pricePerBook.toFixed(2)}</td>
          <td style="padding: 10px 8px; font-size: 13px; text-align:right; color:#ea580c; font-weight:bold;">₹${amount.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Total -->
    <div style="display:flex; justify-content:flex-end; margin-bottom:32px;">
      <div style="width:260px;">
        <div style="display:flex; justify-content:space-between; padding:10px 14px; background:#7c2d12; border-radius:8px;">
          <span style="font-size:14px; font-weight:800; color:white;">Total Paid</span>
          <span style="font-size:16px; font-weight:900; color:#fed7aa;">₹${amount.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="height:1px; background:#e7dfd4; margin-bottom:20px;"></div>
    <div style="text-align:center; font-size:11px; color:#aaa; line-height:1.8;">
      Thank you for supporting Bharatiya Samata Hindi Prachar Parishad 🙏<br/>
      <span style="font-size:10px;">This is a computer-generated invoice and does not require a signature.</span>
    </div>
  `;

  document.body.appendChild(invoiceEl);

  try {
    const canvas = await html2canvas(invoiceEl, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice-${invoiceId}.pdf`);
  } finally {
    document.body.removeChild(invoiceEl);
  }
}