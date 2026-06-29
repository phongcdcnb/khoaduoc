import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile } from '../types';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  adminId: string;
  onTaskCreated: () => void;
}

export default function CreateTaskModal({ isOpen, onClose, adminId, onTaskCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        const snap = await getDocs(collection(db, 'users'));
        setUsers(snap.docs.map(d => d.data() as UserProfile).filter(u => u.status === 'approved' && u.uid !== adminId));
      };
      fetchUsers();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigneeId) return alert("Vui lòng chọn người phụ trách!");
    
    setLoading(true);
    try {
      const q = query(collection(db, 'tasks'), orderBy('taskNumber', 'desc'), limit(1));
      const snap = await getDocs(q);
      const nextTaskNumber = snap.docs.length > 0 ? snap.docs[0].data().taskNumber + 1 : 1;

      const deadlineDateObj = new Date(`${deadlineDate}T${deadlineTime}`);
      
      await addDoc(collection(db, 'tasks'), {
        taskNumber: nextTaskNumber,
        title,
        description,
        assigneeId,
        collaboratorIds: [],
        assignedBy: adminId,
        assignedAt: Date.now(),
        deadline: deadlineDateObj.getTime(),
        status: 'assigned',
        notes: ''
      });
      setTitle('');
      setDescription('');
      setAssigneeId('');
      onTaskCreated();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Lỗi tạo công việc');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">📝 Giao việc mới</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Tên công việc</label>
            <input required type="text" placeholder="VD: Báo cáo số liệu tháng 6" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Chi tiết / Hướng dẫn</label>
            <textarea required value={description} placeholder="Mô tả chi tiết công việc cần làm..." onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none min-h-[100px] transition-all"></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Giao cho (Người phụ trách)</label>
            <select required value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all">
              <option value="">-- Chọn nhân viên --</option>
              {users.map(u => (
                <option key={u.uid} value={u.uid}>{u.displayName} ({u.position})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Ngày hạn chót</label>
              <input required type="date" value={deadlineDate} onChange={e => setDeadlineDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Giờ hạn chót</label>
              <input required type="time" value={deadlineTime} onChange={e => setDeadlineTime(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl hover:bg-primary-700 mt-6 disabled:opacity-50 shadow-md hover:shadow-lg transition-all text-lg">
            {loading ? 'Đang giao...' : 'Phát lệnh Giao việc'}
          </button>
        </form>
      </div>
    </div>
  );
}
