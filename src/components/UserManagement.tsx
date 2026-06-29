import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile } from '../types';
import { CheckCircle } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const fetchedUsers = snapshot.docs.map(doc => doc.data() as UserProfile);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'approved' });
      setUsers(users.filter(u => u.uid !== uid));
    } catch (error) {
      alert("Lỗi khi duyệt");
    }
  };

  if (loading) return <div className="text-slate-500 font-medium">Đang tải danh sách nhân sự...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-3xl mx-auto border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Nhân viên chờ duyệt</h2>
      {users.length === 0 ? (
        <div className="bg-slate-50 rounded-xl p-8 text-center border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">Hiện tại không có nhân viên nào đang chờ duyệt.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map(user => (
            <div key={user.uid} className="flex items-center justify-between border border-slate-100 bg-slate-50 p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-4">
                <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-full bg-slate-200 border" />
                <div>
                  <p className="font-bold text-slate-800">{user.displayName || user.email}</p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={() => handleApprove(user.uid)}
                className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-200 transition-colors font-bold shadow-sm"
              >
                <CheckCircle size={18} /> Duyệt vào Khoa
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
