import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  currentNotes: string;
}

export default function TaskNoteModal({ isOpen, onClose, taskId, currentNotes }: Props) {
  const [notes, setNotes] = useState(currentNotes || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'tasks', taskId), { notes });
      onClose();
    } catch (error) {
      alert("Lỗi lưu ghi chú");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-800">📝 Ghi chú công việc</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 transition-colors"><X size={20} className="text-slate-500" /></button>
        </div>
        <textarea 
          value={notes} 
          onChange={e => setNotes(e.target.value)}
          className="w-full h-32 p-3 border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none mb-4 transition-all"
          placeholder="Nhập tiến độ, tài liệu đính kèm hoặc các vướng mắc cần báo cáo..."
        ></textarea>
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full bg-primary-600 text-white font-bold py-2.5 rounded-lg hover:bg-primary-700 shadow-sm"
        >
          {loading ? 'Đang lưu...' : 'Lưu ghi chú'}
        </button>
      </div>
    </div>
  );
}
