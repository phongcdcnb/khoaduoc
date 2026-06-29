import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Plus, Users, LayoutDashboard } from 'lucide-react';
import UserManagement from '../components/UserManagement';
import TaskBoard from '../components/TaskBoard';
import CreateTaskModal from '../components/CreateTaskModal';

const Dashboard = () => {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'tasks' | 'users'>('tasks');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const isAdmin = profile?.role === 'admin';

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-black text-primary-700 hidden sm:block tracking-tight">Khoa Dược CDC</h1>
            <nav className="flex gap-2">
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'tasks' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <LayoutDashboard size={18} /> Bảng Công Việc
              </button>
              {isAdmin && (
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <Users size={18} /> Quản lý Nhân sự
                </button>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-5">
            {isAdmin && activeTab === 'tasks' && (
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-md hover:bg-emerald-700 hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus size={20} /> Giao Việc Mới
              </button>
            )}
            
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-black text-slate-800 leading-none">{profile.displayName}</p>
                <p className="text-xs font-semibold text-primary-600 mt-1">{profile.position || 'Nhân viên'}</p>
              </div>
              <img src={profile.avatarUrl || 'https://www.gravatar.com/avatar/?d=mp'} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-slate-200 shadow-sm" />
            </div>
            
            <button 
              onClick={logout}
              className="text-slate-400 hover:text-red-600 transition-colors p-2.5 bg-slate-100 hover:bg-red-50 rounded-full"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'users' && isAdmin ? (
          <UserManagement />
        ) : (
          <TaskBoard currentUser={profile} />
        )}
      </main>

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        adminId={profile.uid}
        onTaskCreated={() => {}}
      />
    </div>
  );
};

export default Dashboard;
