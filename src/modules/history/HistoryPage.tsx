/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getHistorys } from "../api/api_jobs"; 

// ฟังก์ชันหาวันที่ปัจจุบัน (ป้องกันปัญหา Timezone เปลี่ยนวัน)
const getTodayDateString = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

export default function HistoryPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับ Pagination และ Infinite Scroll
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // 🌟 State สำหรับวันที่ (Default เป็นวันนี้) และการค้นหา
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [searchInput, setSearchInput] = useState(""); // ข้อความตอนกำลังพิมพ์
  const [searchName, setSearchName] = useState("");   // ข้อความตอนกดค้นหาแล้ว

  // ดึงข้อมูลเมื่อ Date, Page หรือ Search Name เปลี่ยน
  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      if (page === 1) setLoading(true);
      else setIsFetchingMore(true);

      try {
        const data = await getHistorys(selectedDate, searchName, page, limit);

        if (isMounted) {
          if (data.length < limit) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }

          if (page === 1) {
            setJobs(data);
          } else {
            setJobs((prev) => [...prev, ...data]);
          }
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsFetchingMore(false);
        }
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [page, selectedDate, searchName, limit]);

  // ฟังก์ชัน Scroll Load More
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (hasMore && !isFetchingMore && !loading) {
        setPage((prev) => prev + 1);
      }
    }
  };

  // 🌟 ฟังก์ชันกดค้นหาชื่อ
  const handleSearch = () => {
    setSearchName(searchInput.trim());
    setPage(1);
    setHasMore(true);
    setJobs([]);
  };

  // ฟังก์ชันเปลี่ยนวันที่
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setPage(1);
    setHasMore(true);
    setJobs([]);
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 overflow-hidden animate-fade-in">
      
      {/* 🌟 Header & Toolbar */}
      <div className="shrink-0 px-5 pt-5 pb-4 border-b border-gray-200 dark:border-gray-800 z-10 bg-white dark:bg-gray-900 shadow-sm">

        <div className="flex gap-3 items-center">
          {/* ช่องค้นหาชื่อ */}
          <div className="flex-1 flex bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
            <input
              type="text"
              placeholder="ค้นหาชื่อลูกค้า..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none text-gray-800 dark:text-gray-200"
            />
            <button 
              onClick={handleSearch}
              className="px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center justify-center text-gray-500 dark:text-gray-300"
            >
              <span className="text-lg">🔍</span>
            </button>
          </div>

          {/* 🌟 ไอคอนปฏิทินเลือกวันที่ */}
          <div className="relative shrink-0 w-[50px] h-[50px] bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-between overflow-hidden group hover:border-emerald-400 transition-colors">
            {/* แถบเดือนสีแดง */}
            <div className="bg-red-500 w-full text-[10px] font-bold text-white text-center py-[2px] uppercase">
              {selectedDate ? new Date(selectedDate).toLocaleDateString('th-TH', { month: 'short' }) : "ALL"}
            </div>
            {/* ตัวเลขวัน */}
            <div className="text-xl font-black text-gray-800 dark:text-gray-100 leading-none mb-1.5">
              {selectedDate ? new Date(selectedDate).getDate() : "-"}
            </div>
            {/* ซ่อน Input แบบ date ทับไว้ เพื่อให้กดแล้วเด้งหน้าต่างเลือกวันที่ */}
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        </div>

        {/* ปุ่มล้างวันที่ (แสดงเมื่อมีการเลือกวันที่) */}
        {(selectedDate !== getTodayDateString() || searchName !== "") && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setSelectedDate(getTodayDateString());
                setSearchInput("");
                setSearchName("");
                setPage(1);
                setHasMore(true);
              }}
              className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg active:scale-95"
            >
              ❌ ล้างการค้นหา (กลับสู่วันนี้)
            </button>
          </div>
        )}
      </div>

      {/* 🌟 Content Scroll */}
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-gray-50/50 dark:bg-gray-900 pb-24"
      >
        {loading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-sm"></div>
            <div className="text-gray-500 font-medium">กำลังโหลดประวัติ...</div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
            <span className="text-6xl mb-4 opacity-50">📂</span>
            <p className="text-lg font-medium">ไม่พบประวัติการจัดส่ง</p>
          </div>
        ) : (
          jobs.map((job) => {
            const mainItemText = job?.mainItems?.[0]
              ? `${job.mainItems[0].name} x${job.mainItems[0].quantity}`
              : "ไม่พบรายการหลัก";

            return (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden p-4 sm:p-5 transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 w-fit mb-2">
                      ✅ จัดส่งสำเร็จ
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                      {mainItemText}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 shrink-0">
                    {formatTime(job?.updated_at)} น.
                  </span>
                </div>

                <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <span className="mt-0.5 text-emerald-500 shrink-0">📍</span>
                  <span className="line-clamp-2 leading-relaxed">
                    <span className="font-semibold mr-1 text-gray-800 dark:text-gray-200">คุณ {job.shipping?.recipient}:</span> 
                    {job.shipping?.address}
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700/80 pt-3 mt-2">
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    รหัส: #{job.id.slice(-6)}
                  </span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    ยอดเก็บเงิน: ฿{job.totals?.grandTotal?.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* จุด Loading เมื่อเลื่อนลงล่างสุด */}
        {isFetchingMore && hasMore && (
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin shadow-sm"></div>
            <p className="text-sm font-medium text-gray-500 mt-3 animate-pulse">
              กำลังโหลดเพิ่มเติม...
            </p>
          </div>
        )}
        
      </div>
    </div>
  );
}