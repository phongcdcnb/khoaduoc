import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Task, UserProfile } from '../types';
import { Clock, CheckCircle, AlertCircle, PlayCircle, MessageSquare, CalendarClock } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import CountdownTimer from './CountdownTimer';
import TaskNoteModal from './TaskNoteModal';
import ExtendDeadlineModal from './ExtendDeadlineModal';

interface Props {
  currentUser: UserProfile;
}

export default function TaskBoard({ currentUser }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  
  const [noteModalTaskId, setNoteModalTaskId] = useState<string | null>(null);
  const [extendModalTaskId, setExtendModalTaskId] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'admin';

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
      setTasks(fetchedTasks);
    });
    return unsubscribe;
  }, []);

  const visibleTasks = isAdmin ? tasks : tasks.filter(t => t.assigneeId === currentUser.uid);

  const handleReceiveTask = async (taskId: string) => {
    if(window.confirm("Xác nhận bắt đầu nhận công việc này?")) {
      await updateDoc(doc(db, 'tasks', taskId), { status: 'in_progress' });
    }
  };
  
  const handleCompleteTask = async (taskId: string) => {
    if(window.confirm("Báo cáo hoàn thành công việc này lên Trưởng khoa?")) {
      await updateDoc(doc(db, 'tasks', taskId), { status: 'pending_approval' });
    }
  };

  const handleAdminApproveTask = async (taskId: string) => {
    if(window.confirm("Duyệt hoàn thành công việc này?")) {
      await updateDoc(doc(db, 'tasks', taskId), { status: 'completed', completedAt: Date.now() });
    }
  };

  const renderTaskCard = (task: Task) => {
    const isOverdue = Date.now() > task.deadline && task.status !== 'completed';
    const isPendingApproval = task.status === 'pending_approval';
    
    return (
      <div key={task.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <span className="bg-slate-100 text-slate-600 text-xs font-black px-2.5 py-1 rounded-md tracking-wider border border-slate-200">
            # {task.taskNumber}
          </span>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${isOverdue ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
              <Clock size={12}/> {format(task.deadline, 'HH:mm - dd/MM', { locale: vi })}
            </span>
            <CountdownTimer deadline={task.deadline} status={task.status} />
          </div>
        </div>
        
        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2">{task.title}</h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-3 bg-slate-50 p-3 rounded-lg border border-slate-100 flex-grow">{task.description}</p>
        
        <div className="flex items-center gap-2 mb-4 justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Phụ trách:</span>
            <span className="text-sm font-bold text-primary-700 ml-2">{usersMap[task.assigneeId] || 'Đang tải...'}</span>
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => setNoteModalTaskId(task.id)}
              className={`p-1.5 rounded-md flex items-center gap-1 text-xs font-bold border transition-colors ${task.notes ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
              title="Ghi chú công việc"
            >
              <MessageSquare size={14} /> {task.notes ? 'Có ghi chú' : 'Ghi chú'}
            </button>
            {isAdmin && task.status !== 'completed' && (
              <button 
                onClick={() => setExtendModalTaskId(task.id)}
                className="p-1.5 rounded-md flex items-center gap-1 text-xs font-bold border bg-white text-orange-600 border-orange-200 hover:bg-orange-50 transition-colors"
                title="Gia hạn Deadline"
              >
                <CalendarClock size={14} /> Gia hạn
              </button>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
          {task.status === 'assigned' && (
             !isAdmin ? 
              <button onClick={() => handleReceiveTask(task.id)} className="w-full bg-blue-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"><PlayCircle size={18}/> Nhận việc ngay</button>
             : <span className="text-sm text-slate-500 font-medium italic text-center w-full bg-slate-50 py-2 rounded-lg">Chờ nhân viên nhận</span>
          )}
          {task.status === 'in_progress' && (
             !isAdmin ? 
              <button onClick={() => handleCompleteTask(task.id)} className="w-full bg-emerald-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors flex justify-center items-center gap-2"><CheckCircle size={18}/> Báo cáo Hoàn thành</button>
             : <span className="text-sm text-orange-500 font-bold flex items-center justify-center gap-2 w-full bg-orange-50 py-2 rounded-lg border border-orange-100"><Clock size={16}/> Đang thực hiện</span>
          )}
          {isPendingApproval && (
             isAdmin ? 
              <button onClick={() => handleAdminApproveTask(task.id)} className="w-full bg-purple-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-sm"><CheckCircle size={18}/> Duyệt hoàn thành</button>
             : <span className="text-sm text-purple-600 font-bold flex justify-center items-center gap-2 w-full bg-purple-50 py-2 rounded-lg border border-purple-100"><AlertCircle size={16}/> Chờ sếp duyệt</span>
          )}
          {task.status === 'completed' && (
             <span className="text-sm text-emerald-600 font-black flex items-center justify-center gap-2 w-full bg-emerald-50 py-2 rounded-lg"><CheckCircle size={18}/> HOÀN THÀNH</span>
          )}
        </div>
      </div>
    );
  };

  const getTasksByStatus = (status: string) => visibleTasks.filter(t => t.status === status);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="bg-slate-100/70 rounded-3xl p-5 border border-slate-200 flex flex-col">
          <h2 className="font-black text-slate-800 mb-5 flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></span> Vừa Giao Việc
            </div>
            <span className="bg-white text-slate-600 px-2 py-1 rounded-lg text-sm">{getTasksByStatus('assigned').length}</span>
          </h2>
          <div className="space-y-4 flex-grow flex flex-col">
            {getTasksByStatus('assigned').length === 0 && <p className="text-slate-400 text-center text-sm py-4 italic my-auto">Trống</p>}
            {getTasksByStatus('assigned').map(renderTaskCard)}
          </div>
        </div>

        <div className="bg-orange-50/50 rounded-3xl p-5 border border-orange-100 flex flex-col">
          <h2 className="font-black text-orange-900 mb-5 flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full shadow-sm animate-pulse"></span> Đang Xử Lý
            </div>
            <span className="bg-white text-orange-600 px-2 py-1 rounded-lg text-sm">{getTasksByStatus('in_progress').length + getTasksByStatus('pending_approval').length}</span>
          </h2>
          <div className="space-y-4 flex-grow flex flex-col">
            {getTasksByStatus('in_progress').map(renderTaskCard)}
            {getTasksByStatus('pending_approval').map(renderTaskCard)}
            {(getTasksByStatus('in_progress').length + getTasksByStatus('pending_approval').length) === 0 && <p className="text-orange-300 text-center text-sm py-4 italic my-auto">Trống</p>}
          </div>
        </div>

        <div className="bg-emerald-50/50 rounded-3xl p-5 border border-emerald-100 flex flex-col">
          <h2 className="font-black text-emerald-900 mb-5 flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></span> Đã Hoàn Thành
            </div>
            <span className="bg-white text-emerald-600 px-2 py-1 rounded-lg text-sm">{getTasksByStatus('completed').length}</span>
          </h2>
          <div className="space-y-4 flex-grow flex flex-col">
            {getTasksByStatus('completed').length === 0 && <p className="text-emerald-300 text-center text-sm py-4 italic my-auto">Trống</p>}
            {getTasksByStatus('completed').map(renderTaskCard)}
          </div>
        </div>
      </div>

      <TaskNoteModal 
        isOpen={!!noteModalTaskId} 
        taskId={noteModalTaskId!} 
        currentNotes={tasks.find(t => t.id === noteModalTaskId)?.notes || ''} 
        onClose={() => setNoteModalTaskId(null)} 
      />
      <ExtendDeadlineModal 
        isOpen={!!extendModalTaskId} 
        taskId={extendModalTaskId!} 
        onClose={() => setExtendModalTaskId(null)} 
      />
    </>
  );
}
