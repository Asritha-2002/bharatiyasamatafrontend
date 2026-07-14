import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import AdminNetworkExplorer from '../componants/AdminNetworkExplorer.jsx';
import RevenueTab from '../componants/RevenueTab.jsx';
import AdminSidebar from '../componants/AdminSidebar.jsx';
import ManageBanner from '../componants/ManageBanner.jsx';
import HelpModal from '../componants/HelpModal.jsx';
import { OfflineBanner, SlowConnectionNotice, DashboardIssueCard } from '../componants/ConnectionNotice.jsx';
import { DashboardLoading } from '../componants/DashboardStates.jsx';
import { resolveErrorDetails } from '../utils/dashboardHelpers.js';
import ManageGallery from '../componants/ManageGallery.jsx';
import ManageBlogs from '../componants/ManageBlogs.jsx';
import ManageContact from '../componants/ManageContact.jsx';
import ManageHierarchy from '../componants/ManageHierarchy.jsx';
const SIDEBAR_ITEMS = [
  { key: 'network', label: 'Network', path: '/admin/network', implemented: true },
  { key: 'hierarchy', label: 'Hierarchy Lookup', path: '/admin/hierarchy', implemented: true }, // NEW
  { key: 'revenue', label: 'Revenue / Books Sold', path: '/admin/revenue', implemented: true },
  { key: 'blogs', label: 'Manage Blogs', path: '/admin/blogs', implemented: true },
  { key: 'banner', label: 'Manage Banner Image', path: '/admin/banner', implemented: true },
  { key: 'gallery', label: 'Manage Gallery', path: '/admin/gallery', implemented: true },
  { key: 'contact', label: 'Contact History', path: '/admin/contact', implemented: true },
];


const ADMIN_HELP_POINTS = [
  { title: 'Referral Code', text: 'Share your admin referral code to onboard new ROs directly under you.' },
  { title: 'Network', text: 'View and manage every member across the entire network from one table.' },
  { title: 'Revenue', text: 'Track total books sold and revenue generated across all members.' },
  { title: 'Managing Users', text: 'Use the network table to update roles or purchase status for any member.' },
];

// How long a request can run before we tell the person it's slow (ms).
const SLOW_REQUEST_THRESHOLD = 8000;

function resolveActiveKey(pathname) {
  const path = pathname.toLowerCase();
  if (path.includes('revenue')) return 'revenue';
  if (path.includes('hierarchy')) return 'hierarchy';
  if (path.includes('blog')) return 'blogs';
  if (path.includes('banner')) return 'banner';
  if (path.includes('gallery')) return 'gallery';
  if (path.includes('contact')) return 'contact';
  return 'network';
}

// Turns a caught error into { type, title, message } so the UI can show the
// right message: fully offline, request never reached the server (network/
// timeout), or a normal server-side error.
function classifyError(err) {
  if (!navigator.onLine) {
    return {
      type: 'offline',
      title: "You're offline",
      message: 'Check your internet connection, then try again.',
    };
  }

  const isNetworkLevelFailure = !err.response || err.code === 'ECONNABORTED' || err.message === 'Network Error';
  if (isNetworkLevelFailure) {
    return {
      type: 'network',
      title: 'Connection problem',
      message: "We couldn't reach the server. Your connection may be slow or unstable — try again in a moment.",
    };
  }

  const details = resolveErrorDetails(err) || {};
  return {
    type: 'server',
    title: details.title || 'Something went wrong',
    message: details.message || 'Please try again.',
  };
}

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [slowConnection, setSlowConnection] = useState(false);
  const slowTimerRef = useRef(null);

  const activeKey = useMemo(() => resolveActiveKey(location.pathname), [location.pathname]);
  const activeItem = SIDEBAR_ITEMS.find((item) => item.key === activeKey);

  const fetchDashboard = useCallback(async () => {
    setError(null);
    setLoading(true);
    setSlowConnection(false);

    clearTimeout(slowTimerRef.current);
    slowTimerRef.current = setTimeout(() => setSlowConnection(true), SLOW_REQUEST_THRESHOLD);

    try {
      const res = await api.get('/dashboard/me');

      // Safety check: if a non-admin somehow lands here, redirect them
      if (res.data.role !== 'ADMIN') {
        navigate('/dashboard', { replace: true });
        return;
      }

      setData(res.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        navigate('/login', { replace: true });
        return;
      }
      setError(classifyError(err));
    } finally {
      clearTimeout(slowTimerRef.current);
      setSlowConnection(false);
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchDashboard();
    return () => clearTimeout(slowTimerRef.current);
  }, [fetchDashboard]);

  // Keep isOnline in sync with the browser, and offer a message the moment
  // the connection drops -- even if the dashboard is already loaded.
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // If we come back online while sitting on an error, try again automatically.
  useEffect(() => {
    if (isOnline && error) {
      fetchDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const inviteLink = data ? `${window.location.origin}/register?ref=${data.me.referralCode}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <AdminSidebar
        items={SIDEBAR_ITEMS}
        activeKey={activeKey}
        onNavigate={(item) => navigate(item.path)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-base font-semibold text-gray-900">{activeItem?.label}</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setHelpOpen(true)}
              className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1.5 transition-colors"
            >
              <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-[11px] font-semibold">?</span>
              Help
            </button>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              Log Out
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {!isOnline && <OfflineBanner onRetry={fetchDashboard} />}

            {error ? (
              <DashboardIssueCard error={error} onRetry={fetchDashboard} onLogout={logout} />
            ) : loading || !data ? (
              <>
                <DashboardLoading />
                {slowConnection && <SlowConnectionNotice onRetry={fetchDashboard} />}
              </>
            ) : (
              <>
                {activeKey === 'network' && (
                  <>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Your Referral Code (share this to add ROs)
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <code className="bg-gray-100 px-3 py-1.5 rounded text-sm font-mono">{data.me.referralCode}</code>
                        <button
                          onClick={copyLink}
                          className="text-xs font-semibold bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          {copied ? 'Copied!' : 'Copy Invite Link'}
                        </button>
                        <span className="text-xs text-gray-400 break-all">{inviteLink}</span>
                        
                      </div>
                       <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Your Registration ID</p>
        <code className="bg-gray-100 px-3 py-1.5 rounded text-sm font-mono">{data.me.regNo}</code>
      </div>
                      
                    </div>
                    

                    <AdminNetworkExplorer everyone={data.everyone} adminUser={data.me} onUpdated={fetchDashboard} />
                  </>
                )}

                {activeKey === 'revenue' && <RevenueTab />}
                {activeKey === 'blogs' && <ManageBlogs />}
                {activeKey === 'banner' && <ManageBanner />}
                {activeKey === 'gallery' && <ManageGallery />}
                {activeKey === 'contact' && <ManageContact />}
                {activeKey === 'hierarchy' && <ManageHierarchy />}

              </>
            )}
          </div>
        </main>
      </div>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} points={ADMIN_HELP_POINTS} />
    </div>
  );
}