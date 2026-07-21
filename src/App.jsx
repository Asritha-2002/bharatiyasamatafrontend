import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './componants/ProtectedRoute.jsx';

// App/dashboard pages
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Welcome from './pages/Welcome.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UserDashboard from './pages/UserDashboard.jsx';

// Public marketing site sections
import Header from './componants/Header.jsx';
import Banner from './componants/Banner.jsx';
import LocationBar from './componants/LocationBar.jsx';
import WelcomeSection from './componants/Welcome.jsx';
import BookDonation from './componants/BookDonation.jsx';
import HowDoIHelp from './componants/HowDoIHelp.jsx';
import About from './componants/About.jsx';
import HelpTogether from './componants/HelpTogether.jsx';
import TheyNeedHelp from './componants/TheyNeedHelp.jsx';
import Contact from './componants/Contact.jsx';
import Footer from './componants/Footer.jsx';
import Gallery from './pages/Gallery.jsx';
import Blogs from './componants/Blogs.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import Checkout from './pages/Checkout.jsx';
import VolunteerSection from './componants/VolunteerSection.jsx';
import Kyc from './pages/Kyc.jsx';
import ManageKyc from './componants/ManageKyc.jsx';
import ManagePayouts from './componants/ManagePayouts.jsx';


import TermsAndConditions from './pages/TermsAndConditions';
import RefundPolicy from './pages/RefundPolicy';
import CancellationPolicy from './pages/CancellationPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';



// The public homepage — all your marketing sections, in one place
function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Banner />
        <LocationBar />
        <WelcomeSection />
        <BookDonation />
        <HowDoIHelp />
        <TheyNeedHelp/>
        <About />
        <HelpTogether />
        <VolunteerSection/>
        <Contact />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/view-blogs" element={<Blogs />} />
          <Route path="/blogs/:sku" element={<BlogDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/kyc" element={<Kyc />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
<Route path="/refund-policy" element={<RefundPolicy />} />
<Route path="/cancellation-policy" element={<CancellationPolicy />} />
<Route path="/privacy-policy" element={<PrivacyPolicy />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
  path="/admin/*"
  element={
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


export default App;