import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const ProfileSetup = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [position, setPosition] = useState(profile?.position || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        displayName,
        position
      });
      // Force reload to update context
      window.location.href = '/';
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-primary-700 mb-6 text-center">Cập nhật thông tin cá nhân</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Họ và tên chuẩn (Viết hoa có dấu)
            </label>
            <input 
              type="text" 
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              placeholder="VD: Nguyễn Văn A"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Chức vụ / Vị trí công tác
            </label>
            <input 
              type="text" 
              required
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              placeholder="VD: Dược sĩ, Kế toán..."
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang lưu...' : 'Lưu thông tin & Bắt đầu'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
