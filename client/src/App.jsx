import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Pages - To be built by Person 2
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import SubscriptionView from './pages/SubscriptionView';
import Invoices from './pages/Invoices';
import InvoiceView from './pages/InvoiceView';
import Products from './pages/Products';
import Plans from './pages/Plans';
import Payments from './pages/Payments';
import Quotations from './pages/Quotations';
import Discounts from './pages/Discounts';
import Taxes from './pages/Taxes';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import MainLayout from './components/MainLayout';
import PortalLayout from './components/PortalLayout';

// Storefront Pages
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Account from './pages/Account';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />

            {/* Protected Routes Wrapper */}
            <Route element={<ProtectedRoute />}>
              {/* Staff/Admin Layout */}
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/subscriptions/:id" element={<SubscriptionView />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/invoices/:id" element={<InvoiceView />} />
                <Route path="/products" element={<Products />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/quotations" element={<Quotations />} />
                <Route path="/discounts" element={<Discounts />} />
                <Route path="/taxes" element={<Taxes />} />
                <Route path="/users" element={<Users />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Portal Storefront Layout */}
              <Route element={<PortalLayout />}>
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/account" element={<Account />} />
              </Route>
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem' }}>Loading Auth...</div>;
  if (!user) return <Navigate to="/login" />;
  return <Outlet />;
};

export default App;
