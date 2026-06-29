import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateLocalProfile: (updates: Partial<UserProfile>) => void;
  users: UserProfile[];
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            const isAdmin = currentUser.email === 'phongcdcnb2025@gmail.com';
            
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              googleName: currentUser.displayName || '',
              avatarUrl: currentUser.photoURL || '',
              role: isAdmin ? 'admin' : 'staff',
              status: isAdmin ? 'approved' : 'pending',
              position: isAdmin ? 'Trưởng khoa' : '',
              createdAt: Date.now()
            };
            
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error: any) {
          console.error("Error fetching user profile:", error);
          alert("Lỗi kết nối cơ sở dữ liệu (Firestore). Hãy chắc chắn bạn đã tạo Firestore Database trong Firebase! Chi tiết: " + error.message);
          // Tạo profile tạm để không bị trắng màn hình
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'N/A',
            googleName: currentUser.displayName || '',
            avatarUrl: currentUser.photoURL || 'https://www.gravatar.com/avatar/?d=mp',
            role: 'staff',
            status: 'pending',
            position: '',
            createdAt: Date.now()
          });
        }
      } else {
        setProfile(null);
        setUsers([]);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!profile) return;
    
    // Nghe lén thay đổi của toàn bộ bảng users (chỉ 1 lần duy nhất cho toàn app)
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot: any) => {
      const fetchedUsers = snapshot.docs.map((doc: any) => doc.data() as UserProfile);
      setUsers(fetchedUsers);
    });

    return () => unsubscribeUsers();
  }, [profile]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed", error);
      alert("Đăng nhập thất bại! Lỗi: " + error.message);
    }
  };

  const logout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Logout failed", error);
      }
    }
  };

  const updateLocalProfile = (updates: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, logout, updateLocalProfile, users }}>
      {children}
    </AuthContext.Provider>
  );
};
