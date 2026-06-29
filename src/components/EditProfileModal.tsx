import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: Props) {
  const { profile, updateLocalProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [position, setPosition] = useState(profile?.position || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return alert("Vui lòng nhập họ tên!");

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        displayName: displayName.trim(),
        position: position.trim()
      });
      
      updateLocalProfile({
        displayName: displayName.trim(),
        position: position.trim()
      });
      
      onClose();
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi cập nhật!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-800">Chỉnh sửa thông tin</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={20} className="text-slate-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Họ và tên</label>
            <input 
              required 
              type="text" 
              value={displayName} 
              onChange={e => setDisplayName(e.target.value)} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Chức vụ / Vị trí</label>
            <input 
              type="text" 
              value={position} 
              placeholder="VD: Dược sĩ, Kế toán..."
              onChange={e => setPosition(e.target.value)} 
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}
