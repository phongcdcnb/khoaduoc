import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Plus, Users, LayoutDashboard, Edit2, Trash2 } from 'lucide-react';
import UserManagement from '../components/UserManagement';
import TaskBoard from '../components/TaskBoard';
import CreateTaskModal from '../components/CreateTaskModal';
import EditProfileModal from '../components/EditProfileModal';
import TrashBoard from '../components/TrashBoard';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Task } from '../types';

const Dashboard = () => {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'tasks' | 'users' | 'trash'>('tasks');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const isAdmin = profile?.role === 'admin';
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!profile) return;

    const q = query(collection(db, 'tasks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let fetchedTasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));

      // Tính toán taskNumber động
      const activeSorted = fetchedTasks
        .filter(t => !t.isDeleted)
        .sort((a, b) => a.assignedAt - b.assignedAt);
        
      fetchedTasks = fetchedTasks.map(task => {
        if (!task.isDeleted) {
          task.taskNumber = activeSorted.findIndex(t => t.id === task.id) + 1;
        }
        return task;
      });
      
      // Sắp xếp desc theo taskNumber để hiển thị mới nhất lên đầu
      fetchedTasks.sort((a, b) => b.taskNumber - a.taskNumber);

      setTasks(fetchedTasks);

      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.doc.metadata.hasPendingWrites) return;

        const task = change.doc.data() as Task;
        const isRelated = profile.role === 'admin' || task.assigneeId === profile.uid || (task.collaboratorIds && task.collaboratorIds.includes(profile.uid));
        
        if (!isRelated) return;

        if (Notification.permission === 'granted') {
          if (change.type === 'added') {
            new Notification('🔔 CÓ VIỆC MỚI', { body: task.title, icon: '/logo192.png' });
          } else if (change.type === 'modified') {
            if (task.isDeleted) {
              new Notification('🗑️ Việc vừa bị xoá', { body: task.title, icon: '/logo192.png' });
            } else if (task.status === 'completed') {
              new Notification('✅ Việc đã hoàn thành', { body: task.title, icon: '/logo192.png' });
            } else {
              new Notification('📝 Việc vừa cập nhật', { body: task.title, icon: '/logo192.png' });
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [profile]);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-8">
            <h1 className="text-xl sm:text-2xl font-black text-primary-700 hidden md:block tracking-tight">Khoa Dược</h1>
            <nav className="flex gap-1 sm:gap-2">
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1 sm:gap-2 ${activeTab === 'tasks' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                title="Bảng việc"
              >
                <LayoutDashboard size={18} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Bảng việc</span>
              </button>
              {isAdmin && (
                <>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1 sm:gap-2 ${activeTab === 'users' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                    title="Nhân sự"
                  >
                    <Users size={18} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Nhân sự</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('trash')}
                    className={`px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1 sm:gap-2 ${activeTab === 'trash' ? 'bg-red-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                    title="Thùng rác"
                  >
                    <Trash2 size={18} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Thùng rác</span>
                  </button>
                </>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-5">
            {isAdmin && activeTab === 'tasks' && (
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-emerald-600 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all flex items-center gap-1 sm:gap-2"
              >
                <Plus size={16} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Giao Việc</span>
              </button>
            )}
            
            <div className="h-6 sm:h-8 w-px bg-slate-200 hidden sm:block"></div>
            
            <div 
              onClick={() => setIsEditProfileOpen(true)}
              className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-slate-50 p-1 sm:p-2 rounded-xl transition-colors group"
              title="Chỉnh sửa thông tin"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-black text-slate-800 leading-none group-hover:text-primary-700 transition-colors">{profile.displayName}</p>
                <p className="text-xs font-semibold text-primary-600 mt-1">{profile.position || 'Nhân viên'}</p>
              </div>
              <div className="relative">
                <img src={profile.avatarUrl || 'https://www.gravatar.com/avatar/?d=mp'} alt="Avatar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-slate-200 shadow-sm group-hover:border-primary-400 transition-colors" />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-200 text-slate-500 group-hover:text-primary-600 hidden sm:block">
                  <Edit2 size={10} />
                </div>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="text-slate-400 hover:text-red-600 transition-colors p-2 sm:p-2.5 bg-slate-100 hover:bg-red-50 rounded-full ml-1"
              title="Đăng xuất"
            >
              <LogOut size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'users' && isAdmin ? (
          <UserManagement />
        ) : activeTab === 'trash' && isAdmin ? (
          <TrashBoard tasks={tasks} />
        ) : (
          <TaskBoard currentUser={profile} tasks={tasks} />
        )}
      </main>

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        adminId={profile.uid}
        onTaskCreated={() => {}}
      />

      <EditProfileModal 
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
