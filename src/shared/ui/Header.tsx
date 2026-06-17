/* eslint-disable @typescript-eslint/no-explicit-any */
// src/shared/ui/Header.tsx

interface HeaderProps {
  user?: any;
  setUser?: (user: any) => void;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="top-0 z-50 bg-white shadow-sm px-4 py-3 flex justify-between items-center border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-green-500 shadow-sm">
          <img 
            // 🌟 เช็คว่ามี photoURL ไหม ถ้าไม่มีให้ใช้ตัวอักษรย่อจากชื่อแทน
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'Rider'}&background=0D8ABC&color=fff`} 
            alt="Profile" 
            className="w-full h-full object-cover"
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = `https://ui-avatars.com/api/?name=${user?.displayName || 'Rider'}&background=0D8ABC&color=fff`;
            }}
          />
        </div>
        {/* 🌟 เพิ่มส่วนแสดงชื่อไรเดอร์ */}
        <div className="flex flex-col">
          <span className="font-bold text-sm text-gray-800">
            {user?.displayName || "ผู้ขับขี่"}
          </span>
        </div>
      </div>
      
      {/* <button className="bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
      </button> */}
    </header>
  );
}