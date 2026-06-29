import { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Task, UserProfile } from '../types';
import { Clock, CheckCircle, AlertCircle, PlayCircle, MessageSquare, CalendarClock, Trash2, Edit2, History, TrendingUp, BellRing } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import CountdownTimer from './CountdownTimer';
import TaskNoteModal from './TaskNoteModal';
import ExtendDeadlineModal from './ExtendDeadlineModal';
import EditTaskModal from './EditTaskModal';
import TaskHistoryModal from './TaskHistoryModal';
import TaskProgressModal from './TaskProgressModal';

interface Props {
  currentUser: UserProfile;
  tasks: Task[];
}

export default function TaskBoard({ currentUser, tasks }: Props) {
  const { users } = useAuth();
  
  // Tạo usersMap từ context thay vì fetch
  const usersMap = users.reduce((acc, curr) => {
    acc[curr.uid] = curr.displayName;
    return acc;
  }, {} as Record<string, string>);

  const [noteModalTaskId, setNoteModalTaskId] = useState<string | null>(null);
  const [progressModalTaskId, setProgressModalTaskId] = useState<string | null>(null);
  const [extendModalTaskId, setExtendModalTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [historyModalTaskId, setHistoryModalTaskId] = useState<string | null>(null);
  const isAdmin = currentUser.role === 'admin';

  const visibleTasks = (isAdmin ? tasks : tasks.filter(t => t.assigneeId === currentUser.uid || (t.collaboratorIds && t.collaboratorIds.includes(currentUser.uid)))).filter(t => !t.isDeleted);

  const handleMoveToTrash = async (taskId: string) => {
    if(window.confirm("Chuyển công việc này vào thùng rác?")) {
      await updateDoc(doc(db, 'tasks', taskId), { isDeleted: true });
    }
  };

  const handleReceiveTask = async (taskId: string) => {
    if(window.confirm("Xác nhận bắt đầu nhận công việc này?")) {
      await updateDoc(doc(db, 'tasks', taskId), { status: 'in_progress', receivedAt: Date.now() });
    }
  };
  
  const handleCompleteTask = async (taskId: string) => {
    if(window.confirm("Xác nhận đã hoàn thành công việc?")) {
      await updateDoc(doc(db, 'tasks', taskId), { status: 'pending_approval', completedAt: Date.now() });
    }
  };

  const handleAdminApproveTask = async (taskId: string) => {
    if(window.confirm("Duyệt hoàn thành công việc này?")) {
      await updateDoc(doc(db, 'tasks', taskId), { status: 'completed', approvedAt: Date.now() });
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
              <Clock size={12}/> {format(task.deadline, 'HH:mm - dd/MM/yyyy', { locale: vi })}
            </span>
            <CountdownTimer deadline={task.deadline} status={task.status} />
          </div>
        </div>
        
        <h3 className="font-bold text-slate-800 text-lg leading-tight mb-2">{task.title}</h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-3 bg-slate-50 p-3 rounded-lg border border-slate-100 flex-grow">{task.description}</p>
        
        {task.notes && (
          <div className="mb-4 bg-yellow-50/80 border border-yellow-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1 text-yellow-800 font-bold text-xs">
              <MessageSquare size={14} /> GHI CHÚ
            </div>
            <p className="text-sm text-yellow-900 whitespace-pre-wrap">{task.notes}</p>
          </div>
        )}

        {/* Người phụ trách & Phối hợp */}
        <div className="flex flex-col gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 w-[70px]">Phụ trách:</span>
            <span className="text-sm font-bold text-primary-700">{usersMap[task.assigneeId] || 'Đang tải...'}</span>
          </div>
          {task.collaboratorIds && task.collaboratorIds.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-slate-500 w-[70px]">Phối hợp:</span>
              <span className="text-sm font-medium text-slate-600 leading-tight">
                {task.collaboratorIds.map(id => usersMap[id]).filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Nút thao tác phụ */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button 
            onClick={() => setNoteModalTaskId(task.id)}
            className={`flex-1 min-w-[80px] py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold border transition-colors ${task.notes ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
            title="Ghi chú công việc"
          >
            <MessageSquare size={14} /> Ghi chú
          </button>
          
          {currentUser.uid === task.assigneeId && task.status !== 'completed' && (
            <button 
              onClick={() => setProgressModalTaskId(task.id)}
              className="flex-1 min-w-[80px] py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold border bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50 transition-colors"
              title="Báo cáo tiến độ"
            >
              <TrendingUp size={14} /> Tiến độ
            </button>
          )}
          
          <button 
            onClick={() => setHistoryModalTaskId(task.id)}
            className="flex-1 min-w-[80px] py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold border bg-white text-slate-600 border-slate-200 hover:bg-slate-50 transition-colors"
            title="Lịch sử cập nhật"
          >
            <History size={14} /> Lịch sử
          </button>

          {isAdmin && task.status !== 'completed' && (
            <>
              <button 
                onClick={() => setEditingTask(task)}
                className="flex-1 min-w-[80px] py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold border bg-white text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors"
                title="Sửa công việc"
              >
                <Edit2 size={14} /> Sửa
              </button>
              <button 
                onClick={() => setExtendModalTaskId(task.id)}
                className="flex-1 min-w-[80px] py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold border bg-white text-orange-600 border-orange-200 hover:bg-orange-50 transition-colors"
                title="Gia hạn Deadline"
              >
                <CalendarClock size={14} /> Gia hạn
              </button>
            </>
          )}

          {isAdmin && (
            <button 
              onClick={() => handleMoveToTrash(task.id)}
              className="flex-1 min-w-[80px] py-2 px-1 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold border bg-white text-red-600 border-red-200 hover:bg-red-50 transition-colors"
              title="Xóa công việc"
            >
              <Trash2 size={14} /> Xóa
            </button>
          )}
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

  // Lọc các công việc cần nhắc nhở hạn chót (1, 3, 5, 7 ngày) cho nhân viên
  const tasksNearDeadline = visibleTasks.filter(task => {
    if (task.status === 'completed' || task.status === 'pending_approval' || task.isDeleted) return false;
    const isRelated = task.assigneeId === currentUser.uid || (task.collaboratorIds && task.collaboratorIds.includes(currentUser.uid));
    if (!isRelated) return false;

    const now = Date.now();
    const diffMs = task.deadline - now;
    if (diffMs < 0) return false; // Trễ hạn rồi thì CountdownTimer đã lo

    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return [1, 3, 5, 7].includes(diffDays);
  });

  return (
    <>
      {/* KHU VỰC CẢNH BÁO NHẮC NHỞ */}
      {tasksNearDeadline.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-red-700 flex items-center gap-2 mb-3">
            <BellRing className="animate-bounce" size={20} /> 
            CẢNH BÁO NHẮC NHỞ: CÔNG VIỆC SẮP ĐẾN HẠN!
          </h3>
          <div className="space-y-2">
            {tasksNearDeadline.map(task => {
              const diffDays = Math.ceil((task.deadline - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div key={task.id} className="bg-white border border-red-100 p-3 rounded-xl flex items-center gap-3">
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-md">Chỉ còn {diffDays} ngày</span>
                  <p className="text-sm font-medium text-slate-700 truncate flex-1">{task.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        <div className="bg-slate-100/70 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200 flex flex-col">
          <h2 className="font-black text-slate-800 mb-4 sm:mb-5 flex items-center justify-between text-base sm:text-lg">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></span> Vừa Giao Việc
            </div>
            <span className="bg-white text-slate-600 px-2 py-1 rounded-lg text-xs sm:text-sm">{getTasksByStatus('assigned').length}</span>
          </h2>
          <div className="space-y-3 sm:space-y-4 flex-grow flex flex-col">
            {getTasksByStatus('assigned').length === 0 && <p className="text-slate-400 text-center text-sm py-4 italic my-auto">Trống</p>}
            {getTasksByStatus('assigned').map(renderTaskCard)}
          </div>
        </div>

        <div className="bg-orange-50/50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-orange-100 flex flex-col">
          <h2 className="font-black text-orange-900 mb-4 sm:mb-5 flex items-center justify-between text-base sm:text-lg">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full shadow-sm animate-pulse"></span> Đang Xử Lý
            </div>
            <span className="bg-white text-orange-600 px-2 py-1 rounded-lg text-xs sm:text-sm">{getTasksByStatus('in_progress').length + getTasksByStatus('pending_approval').length}</span>
          </h2>
          <div className="space-y-3 sm:space-y-4 flex-grow flex flex-col">
            {getTasksByStatus('in_progress').map(renderTaskCard)}
            {getTasksByStatus('pending_approval').map(renderTaskCard)}
            {(getTasksByStatus('in_progress').length + getTasksByStatus('pending_approval').length) === 0 && <p className="text-orange-300 text-center text-sm py-4 italic my-auto">Trống</p>}
          </div>
        </div>

        <div className="bg-emerald-50/50 rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-emerald-100 flex flex-col">
          <h2 className="font-black text-emerald-900 mb-4 sm:mb-5 flex items-center justify-between text-base sm:text-lg">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></span> Đã Hoàn Thành
            </div>
            <span className="bg-white text-emerald-600 px-2 py-1 rounded-lg text-xs sm:text-sm">{getTasksByStatus('completed').length}</span>
          </h2>
          <div className="space-y-3 sm:space-y-4 flex-grow flex flex-col">
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
        onClose={() => setExtendModalTaskId(null)}
        taskId={extendModalTaskId || ''}
      />

      <EditTaskModal 
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        adminId={currentUser.uid}
        task={editingTask}
      />

      <TaskHistoryModal 
        isOpen={!!historyModalTaskId}
        onClose={() => setHistoryModalTaskId(null)}
        task={tasks.find(t => t.id === historyModalTaskId) || null}
      />

      <TaskProgressModal
        isOpen={!!progressModalTaskId}
        onClose={() => setProgressModalTaskId(null)}
        task={tasks.find(t => t.id === progressModalTaskId) || null}
        currentUserId={currentUser.uid}
      />
    </>
  );
}
