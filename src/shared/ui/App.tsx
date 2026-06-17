/* eslint-disable @typescript-eslint/no-explicit-any */
// src/shared/ui/App.tsx
import { useEffect, useState } from 'react';
import liff from '@line/liff';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../const/firebase';

import Header from './Header';
import BottomNav from './BottomNav';
import LocalLogin from './LocalLogin';

// นำเข้าหน้า Page จาก Modules
import HistoryPage from '../../modules/history/HistoryPage';
import StovesPage from '../../modules/Stove/StovesPage';
import JobsPage from '../../modules/Job/JobsPage';

// 🌟 ใส่ LIFF ID ของคุณให้ถูกต้อง
const LIFF_ID = "2010209102-zHsx4M0r";

export default function App() {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('userData');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const isLocalhost = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1';

  useEffect(() => {
    if (isLocalhost) {
      // --- เคสที่ 1: รันบน Localhost (ใช้ Firebase Auth) ---
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // 🌟 1. ดึง Token จาก Firebase และเก็บลง localStorage
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('firebase_token', token);

          // แปลงข้อมูล
          const normalizedUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Rider',
            photoURL: firebaseUser.photoURL || '',
            provider: 'firebase'
          };

          setUser(normalizedUser);
          localStorage.setItem('userData', JSON.stringify(normalizedUser));
          setIsAuth(true);
        } else {
          setUser(null);
          localStorage.removeItem('userData');
          localStorage.removeItem('firebase_token'); // 🌟 เคลียร์ Token เมื่อ Logout
          setIsAuth(false);
        }
        setLoading(false);
      });
      return () => unsubscribe();

    } else {
      // --- เคสที่ 2: รันบนระบบจริง/LINE App (ใช้ LIFF) ---
      const initLiff = async () => {
        try {
          await liff.init({ liffId: LIFF_ID });
          
          if (!liff.isLoggedIn()) {
            liff.login();
          } else {
            // 🌟 2. ดึง Token ของ LINE และเก็บลง localStorage
            const lineToken = liff.getIDToken();
            if (lineToken) {
              localStorage.setItem('auth_token', lineToken);
            }

            const profile = await liff.getProfile();
            const normalizedUser = {
              uid: profile.userId,
              displayName: profile.displayName,
              photoURL: profile.pictureUrl || '',
              provider: 'line'
            };

            setUser(normalizedUser);
            localStorage.setItem('userData', JSON.stringify(normalizedUser));
            setIsAuth(true);
          }
        } catch (error) {
          console.error("LIFF Init Error:", error);
        } finally {
          setLoading(false);
        }
      };
      initLiff();
    }
  }, [isLocalhost]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-500 text-sm font-medium">
        กำลังโหลดระบบ...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="mx-auto max-w-md w-full min-h-svh bg-gray-50 flex flex-col relative shadow-2xl overflow-hidden">
        
        {!isAuth && isLocalhost ? (
          <LocalLogin />
        ) : (
          <>
            {/* 🌟 3. ส่ง user และ setUser เข้าไปให้ Header */}
            <Header user={user} setUser={setUser} />
            
            <main className="flex-1 overflow-y-auto pb-20 scroll-smooth">
              <Routes>
                <Route path="/" element={<JobsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/stove" element={<StovesPage />} />
              </Routes>
            </main>

            {/* 🌟 4. ส่ง user เข้าไปให้ BottomNav */}
            <BottomNav 
              user={user} 
              isPaymentPage={false} 
              hasPermission={() => true} 
            />
          </>
        )}
        
      </div>
    </BrowserRouter>
  );
}