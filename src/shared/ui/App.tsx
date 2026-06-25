/* eslint-disable @typescript-eslint/no-explicit-any */
// src/shared/ui/App.tsx
import { useEffect, useState } from "react";
import liff from "@line/liff";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./Header";
import BottomNav from "./BottomNav";
import LocalLogin from "./LocalLogin";
import HistoryPage from "../../modules/history/HistoryPage";
import StovesPage from "../../modules/Stove/StovesPage";
import JobsPage from "../../modules/Job/JobsPage";
import JobsDetail from "../../modules/Job/components/JobsDetail";

// 🌟 เพิ่ม onAuthStateChanged เข้ามา
import { signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { auth } from "../const/firebase";
import { postLineAuth } from "../../modules/api/api_login";
import { setToken } from "../infra/auth/token";

const LIFF_ID = "2010385468-Yj0pURp7";
const APP_URL = "https://lampu-rider.web.app/";
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export default function App() {
  const savedUserRaw = localStorage.getItem("userData");
  const savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;

  const [user, setUser] = useState<any>(savedUser);
  const [isAuth, setIsAuth] = useState<boolean>(
    () => isLocalhost && !!savedUser,
  );
  const [useLocalLogin, setUseLocalLogin] = useState<boolean>(
    () => isLocalhost && !savedUser,
  );
  const [loading, setLoading] = useState<boolean>(!isLocalhost);
  const [liffError, setLiffError] = useState<string | null>(null);

  useEffect(() => {
    if (isLocalhost) {
      return;
    }

    const initSystem = async () => {
      try {
        // 🚀 1. Fast Track: เช็คก่อนว่า Firebase ในเครื่องยังจำล็อกอินเดิมได้ไหม
        const fbUser = await new Promise<any>((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (u) => {
            unsubscribe();
            resolve(u);
          });
        });

        // 🌟 แก้ไขตรงนี้: ดึงข้อมูลจาก LocalStorage ภายใน useEffect โดยตรง
        // เพื่อป้องกันปัญหา React Hook missing dependency และ Infinite Loop
        const currentSavedUserRaw = localStorage.getItem("userData");
        const currentSavedUser = currentSavedUserRaw
          ? JSON.parse(currentSavedUserRaw)
          : null;

        // 🚀 2. ถ้าเครื่องจำได้ และมีข้อมูล User ใน LocalStorage -> เด้งเข้าแอปเลย!!
        if (fbUser && currentSavedUser) {
          setUser(currentSavedUser);
          setIsAuth(true);
          setLoading(false);

          fbUser.getIdToken(true).then((token: string) => setToken(token, 24));
          return;
        }

        // 🐢 3. ถ้าไม่มีประวัติ (เข้าครั้งแรก หรือเพิ่งเตะออก) ค่อยรัน LIFF ตามปกติ
        await liff.init({ liffId: LIFF_ID });
        const loggedIn = liff.isLoggedIn();
        if (!loggedIn) {
          liff.login({ redirectUri: APP_URL });
          return;
        }

        const lineToken = liff.getIDToken();
        if (lineToken) {
          try {
            const res = await postLineAuth(lineToken);
            if (!res.ok) throw new Error(`Backend แจ้งเตือน: ${res.status}`);

            const data = await res.json();
            if (!data.firebase_token)
              throw new Error("Backend ไม่ให้ Firebase Token");

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
        console.error("❌ System Init Error:", error);
        setLiffError(error instanceof Error ? error.message : String(error));
        setUseLocalLogin(true);
        setLoading(false);
      }
    };

    initSystem();
  }, []); // ✅ ปล่อยวงเล็บว่างไว้แบบนี้ได้เลย ไม่ต้องใส่ dependency แล้ว

  // 1. หน้าจอตอนกำลังโหลด หรือ รอ LINE กำลัง Redirect
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-500 text-sm font-medium">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-sm"></div>
        กำลังเชื่อมต่อระบบ...
      </div>
    );
  }

  // 2. ถ้าต้องการใช้ LocalLogin (LIFF error หรือรันบน Localhost)
  if (useLocalLogin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-sm border border-orange-100 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Local Login / ทดสอบระบบ
          </h2>
          <p className="text-gray-500 text-xs mb-4">
            {liffError ||
              "คุณกำลังรันระบบบน Localhost หรือเชื่อมต่อ LINE ไม่ได้"}
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

  // 3. ถ้ามี Error จาก LIFF หรือยังไม่ได้ Auth บนหน้าเว็บจริง
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

  // 4. ถ้าล็อกอินสำเร็จแล้ว Render หน้าหลักของแอป
  return (
    <BrowserRouter>
      <div className="mx-auto max-w-md w-full h-svh bg-gray-50 dark:bg-gray-900 flex flex-col relative shadow-2xl overflow-hidden transition-colors duration-300">
        <Header user={user} setUser={setUser} />

        <main className="flex-1 overflow-y-auto pb-20 scroll-smooth">
          <Routes>
            <Route path="/" element={<JobsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/stove" element={<StovesPage />} />
            <Route path="/job_detail/:orderId" element={<JobsDetail />} />
            <Route path="*" element={<JobsPage />} />
          </Routes>
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
