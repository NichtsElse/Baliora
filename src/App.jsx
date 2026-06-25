/**
 * Purpose: Wires the app shell, routes, auth provider, and query client for local execution.
 * Used by: src/main.jsx as the root React application.
 * Main dependencies: router, AuthContext, RouteSeo, and react-query client.
 * Public functions: App default export.
 * Side effects: mounts auth, SEO, and routing state for the whole SPA.
 */
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import RouteSeo from './components/seo/RouteSeo';

import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVillas from './pages/admin/AdminVillas';
import AdminVillaForm from './pages/admin/AdminVillaForm';
import AdminBookings from './pages/admin/AdminBookings';
import AdminInquiries from './pages/admin/AdminInquiries';
import AdminFAQs from './pages/admin/AdminFAQs';
import AdminBlog from './pages/admin/AdminBlog';
import AdminBlogForm from './pages/admin/AdminBlogForm';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminOwners from './pages/admin/AdminOwners';
import AdminOwnerForm from './pages/admin/AdminOwnerForm';
import AdminSettings from './pages/admin/AdminSettings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminActivity from './pages/admin/AdminActivity';
import AdminPlaceholder from './pages/admin/AdminPlaceholder';
import AdminRoles from './pages/admin/AdminRoles';
import AdminContentHomepage from './pages/admin/AdminContentHomepage';
import AdminContentAbout from './pages/admin/AdminContentAbout';
import AdminContentServices from './pages/admin/AdminContentServices';
import AdminContentNavbar from './pages/admin/AdminContentNavbar';
import AdminLogin from './pages/admin/AdminLogin';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import ProtectedRoute from './components/ProtectedRoute';

import SiteLayout from './components/layout/SiteLayout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import WhyBaliora from './pages/WhyBaliora';
import HowItWorks from './pages/HowItWorks';
import Dashboard from './pages/Dashboard';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Assessment from './pages/Assessment';
import Villas from './pages/Villas';
import VillaDetail from './pages/VillaDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="font-display text-2xl tracking-wider text-foreground">BALIORA</span>
          <div className="w-8 h-px bg-primary mx-auto mt-4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/" element={<RootRedirect />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<SiteLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/why-baliora" element={<WhyBaliora />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/villas" element={<Villas />} />
          <Route path="/villas/:slug" element={<VillaDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
      
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/admin/login" replace />} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/villas" element={<AdminVillas />} />
        <Route path="/admin/villas/new" element={<AdminVillaForm />} />
        <Route path="/admin/villas/:id/edit" element={<AdminVillaForm />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/inquiries" element={<AdminInquiries />} />
        <Route path="/admin/faqs" element={<AdminFAQs />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
        <Route path="/admin/blog/new" element={<AdminBlogForm />} />
        <Route path="/admin/blog/:id/edit" element={<AdminBlogForm />} />
        <Route path="/admin/testimonials" element={<AdminTestimonials />} />
        <Route path="/admin/owners" element={<AdminOwners />} />
        <Route path="/admin/owners/new" element={<AdminOwnerForm />} />
        <Route path="/admin/owners/:id/edit" element={<AdminOwnerForm />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/activity" element={<AdminActivity />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/settings/roles" element={<AdminRoles />} />
        <Route path="/admin/settings/integrations" element={<AdminPlaceholder />} />
        <Route path="/admin/settings/audit" element={<AdminActivity />} />
        <Route path="/admin/content/navbar" element={<AdminContentNavbar />} />
        <Route path="/admin/content/homepage" element={<AdminContentHomepage />} />
        <Route path="/admin/content/about" element={<AdminContentAbout />} />
        <Route path="/admin/content/services" element={<AdminContentServices />} />
        <Route path="/admin/villas/amenities" element={<AdminPlaceholder />} />
        <Route path="/admin/villas/gallery" element={<AdminPlaceholder />} />
        <Route path="/admin/villas/pricing" element={<AdminPlaceholder />} />
        <Route path="/admin/bookings/reservations" element={<AdminPlaceholder />} />
        <Route path="/admin/bookings/guests" element={<AdminPlaceholder />} />
        <Route path="/admin/bookings/communications" element={<AdminPlaceholder />} />
        <Route path="/admin/owners/contracts" element={<AdminPlaceholder />} />
        <Route path="/admin/owners/reports" element={<AdminPlaceholder />} />
        <Route path="/admin/owners/revenue" element={<AdminPlaceholder />} />
        <Route path="/admin/operations/housekeeping" element={<AdminPlaceholder />} />
        <Route path="/admin/operations/maintenance" element={<AdminPlaceholder />} />
        <Route path="/admin/operations/vendors" element={<AdminPlaceholder />} />
        <Route path="/admin/operations/inventory" element={<AdminPlaceholder />} />
        <Route path="/admin/operations/staff" element={<AdminPlaceholder />} />
        <Route path="/admin/marketing/promotions" element={<AdminPlaceholder />} />
        <Route path="/admin/marketing/landing-pages" element={<AdminPlaceholder />} />
        <Route path="/admin/marketing/seo" element={<AdminPlaceholder />} />
        <Route path="/admin/marketing/analytics" element={<AdminPlaceholder />} />
      </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

const RootRedirect = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return null;
  }

  return <Navigate to={isAuthenticated ? '/home' : '/login'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <RouteSeo />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
