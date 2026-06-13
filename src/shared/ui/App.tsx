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
import HomePage from '../../modules/home/HomePage';
import JobsPage from '../../modules/Jobs/JobsPage';
import HistoryPage from '../../modules/history/HistoryPage';

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // ตรวจสอบว่าเป็น Localhost หรือไม่
  const isLocalhost = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1';

  useEffect(() => {
    if (isLocalhost) {
      // --- เคสที่ 1: รันบน Localhost (ใช้ Firebase Auth) ---
      console.log("Running on Localhost: Bypassing LIFF and using Firebase Auth");
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsAuth(true); // ล็อกอิน Firebase สำเร็จ
        } else {
          setIsAuth(false); // ยังไม่ได้ล็อกอิน Firebase
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // --- เคสที่ 2: รันบนระบบจริง/LINE App (ใช้ LIFF) ---
      const initLiff = async () => {
        try {
          await liff.init({ liffId: "2010385468-Yj0pURp7" });
          console.log("LIFF initialized!");
          
          if (!liff.isLoggedIn()) {
            liff.login();
          } else {
            setIsAuth(true); // ล็อกอิน LINE สำเร็จ
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
      {/* โครงสร้างจำลองหน้าจอโทรศัพท์ (Mobile Layout Container) */}
      <div className="mx-auto max-w-md w-full min-h-[100svh] bg-gray-50 flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* เช็คสิทธิ์: ถ้าเป็น localhost และยังไม่ผ่านการล็อกอิน ให้แสดงหน้า LocalLogin */}
        {!isAuth && isLocalhost ? (
          <LocalLogin />
        ) : (
          <>
            {/* แถบด้านบน */}
            <Header />
            
            {/* พื้นที่เนื้อหาหลัก */}
            <main className="flex-1 overflow-y-auto pb-20 scroll-smooth">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/history" element={<HistoryPage />} />
              </Routes>
            </main>

            {/* แถบเมนูด้านล่าง */}
            <BottomNav />
          </>
        )}
        
      </div>
    </BrowserRouter>
  );
}

export default App;