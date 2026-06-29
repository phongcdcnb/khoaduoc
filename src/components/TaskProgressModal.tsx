import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, TrendingUp } from 'lucide-react';
import type { Task, ProgressUpdate } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  currentUserId: string;
}

export default function TaskProgressModal({ isOpen, onClose, task, currentUserId }: Props) {
  const [progressText, setProgressText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressText.trim()) return;

    setLoading(true);
    try {
      const newUpdate: ProgressUpdate = {
        id: crypto.randomUUID(),
        text: progressText.trim(),
        timestamp: Date.now(),
        uid: currentUserId
      };

      await updateDoc(doc(db, 'tasks', task.id), {
        progressUpdates: arrayUnion(newUpdate)
      });
      setProgressText('');
      onClose();
    } catch (error) {
      console.error(error);
      alert('Lỗi khi lưu báo cáo tiến độ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-5 sm:p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-primary-600" /> Báo cáo Tiến độ
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-2">Tiến độ hiện tại của bạn</label>
            <textarea 
              autoFocus
              value={progressText} 
              onChange={e => setProgressText(e.target.value)} 
              placeholder="VD: Đã làm xong phần ABC, đạt 60%..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none min-h-[120px] transition-all resize-none"
            />
          </div>
          <button type="submit" disabled={loading || !progressText.trim()} className="w-full bg-primary-600 text-white font-bold py-3 sm:py-4 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all text-base sm:text-lg flex justify-center items-center gap-2">
            {loading ? 'Đang lưu...' : 'Lưu Báo cáo'}
          </button>
        </form>
      </div>
    </div>
  );
}
