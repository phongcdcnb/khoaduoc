import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

import { CheckCircle, ShieldBan, ShieldCheck } from 'lucide-react';

export default function UserManagement() {
  const { users } = useAuth();
  // Sort so admins are first, then others
  const sortedUsers = [...users].sort((a, b) => (b.role === 'admin' ? 1 : 0) - (a.role === 'admin' ? 1 : 0));

  const handleApprove = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'approved' });
      // Không cần setUsers thủ công vì onSnapshot trong AuthContext sẽ tự cập nhật
    } catch (error) {
      alert("Lỗi khi duyệt");
    }
  };

  const handleRevoke = async (uid: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn thu hồi quyền truy cập của nhân viên này? Họ sẽ không thể vào xem công việc nữa.")) return;
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'pending' });
    } catch (error) {
      alert("Lỗi khi thu hồi quyền");
    }
  };

  if (!users || users.length === 0) return <div className="text-slate-500 font-medium text-center py-10">Đang tải danh sách nhân sự...</div>;

  const pendingUsers = sortedUsers.filter(u => u.status === 'pending');
  const approvedUsers = sortedUsers.filter(u => u.status === 'approved');

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Danh sách chờ duyệt */}
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-200">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
          <span className="bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full text-sm">{pendingUsers.length}</span>
          Tài khoản chờ xét duyệt
        </h2>
        {pendingUsers.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-6 sm:p-8 text-center border border-dashed border-slate-300">
            <p className="text-slate-500 font-medium text-sm sm:text-base">Không có nhân viên nào đang chờ duyệt.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {pendingUsers.map(user => (
              <div key={user.uid} className="flex flex-col sm:flex-row sm:items-center justify-between border border-slate-100 bg-slate-50 p-3 sm:p-4 rounded-xl shadow-sm gap-3 sm:gap-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <img src={user.avatarUrl} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-200 border" />
                  <div>
                    <p className="font-bold text-slate-800 text-sm sm:text-base">{user.displayName || user.email}</p>
                    <p className="text-xs sm:text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleApprove(user.uid)}
                  className="flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-200 transition-colors font-bold shadow-sm text-sm"
                >
                  <CheckCircle size={18} /> Duyệt vào Khoa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danh sách nhân viên chính thức */}
      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-200">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-600 px-2.5 py-0.5 rounded-full text-sm">{approvedUsers.length}</span>
          Danh sách nhân sự Khoa
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {approvedUsers.map(user => (
            <div key={user.uid} className="flex items-start justify-between border border-slate-100 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              {user.role === 'admin' && (
                <div className="absolute top-0 right-0 bg-primary-100 text-primary-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                  <ShieldCheck size={12} /> QUẢN TRỊ VIÊN
                </div>
              )}
              <div className="flex items-start gap-3 w-full">
                <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-full bg-slate-200 border border-slate-200 shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate text-sm sm:text-base">{user.displayName}</p>
                  <p className="text-xs font-semibold text-primary-600 mb-1">{user.position || 'Nhân viên'}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              
              {/* Nút thu hồi quyền (chỉ hiện khi hover trên máy tính hoặc luôn hiện nhưng nhỏ trên điện thoại) và không được tự thu hồi quyền admin */}
              {user.role !== 'admin' && (
                <button 
                  onClick={() => handleRevoke(user.uid)}
                  title="Thu hồi quyền truy cập"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <ShieldBan size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
