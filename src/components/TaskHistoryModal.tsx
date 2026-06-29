import type { Task } from '../types';
import { X, CheckCircle, Clock, PlayCircle, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function TaskHistoryModal({ isOpen, onClose, task }: Props) {
  if (!isOpen || !task) return null;

  const TimelineItem = ({ 
    icon: Icon, 
    title, 
    timestamp, 
    colorClass, 
    isLast 
  }: { 
    icon: any, 
    title: string, 
    timestamp?: number, 
    colorClass: string,
    isLast?: boolean
  }) => {
    if (!timestamp) return null;
    return (
      <div className="relative pl-8 sm:pl-10 py-3">
        {!isLast && <div className="absolute left-3.5 sm:left-4 top-10 bottom-0 w-px bg-slate-200"></div>}
        <div className={`absolute left-0 sm:left-0.5 top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${colorClass}`}>
          <Icon size={14} className="text-white" />
        </div>
        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
          <h4 className="font-bold text-slate-700 text-sm">{title}</h4>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Clock size={12} />
            {format(timestamp, 'HH:mm - dd/MM/yyyy', { locale: vi })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm w-full p-4 sm:p-6 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Lịch sử cập nhật</h2>
            <p className="text-xs text-slate-500 mt-1">Công việc #{task.taskNumber}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        <div className="py-2">
          <TimelineItem 
            icon={Clock} 
            title="Sếp giao việc" 
            timestamp={task.assignedAt} 
            colorClass="bg-slate-500" 
            isLast={!task.receivedAt && !task.completedAt && !task.approvedAt}
          />
          <TimelineItem 
            icon={PlayCircle} 
            title="Nhân viên nhận việc" 
            timestamp={task.receivedAt} 
            colorClass="bg-blue-500" 
            isLast={!task.completedAt && !task.approvedAt}
          />
          <TimelineItem 
            icon={CheckCircle} 
            title="Nhân viên báo cáo hoàn thành" 
            timestamp={task.completedAt} 
            colorClass="bg-orange-500" 
            isLast={!task.approvedAt}
          />
          <TimelineItem 
            icon={ShieldCheck} 
            title="Sếp duyệt hoàn tất" 
            timestamp={task.approvedAt} 
            colorClass="bg-emerald-500" 
            isLast={true}
          />
        </div>
        
        <button onClick={onClose} className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 mt-6 transition-all text-sm">
          Đóng
        </button>
      </div>
    </div>
  );
}
