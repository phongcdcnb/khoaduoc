import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, CalendarClock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
}

export default function ExtendDeadlineModal({ isOpen, onClose, taskId }: Props) {
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const deadlineDateObj = new Date(`${deadlineDate}T${deadlineTime}`);
      await updateDoc(doc(db, 'tasks', taskId), { deadline: deadlineDateObj.getTime() });
      onClose();
    } catch (error) {
      alert("Lỗi gia hạn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-4 sm:p-6 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><CalendarClock size={20} className="text-orange-500" /> Gia hạn Deadline</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100"><X size={20} className="text-slate-500" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Ngày hạn chót mới</label>
            <input required type="date" value={deadlineDate} onChange={e => setDeadlineDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Giờ hạn chót mới</label>
            <input required type="time" value={deadlineTime} onChange={e => setDeadlineTime(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-lg hover:bg-orange-600 mt-2 shadow-sm">
            {loading ? 'Đang xử lý...' : 'Xác nhận gia hạn'}
          </button>
        </form>
      </div>
    </div>
  );
}
