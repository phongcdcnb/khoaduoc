import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const { loginWithGoogle, loading } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
          <LogIn size={32} />
        </div>
        <h1 className="text-2xl font-bold text-primary-700 mb-2">Quản lý Công việc</h1>
        <h2 className="text-lg font-medium text-slate-600 mb-8">Khoa Dược - CDC Ninh Bình</h2>
        
        <button 
          onClick={loginWithGoogle}
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 bg-white rounded-full p-0.5" />
          Đăng nhập bằng Google
        </button>
      </div>
    </div>
  );
};

export default Login;
