export type Role = 'admin' | 'manager' | 'staff'; // Trưởng khoa, Phó khoa, Nhân viên
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string; // Tên hiển thị sau khi cài đặt profile
  googleName: string; // Tên thật trên google (lưu lại)
  avatarUrl: string;
  role: Role;
  status: UserStatus;
  position: string; // Chức vụ cụ thể (vd: Dược sĩ)
  createdAt: number;
}

export type TaskStatus = 'assigned' | 'in_progress' | 'pending_approval' | 'completed';
// assigned: Đã giao
// in_progress: Đang hoàn thiện
// pending_approval: Chờ duyệt hoàn thành
// completed: Đã hoàn thành

export interface Task {
  id: string;
  taskNumber: number;
  title: string;
  description: string;
  assigneeId: string;
  collaboratorIds: string[];
  assignedBy: string; // UID của người giao
  assignedAt: number; // Timestamp
  deadline: number; // Timestamp
  status: TaskStatus;
  notes: string;
  completedAt?: number;
  isDeleted?: boolean;
}
