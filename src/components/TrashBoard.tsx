import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Task } from '../types';
import { RefreshCcw, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function TrashBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      const map: Record<string, string> = {};
      snap.docs.forEach(d => {
        map[d.data().uid] = d.data().displayName;
      });
      setUsersMap(map);
    };
    fetchUsers();

    const q = query(collection(db, 'tasks'), orderBy('taskNumber', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
      // Chỉ lấy các công việc đã bị xóa
      setTasks(fetchedTasks.filter(t => t.isDeleted));
    });
    return unsubscribe;
  }, []);

  const handleRestore = async (taskId: string) => {
    if(window.confirm("Khôi phục công việc này về bảng chính?")) {
      await updateDoc(doc(db, 'tasks', taskId), { isDeleted: false });
    }
  };

  const handlePermanentDelete = async (taskId: string) => {
    if(window.confirm("CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn công việc khỏi cơ sở dữ liệu và KHÔNG THỂ khôi phục. Bạn có chắc chắn?")) {
      await deleteDoc(doc(db, 'tasks', taskId));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 min-h-[500px]">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
          <Trash2 size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Thùng rác</h2>
          <p className="text-sm text-slate-500">Các công việc đã bị xóa. Có thể khôi phục hoặc xóa vĩnh viễn.</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Trash2 size={48} className="mb-4 opacity-20" />
          <p className="font-medium">Thùng rác trống</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(task => (
            <div key={task.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col opacity-75 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-slate-200 text-slate-600 text-xs font-black px-2.5 py-1 rounded-md tracking-wider">
                  # {task.taskNumber}
                </span>
                <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                  <Clock size={12}/> {format(task.deadline, 'dd/MM/yyyy', { locale: vi })}
                </span>
              </div>
              
              <h3 className="font-bold text-slate-700 text-base leading-tight mb-2 line-clamp-2">{task.title}</h3>
              
              <div className="mb-4 text-sm text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-500 text-xs">Phụ trách:</span> <span className="font-bold">{usersMap[task.assigneeId] || '...'}</span>
              </div>
              
              <div className="mt-auto pt-4 flex gap-2">
                <button 
                  onClick={() => handleRestore(task.id)}
                  className="flex-1 bg-white border border-slate-300 hover:border-emerald-400 text-slate-700 hover:text-emerald-600 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <RefreshCcw size={14} /> Khôi phục
                </button>
                <button 
                  onClick={() => handlePermanentDelete(task.id)}
                  className="flex-1 bg-red-50 border border-red-200 hover:bg-red-600 text-red-600 hover:text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Trash2 size={14} /> Xóa vĩnh viễn
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
