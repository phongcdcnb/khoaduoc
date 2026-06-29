import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile, Task } from '../types';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  adminId: string;
  task: Task | null;
}

export default function EditTaskModal({ isOpen, onClose, adminId, task }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const { users } = useAuth();
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title);
      setDescription(task.description);
      setAssigneeId(task.assigneeId);
      setCollaboratorIds(task.collaboratorIds || []);
      setDeadlineDate(format(task.deadline, 'yyyy-MM-dd'));
      setDeadlineTime(format(task.deadline, 'HH:mm'));

      setAvailableUsers(users.filter(u => u.status === 'approved' && u.uid !== adminId));
    }
  }, [isOpen, task, adminId, users]);

  const handleToggleCollaborator = (uid: string) => {
    if (collaboratorIds.includes(uid)) {
      setCollaboratorIds(collaboratorIds.filter(id => id !== uid));
    } else {
      setCollaboratorIds([...collaboratorIds, uid]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    if (!assigneeId) return alert("Vui lòng chọn người phụ trách!");
    
    setLoading(true);
    try {
      const deadlineDateObj = new Date(`${deadlineDate}T${deadlineTime}`);
      
      await updateDoc(doc(db, 'tasks', task.id), {
        title,
        description,
        assigneeId,
        collaboratorIds,
        deadline: deadlineDateObj.getTime(),
      });
      onClose();
    } catch (error) {
      console.error(error);
      alert('Lỗi cập nhật công việc');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full p-4 sm:p-6 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl font-bold text-slate-800">Sửa công việc #{task.taskNumber}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Tên công việc</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Chi tiết / Hướng dẫn</label>
            <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none min-h-[100px] transition-all"></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Giao cho (Người phụ trách)</label>
            <select required value={assigneeId} onChange={e => {
              setAssigneeId(e.target.value);
              setCollaboratorIds(prev => prev.filter(id => id !== e.target.value));
            }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all">
              <option value="">-- Chọn nhân viên --</option>
              {availableUsers.map(u => (
                <option key={u.uid} value={u.uid}>{u.displayName} ({u.position})</option>
              ))}
            </select>
          </div>
          {assigneeId && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Người phối hợp (Tuỳ chọn)</label>
              <div className="max-h-32 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-2 space-y-1">
                {availableUsers.filter(u => u.uid !== assigneeId).length === 0 ? (
                  <p className="text-sm text-slate-400 p-2 italic">Không có nhân sự khác</p>
                ) : (
                  availableUsers.filter(u => u.uid !== assigneeId).map(u => (
                    <label key={u.uid} className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={collaboratorIds.includes(u.uid)}
                        onChange={() => handleToggleCollaborator(u.uid)}
                        className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-700 font-medium">{u.displayName} <span className="text-xs text-slate-500">({u.position})</span></span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
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
            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}
