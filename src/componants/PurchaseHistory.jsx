import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import { buildPaymentLink } from '../config.js';
import { useNavigate } from 'react-router-dom';
import HelpBooksCard from './HelpBooksCard.jsx';


export default function PurchaseHistoryTab({ myRegNo, parentRegNo, hasPurchasedBooks }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [pricePerBook, setPricePerBook] = useState(60); // fallback default until settings load

  const navigate = useNavigate();
  useEffect(() => {
  const fetchHistory = async () => {
    try {
      const res = await api.get('/purchase/my-history');
      setHistory(res.data);
    } catch (err) {
      setError('Could not load your helped books history.');
    } finally {
      setLoading(false);
    }
  };
  fetchHistory();
}, []);

useEffect(() => {
  api.get('/settings')
    .then((res) => setPricePerBook(res.data.settings.pricePerBook))
    .catch(() => {}); // non-critical -- keeps the default 60 fallback if this fails
}, []);

  const paymentLink = buildPaymentLink(myRegNo);

  const copyRegNo = () => {
    navigator.clipboard.writeText(myRegNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─────────────────────────────────────────────────────────
  // DOWNLOAD INVOICE (frontend-generated, same pattern as N-Organics)
  // ─────────────────────────────────────────────────────────
const downloadInvoice = async (purchase) => {
  setDownloadingId(purchase._id);

  try {
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
    const pricePerBook = booksCount > 0 ? (amount / booksCount) : pricePerBook;
    const purchaserName = purchase.booksHelperName || 'Volunteer';
    const regNo = purchase.regNo || myRegNo;
    const dateStr = new Date(purchase.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
    const logoUrl = `${window.location.origin}/image.png`; // adjust filename/extension to match what's actually in your public folder

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
            Purchased By
          </div>
          <div style="font-size:13px; font-weight:700; color:#7c2d12;">${purchaserName}</div>
          <div style="font-size:12px; color:#555; margin-top:4px;">Registration ID: ${regNo}</div>
        </div>
        <div style="flex:1; background:#fff7ed; border-radius:12px; padding:16px; border:1px solid #fed7aa;">
          <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#888; margin-bottom:10px;">
            Payment Info
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span style="font-size:11px; color:#888;">Status</span>
            <span style="font-size:11px; font-weight:700; color:#059669; text-transform:capitalize;">
              ${purchase.status === 'CAPTURED' ? 'Confirmed' : purchase.status}
            </span>
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
      // Wait for the logo to actually finish loading before capturing --
      // otherwise html2canvas can snapshot the element before the image
      // has painted, leaving a blank space where the logo should be.
      const logoImg = invoiceEl.querySelector('img');
      if (logoImg && !logoImg.complete) {
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve; // don't block the whole invoice if the logo fails to load
        });
      }

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
  } catch (err) {
    console.error('Invoice generation failed:', err);
  } finally {
    setDownloadingId(null);
  }
};

  return (
    <div className="space-y-6">

      {/* Reg No info card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Your Registration ID</p>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-3 py-1.5 rounded text-sm font-mono">{myRegNo}</code>
              <button onClick={copyRegNo} className="text-xs font-semibold text-orange-600 hover:text-orange-800">
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {parentRegNo && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Your Parent's Reg ID <span className="normal-case font-normal text-gray-400">(enter this in "Who Introduced" on the form)</span>
              </p>
              <code className="bg-gray-100 px-3 py-1.5 rounded text-sm font-mono">{parentRegNo}</code>
            </div>
          )}
        </div>
      </div>

      {/* Help Books */}
   <HelpBooksCard hasPurchasedBooks={hasPurchasedBooks} />

      {/* History */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-sm">Helped Books History</h3>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">Loading...</div>
        ) : error ? (
          <div className="px-6 py-10 text-center text-sm text-red-500">{error}</div>
        ) : history.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-gray-400 italic">No books helped recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {history.map((p) => {
              const perBook = p.numberOfFreeBooks > 0 ? (p.amount / p.numberOfFreeBooks) : pricePerBook;
              return (
                <div key={p._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {p.numberOfFreeBooks} book{p.numberOfFreeBooks === 1 ? '' : 's'}
                      <span className="text-gray-400 font-normal"> · ₹{perBook.toFixed(0)} each</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">₹{p.amount}</p>
                      <p className={`text-xs font-semibold ${p.status === 'CAPTURED' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {p.status === 'CAPTURED' ? 'Confirmed' : 'Failed'}
                      </p>
                    </div>

                    {p.status === 'CAPTURED' && (
                      <button
                        onClick={() => downloadInvoice(p)}
                        disabled={downloadingId === p._id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-orange-500 text-orange-600 text-xs font-semibold hover:bg-orange-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3" />
                        </svg>
                        {downloadingId === p._id ? 'Generating...' : 'Download Invoice'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}