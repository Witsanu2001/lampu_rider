/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
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

  // ฟังก์ชันตรวจจับการเลื่อนจอลงมาล่างสุดห่างไม่เกิน 100px เพื่อโหลดหน้าถัดไป
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (hasMore && !isFetchingMore && !loading) {
        setPage((prev) => prev + 1);
      }
    }
  };

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
    <div className="h-full w-full flex flex-col bg-gray-50 text-gray-800 overflow-hidden animate-fade-in">
      
      {/* 🌟 ส่วนควบคุมช่องค้นหาและปฏิทิน (จัดวางลงในแถวเดียวเดี่ยวๆ ชิคๆ) */}
      <div className="shrink-0 pb-4 bg-transparent">
        <div className="flex gap-3 items-center">
          
          {/* ช่องค้นหาพิมพ์ชื่อลูกค้า */}
          <div className="flex-1 flex bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all shadow-sm">
            <input
              type="text"
              placeholder="ค้นหาชื่อลูกค้า..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none text-gray-800"
            />
            <button 
              onClick={handleSearch}
              className="px-4 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-500"
            >
              <span className="text-lg">🔍</span>
            </button>
          </div>

          {/* 🌟 ตัวเลือกปฏิทินสไตล์แอปสมาร์ทโฟน */}
          <div className="relative shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-between overflow-hidden group hover:border-emerald-400 transition-colors">
            {/* แถบเดือนด้านบน */}
            <div className="bg-red-500 w-full text-[10px] font-bold text-white text-center uppercase py-1px">
              {selectedDate ? new Date(selectedDate).toLocaleDateString('th-TH', { month: 'short' }) : "ALL"}
            </div>
            {/* เลขวันที่ระบุตรงกลาง */}
            <div className="text-xl font-black text-gray-800 leading-none mb-1.5">
              {selectedDate ? new Date(selectedDate).getDate() : "-"}
            </div>
            {/* ซ่อน HTML Date ดั้งเดิมโปร่งแสงทับไว้ เพื่อให้เบราว์เซอร์เปิดหน้าต่างปฏิทินขึ้นมาเมื่อกดคลิก */}
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
              className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg active:scale-95"
            >
              ❌ ล้างการค้นหา (กลับสู่วันนี้)
            </button>
          </div>
        )}
      </div>

      {/* 🌟 พื้นที่เลื่อนดูรายการการ์ดเก็บเตาสำเร็จ (ซ่อน Scrollbar เนียนตาตามสั่ง) */}
      <div
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none pb-24"
      >
        {loading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mb-4 shadow-sm"></div>
            <div className="text-gray-500 font-medium">กำลังโหลดประวัติเก็บเตา...</div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-6xl mb-4 opacity-50">♨️</span>
            <p className="text-lg font-medium">ไม่พบรายการเก็บสำเร็จ</p>
          </div>
        ) : (
          jobs.map((job) => {
            // ประกาศตัวแปรรองรับข้อมูลที่มาจาก API หลังบ้านอย่างยืดหยุ่น
            const orderId = job.order_id ?? job.orderId ?? job.id;
            const recipient = job.shipping?.recipient ?? job.recipient ?? "ไม่ระบุชื่อ";
            const address = job.shipping?.address ?? job.address ?? "ไม่ระบุที่อยู่";
            
            const stoveCount = job.equipment?.stoveCount ?? job.stoveCount ?? 0;
            const panCount = job.equipment?.panCount ?? job.panCount ?? 0;
            
            // เช็กสถานะการเก็บว่าสมบูรณ์ครบถ้วนหรือไม่
            const isComplete = job.is_complete ?? job.isComplete ?? (job.status === "success");
            const collectedStoves = job.collected_stoves ?? job.collectedStoves ?? stoveCount;
            const collectedPans = job.collected_pans ?? job.collectedPans ?? panCount;
            const reason = job.reason ?? "";

            return (
              <div
                key={orderId}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between gap-3 animate-fade-in"
              >
                {/* 🌟 ซ้าย: ชื่อ ที่อยู่ และป้ายสถานะ */}
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    {/* 🌟 บังคับสีข้อความให้เข้มด้วย text-gray-800 */}
                    <h2 className="font-bold text-gray-800 text-[15px] flex-1 min-w-0 truncate">
                      คุณ {recipient}
                    </h2>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${isComplete ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {isComplete ? "✅ ครบ" : "⚠️ ไม่ครบ"}
                    </span>
                  </div>
                  
                  {/* 🌟 บังคับสีที่อยู่ให้เข้มขึ้นด้วย text-gray-600 */}
                  <p className="text-[12px] text-gray-600 truncate">
                    📍 {address}
                  </p>
                  
                  {!isComplete && reason && (
                    <p className="text-[11px] text-red-500 truncate mt-1">
                      เหตุผล: {reason}
                    </p>
                  )}
                </div>

                {/* 🌟 ขวา: สรุปยอดเตา/กระทะ และรหัสออเดอร์ */}
                <div className="shrink-0 text-right flex flex-col items-end">
                  <div className="text-[12px] font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                    เตา {collectedStoves} / กระทะ {collectedPans}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 font-medium tracking-wide">
                    #{orderId ? orderId.slice(-6) : "------"}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* จุดแสดงสถานะ Loading อันเล็กๆ วิ่งด้านล่างสุดตอนกวาดดึงเพิ่มหน้าถัดไป */}
        {isFetchingMore && hasMore && (
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="inline-block w-6 h-6 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin shadow-sm"></div>
            <p className="text-xs font-medium text-gray-500 mt-2 animate-pulse">
              กำลังโหลดเพิ่มเติม...
            </p>
          </div>
        )}

        {/* แสดงข้อความแจ้งเมื่อดึงข้อมูลออกมาครบถ้วนหมดสิ้นแล้ว */}
        {!hasMore && jobs.length > 0 && (
          <div className="py-6 text-center text-xs font-medium text-gray-400">
            --- แสดงข้อมูลครบทั้งหมดแล้ว ---
          </div>
        )}
      </div>
    </div>
  );
}