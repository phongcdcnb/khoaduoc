import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProfileSetup from './pages/ProfileSetup';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-primary-600 font-medium">Đang tải dữ liệu...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-primary-700 mb-4">Chờ phê duyệt</h2>
          <p className="text-slate-600 mb-6">
            Tài khoản của bạn đã được ghi nhận. Vui lòng chờ Trưởng khoa phê duyệt để có thể truy cập hệ thống.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  // Nếu đã duyệt nhưng chưa có thông tin chức vụ -> Bắt buộc cập nhật profile (trừ khi đang ở trang profile)
  if (profile?.status === 'approved' && !profile.position && location.pathname !== '/setup-profile') {
    return <Navigate to="/setup-profile" replace />;
  }

  // Nếu đang ở trang setup profile mà đã có thông tin rồi -> Về trang chủ
  if (location.pathname === '/setup-profile' && profile?.position) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-primary-600 font-medium">Khởi động hệ thống...</div>;
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user && profile?.status !== 'pending' ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/setup-profile" 
        element={
          <ProtectedRoute>
            <ProfileSetup />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
