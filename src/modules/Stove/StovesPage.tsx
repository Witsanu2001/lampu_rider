import { useState } from "react";
import StovePending from "./components/StovePending";
import StoveSuccess from "./components/StoveSuccess";

export default function StovesPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "success">("pending");

  return (
    <div className="h-full w-full flex flex-col bg-gray-50 text-gray-800 overflow-hidden">
      
      {/* 🌟 Header & Tabs */}
      <div className="shrink-0 px-5 pt-5 pb-4 border-b border-gray-200 z-10 bg-white shadow-sm">

        <div className="flex bg-gray-100/80 p-1.5 rounded-2xl shadow-inner border border-gray-200/50">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
              activeTab === "pending"
                ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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
                ? "bg-white text-emerald-600 shadow-sm ring-1 ring-black/5"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
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
      <div className="flex-1 overflow-y-auto px-4 py-4 [&::-webkit-scrollbar]:hidden bg-gray-50/50">
        {activeTab === "pending" ? <StovePending /> : <StoveSuccess />}
      </div>

    </div>
  );
}