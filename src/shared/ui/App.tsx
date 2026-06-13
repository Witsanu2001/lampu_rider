// src/shared/ui/App.tsx
import { useEffect } from 'react';
import liff from '@line/liff';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';

// นำเข้าหน้า Page จาก Modules ของคุณ
import HomePage from '../../modules/home/HomePage';
import JobsPage from '../../modules/Jobs/JobsPage';
import HistoryPage from '../../modules/history/HistoryPage';

function App() {
  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: "2010385468-Yj0pURp7" });
        console.log("LIFF initialized!");
        
        if (!liff.isLoggedIn()) {
          liff.login();
        }
      } catch (error) {
        console.error("LIFF Init Error:", error);
      }
    };

    initLiff();
  }, []);

  return (
    <BrowserRouter>
      {/* โครงสร้างจำลองหน้าจอโทรศัพท์ (Mobile Layout Container) */}
      <div className="mx-auto max-w-md w-full min-h-[100svh] bg-gray-50 flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* แถบด้านบน */}
        <Header />
        
        {/* พื้นที่เนื้อหาหลัก (จะ Scroll ได้ตรงนี้) */}
        <main className="flex-1 overflow-y-auto pb-20 scroll-smooth">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </main>

        {/* แถบเมนูด้านล่าง */}
        <BottomNav />
        
      </div>
    </BrowserRouter>
  );
}

export default App;