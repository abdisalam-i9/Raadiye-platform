import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Items from './pages/Items';
import ItemDetail from './pages/ItemDetail';
import PostItem from './pages/PostItem';
import MyItems from './pages/MyItems';
import ChatInbox from './pages/ChatInbox';
import ChatRoom from './pages/ChatRoom';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminCategories from './pages/AdminCategories';
import NotFound from './pages/NotFound';

function LostItemsRedirect() {
  const [params] = useSearchParams();
  const next = new URLSearchParams(params);
  if (!next.get('kind')) next.set('kind', 'lost');
  const query = next.toString();
  return <Navigate to={query ? `/items?${query}` : '/items?kind=lost'} replace />;
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/items" element={<Items />} />
        <Route path="/items/:id" element={<ItemDetail kind="found" />} />
        <Route path="/lost-items" element={<LostItemsRedirect />} />
        <Route path="/lost-items/:id" element={<ItemDetail kind="lost" />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/post"
          element={
            <ProtectedRoute>
              <PostItem />
            </ProtectedRoute>
          }
        />
        <Route path="/post-item" element={<Navigate to="/items?add=1&kind=found" replace />} />
        <Route path="/post-lost" element={<Navigate to="/items?add=1&kind=lost" replace />} />
        <Route
          path="/my-items"
          element={
            <ProtectedRoute>
              <MyItems />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats"
          element={
            <ProtectedRoute>
              <ChatInbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chats/:id"
          element={
            <ProtectedRoute>
              <ChatRoom />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/users/:id" element={<PublicProfile />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute adminOnly>
              <AdminCategories />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;
