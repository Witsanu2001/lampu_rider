import { useState } from "react";
import StovePending from "./components/StovePending";
import StoveSuccess from "./components/StoveSuccess";

export default function StovesPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "success">("pending");

  return (
    // 🌟 เพิ่ม dark:bg-gray-900 และ dark:text-gray-100 พร้อม transition-colors
    <div className="h-full w-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden transition-colors duration-300">
      
      {/* 🌟 Header & Tabs */}
      <div className="shrink-0 px-5 pt-5 pb-4 border-b border-gray-200 dark:border-gray-800 z-10 bg-white dark:bg-gray-900 shadow-sm transition-colors duration-300">

        {/* 🌟 ปรับสีพื้นหลังของกล่อง Tab */}
        <div className="flex bg-gray-100/80 dark:bg-gray-800/80 p-1.5 rounded-2xl shadow-inner border border-gray-200/50 dark:border-gray-700/50 transition-colors">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
              activeTab === "pending"
                ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🕒</span>
              <span>รอเก็บเตา</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("success")}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
              activeTab === "success"
                ? "bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">✅</span>
              <span>เก็บแล้ว</span>
            </div>
          </button>
        </div>
      </div>

      {/* 🌟 Content (สลับ Component ตาม Tab) */}
      <div className="flex-1 overflow-y-auto px-4 py-4 [&::-webkit-scrollbar]:hidden bg-gray-50/50 dark:bg-gray-900/50 pb-24 transition-colors duration-300">
        {activeTab === "pending" ? <StovePending /> : <StoveSuccess />}
      </div>

    </div>
  );
}