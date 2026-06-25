/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/Stove/components/StoveSuccess.tsx
import { useEffect, useState, useRef, useCallback } from "react";
import { getStoveSuccess } from "../../api/api_jobs";

// ฟังก์ชันดึงวันปัจจุบันฟอร์แมต YYYY-MM-DD แน่นอนไม่เพี้ยนตาม Timezone
const getTodayDateString = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

export default function StoveSuccess() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับ Pagination และ Infinite Scroll ดึงครั้งละ 10 รายการ
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // State ค้นหาและตัวเลือกปฏิทิน (Default เป็นวันที่ปัจจุบัน)
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [searchInput, setSearchInput] = useState(""); 
  const [searchName, setSearchName] = useState("");   

  // ยิง API ค้นหาเมื่อมีการเปลี่ยนค่า Page, วันที่ หรือชื่อค้นหา
  useEffect(() => {
    let isMounted = true;

    const fetchStoveHistory = async () => {
      if (page === 1) setLoading(true);
      else setIsFetchingMore(true);

      try {
        const data = await getStoveSuccess(selectedDate, searchName, page, limit);

        if (isMounted) {
          // หากข้อมูลหน้าปัจจุบันได้มาไม่ครบ 10 แสดงว่าหน้าถัดไปไม่มีแล้ว
          if (data.length < limit) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }

          if (page === 1) {
            setJobs(data); // หน้าแรกวางทับข้อมูลเก่า
          } else {
            setJobs((prev) => [...prev, ...data]); // หน้าถัดไปเอามาต่อตูด
          }
        }
      } catch (error) {
        console.error("Error fetching stove success history:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsFetchingMore(false);
        }
      }
    };

    fetchStoveHistory();

    return () => {
      isMounted = false;
    };
  }, [page, selectedDate, searchName, limit]);

  // 🌟 ฟังก์ชันแบบใหม่: ตรวจจับเมื่อผู้ใช้เลื่อนลงมาเห็นรายการสุดท้าย
  const observer = useRef<IntersectionObserver | null>(null);
  const lastJobElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      // ถ้าเห็นกล่องสุดท้ายแล้ว และยังมีข้อมูลให้โหลดต่อ ค่อยบวกหน้าเพิ่ม
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, isFetchingMore, hasMore]);

  // กดปุ่มแว่นขยายหรือ Enter เพื่อค้นหาชื่อ
  const handleSearch = () => {
    setSearchName(searchInput.trim());
    setPage(1);
    setHasMore(true);
    setJobs([]);
  };

  // เปลี่ยนวันในปฏิทินไอคอน
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setPage(1);
    setHasMore(true);
    setJobs([]);
  };

  return (
    <div className="w-full flex flex-col text-gray-800 dark:text-gray-100 animate-fade-in transition-colors duration-300">
      
      {/* 🌟 ส่วนควบคุมช่องค้นหาและปฏิทิน */}
      <div className="shrink-0 pb-4 bg-transparent">
        <div className="flex gap-3 items-center">
          
          {/* ช่องค้นหาพิมพ์ชื่อลูกค้า */}
          <div className="flex-1 flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden focus-within:border-emerald-500 dark:focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all shadow-sm">
            <input
              type="text"
              placeholder="ค้นหาชื่อลูกค้า..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button 
              onClick={handleSearch}
              className="px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center text-gray-500 dark:text-gray-300"
            >
              <span className="text-lg">🔍</span>
            </button>
          </div>

          {/* ตัวเลือกปฏิทินสไตล์แอปสมาร์ทโฟน */}
          <div className="relative shrink-0 w-12 h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-between overflow-hidden group hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors">
            <div className="bg-red-500 w-full text-[10px] font-bold text-white text-center uppercase py-1px">
              {selectedDate ? new Date(selectedDate).toLocaleDateString('th-TH', { month: 'short' }) : "ALL"}
            </div>
            <div className="text-xl font-black text-gray-800 dark:text-white leading-none mb-1.5">
              {selectedDate ? new Date(selectedDate).getDate() : "-"}
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        </div>

        {/* ปุ่มรีเซ็ตการค้นหากลับมาเป็น "วันนี้" */}
        {(selectedDate !== getTodayDateString() || searchName !== "") && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => {
                setSelectedDate(getTodayDateString());
                setSearchInput("");
                setSearchName("");
                setPage(1);
                setHasMore(true);
              }}
              className="text-xs font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg active:scale-95 transition-colors"
            >
              ❌ ล้างการค้นหา (กลับสู่วันนี้)
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {loading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-sm"></div>
            <div className="text-gray-500 dark:text-gray-400 font-medium">กำลังโหลดประวัติเก็บเตา...</div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
            <span className="text-6xl mb-4 opacity-50">♨️</span>
            <p className="text-lg font-medium">ไม่พบรายการเก็บสำเร็จ</p>
          </div>
        ) : (
          jobs.map((job, index) => {
            const orderId = job.order_id ?? job.orderId ?? job.id;
            const recipient = job.shipping?.recipient ?? job.recipient ?? "ไม่ระบุชื่อ";
            const address = job.shipping?.address ?? job.address ?? "ไม่ระบุที่อยู่";
            
            const stoveCount = job.equipment?.stoveCount ?? job.stoveCount ?? 0;
            const panCount = job.equipment?.panCount ?? job.panCount ?? 0;
            
            const isComplete = job.is_complete ?? job.isComplete ?? (job.status === "success");
            const collectedStoves = job.collected_stoves ?? job.collectedStoves ?? stoveCount;
            const collectedPans = job.collected_pans ?? job.collectedPans ?? panCount;
            const reason = job.reason ?? "";

            return (
              <div
                key={orderId}
                // 🌟 สำคัญ: แปะ ref ให้กับรายการอันสุดท้าย เพื่อดักจับการเลื่อนจอ
                ref={index === jobs.length - 1 ? lastJobElementRef : null}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 flex items-center justify-between gap-3 animate-fade-in transition-colors"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h2 className="font-bold text-gray-800 dark:text-gray-100 text-[15px] flex-1 min-w-0 truncate">
                      คุณ {recipient}
                    </h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 transition-colors ${
                      isComplete 
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {isComplete ? "✅ ครบ" : "⚠️ ไม่ครบ"}
                    </span>
                  </div>
                  
                  <p className="text-[12px] text-gray-600 dark:text-gray-400 truncate">
                    📍 {address}
                  </p>
                  
                  {!isComplete && reason && (
                    <p className="text-[11px] text-red-500 dark:text-red-400 truncate mt-1">
                      เหตุผล: {reason}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right flex flex-col items-end">
                  <div className="text-[12px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-500/20 transition-colors">
                    เตา {collectedStoves} / กระทะ {collectedPans}
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-medium tracking-wide">
                    #{orderId ? orderId.slice(-6) : "------"}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* จุดแสดงสถานะ Loading อันเล็กๆ ตอนเลื่อนจอลง */}
        {isFetchingMore && hasMore && (
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="inline-block w-6 h-6 border-4 border-gray-200 dark:border-gray-700 border-t-emerald-500 rounded-full animate-spin shadow-sm"></div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-2 animate-pulse">
              กำลังโหลดเพิ่มเติม...
            </p>
          </div>
        )}

        {/* แสดงข้อความแจ้งเมื่อดึงข้อมูลออกมาครบถ้วนหมดสิ้นแล้ว */}
        {!hasMore && jobs.length > 0 && (
          <div className="py-6 text-center text-xs font-medium text-gray-400 dark:text-gray-500">
            --- แสดงข้อมูลครบทั้งหมดแล้ว ---
          </div>
        )}
      </div>
    </div>
  );
}