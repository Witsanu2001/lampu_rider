/* eslint-disable @typescript-eslint/no-explicit-any */
// src/shared/ui/App.tsx
import { useEffect, useState } from "react";
import liff from "@line/liff";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./Header";
import BottomNav from "./BottomNav";
import LocalLogin from "./LocalLogin";
import ErrorBoundary from "./ErrorBoundary";
import HistoryPage from "../../modules/history/HistoryPage";
import StovesPage from "../../modules/Stove/StovesPage";
import JobsPage from "../../modules/Job/JobsPage";
// 🌟 นำเข้า JobsDetail เพื่อให้กดเข้าไปดูรายละเอียดงานได้
import JobsDetail from "../../modules/Job/components/JobsDetail";

import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../const/firebase";
import { postLineAuth } from "../../modules/api/api_login";
// 🌟 นำเข้าคำสั่งเซฟ Token
import { setToken } from "../infra/auth/token";

// 🌟 ใส่ LIFF ID ของคุณที่ได้จาก LINE Developers Console
const LIFF_ID = "2010385468-Yj0pURp7";

// 🌟 URL ของแอปคุณ (ต้องตรงกับ Endpoint URL ใน LINE Console)
const APP_URL = "https://lampu-rider.web.app/";

export default function Appx() {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem("userData");
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [useLocalLogin, setUseLocalLogin] = useState(false);
  const [liffError, setLiffError] = useState<string | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: LIFF_ID });
        const loggedIn = liff.isLoggedIn();
        if (!loggedIn) {
          liff.login({ redirectUri: APP_URL });
          return; // หยุดการทำงานตรงนี้ เพื่อรอระบบเปลี่ยนหน้า
        }
        const lineToken = liff.getIDToken();
        if (lineToken) {
          try {
            const res = await postLineAuth(lineToken);
            if (!res.ok) throw new Error(`Backend แจ้งเตือน: ${res.status}`); // 🌟 เพิ่มบรรทัดนี้

            const data = await res.json();
            if (!data.firebase_token)
              throw new Error("Backend ไม่ให้ Firebase Token"); // 🌟 เพิ่มบรรทัดนี้

            // ถ้าผ่านมาได้ แปลว่า Backend ยอมรับ!
            const userCredential = await signInWithCustomToken(
              auth,
              data.firebase_token,
            );
            const firebaseToken = await userCredential.user.getIdToken(true);
            setToken(firebaseToken, 24);
          } catch (error) {
            console.error("❌ ล้มเหลวตอนแลก Token:", error);
            alert(`เกิดข้อผิดพลาดตอนแลก Token กับ Backend: ${error}`);
          }
        }

        const profile = await liff.getProfile();

        const normalizedUser = {
          uid: profile.userId,
          displayName: profile.displayName,
          photoURL: profile.pictureUrl || "",
          provider: "line",
        };

        setUser(normalizedUser);
        localStorage.setItem("userData", JSON.stringify(normalizedUser));
        setIsAuth(true);
        setLoading(false); 
      } catch (error) {
        console.error("❌ LIFF Init Error:", error);
        setLiffError(error instanceof Error ? error.message : String(error));
        setUseLocalLogin(true);
        setLoading(false);
      }
    };

    initLiff();
  }, []);

  // 1. หน้าจอตอนกำลังโหลด หรือ รอ LINE กำลัง Redirect
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-500 text-sm font-medium">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-sm"></div>
        กำลังเชื่อมต่อระบบ LINE...
      </div>
    );
  }

  // 2. ถ้าต้องการใช้ LocalLogin (LIFF error)
  if (useLocalLogin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-orange-100 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            LIFF Login ล้มเหลว
          </h2>
          <p className="text-gray-500 text-xs mb-4">
            {liffError || "ไม่สามารถเชื่อมต่อระบบ LINE ได้"}
          </p>
          <p className="text-gray-400 text-xs mb-6">
            ใช้ Local Login แทนชั่วคราวเพื่อทดสอบ
          </p>

          <LocalLogin
            onSuccess={(userData) => {
              setUser(userData);
              localStorage.setItem("userData", JSON.stringify(userData));
              setIsAuth(true);
              setUseLocalLogin(false);
            }}
          />
        </div>
      </div>
    );
  }

  // 3. ถ้ามี Error จาก LIFF หรือยังไม่ได้ Auth
  if (!isAuth) {
    return (
      <div className="mx-auto max-w-md w-full min-h-svh bg-gray-50 flex flex-col items-center justify-center p-6 text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-500 mb-2 text-sm font-bold">
          ไม่สามารถเชื่อมต่อระบบ LINE ได้
        </p>
        <p className="text-gray-400 text-xs mb-6">
          กรุณาเปิดลิงก์นี้ผ่านแอปพลิเคชัน LINE
          <br />
          หรือใช้ลิงก์ที่เป็น HTTPS เท่านั้น
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold active:scale-95 transition-all shadow-sm w-full max-w-200px"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="mx-auto max-w-md w-full min-h-svh bg-gray-50 flex flex-col relative shadow-2xl overflow-hidden">
        <Header user={user} setUser={setUser} />

        <main className="flex-1 overflow-y-auto pb-20 scroll-smooth">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<JobsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/stove" element={<StovesPage />} />

              {/* 🌟 เพิ่ม Route สำหรับหน้าดูรายละเอียดออเดอร์ */}
              <Route path="/job_detail/:orderId" element={<JobsDetail />} />

              {/* ถ้า URL ไม่ตรงกับข้างบนเลย ให้เด้งกลับมาหน้า Home (JobsPage) */}
              <Route path="*" element={<JobsPage />} />
            </Routes>
          </ErrorBoundary>
        </main>

        <BottomNav
          user={user}
          isPaymentPage={false}
          hasPermission={() => true}
        />
      </div>
    </BrowserRouter>
  );
}
