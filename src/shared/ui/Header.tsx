/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

interface HeaderProps {
  user?: any;
  setUser?: (user: any) => void;
}

export default function Header({ user }: HeaderProps) {
  // 🌟 1. ใช้ฟังก์ชันใน useState เพื่อเช็กค่าเริ่มต้นตั้งแต่ตอนแรกเลย (Lazy Initialization)
  // วิธีนี้จะรันแค่ครั้งเดียวตอนโหลด Component ทำให้ไม่ต้องไป set state ใน useEffect
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // ใส่ try-catch หรือ typeof window ไว้กันพังกรณีเอาไปทำ SSR ในอนาคต
    if (typeof window === "undefined") return false;
    
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // 🌟 2. ใช้ useEffect เฉพาะกับการจัดการ DOM (Side Effect) เมื่อ State เปลี่ยนแปลง
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // 🌟 3. ฟังก์ชันสลับโหมด ตอนนี้แค่สลับค่า boolean ก็พอ
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <header className="top-0 z-50 bg-white dark:bg-gray-900 shadow-sm px-4 py-3 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-green-500 shadow-sm">
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'Rider'}&background=0D8ABC&color=fff`} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${user?.displayName || 'Rider'}&background=0D8ABC&color=fff`;
            }}
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-gray-800 dark:text-gray-100">
            {user?.displayName || "ผู้ขับขี่"}
          </span>
        </div>
      </div>
      
      <button 
        onClick={toggleTheme}
        className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-full transition-colors focus:outline-none"
        aria-label="Toggle Dark Mode"
      >
        {isDarkMode ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 2.32a1 1 0 011.415 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-2.32 4.22a1 1 0 010 1.415l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 18a1 1 0 01-1-1v-1a1 1 0 112 0v1a1 1 0 01-1 1zm-4.22-2.32a1 1 0 01-1.415 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm2.32-4.22a1 1 0 010-1.415l.707-.707a1 1 0 011.414 1.414L4.32 5.78a1 1 0 01-1.414 0zM10 5a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </header>
  );
}