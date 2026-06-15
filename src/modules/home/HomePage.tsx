/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/home/HomePage.tsx
import { useEffect, useState } from "react";
import { getJobs, updateOrderStatus } from "../api/api_jobs"; // ตรวจสอบ path ให้ตรงกับโปรเจกต์ของคุณ

export default function HomePage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [refreshKey, setRefreshKey] = useState(0);
  const userDataString = localStorage.getItem("userData");
  const currentUser = userDataString ? JSON.parse(userDataString) : null;

  // ฟังก์ชันดึงคิวงาน
  useEffect(() => {
    let isMounted = true;

    const fetchActiveJobs = async () => {
      setLoading(true); 
      try {
        const data = await getJobs();
        if (isMounted) {
          // 🌟 1. แก้ Filter ให้แสดงทั้งงานที่ "รอรับ" (ready) และ "กำลังไปส่ง" (shipping)
          const activeJobs = data.filter(
            (job: any) => job.order_details.status === "ready" || job.order_details.status === "shipping"
          );
          
          // เรียงคิวงานตามที่แอดมินจัดมาให้
          activeJobs.sort((a: any, b: any) => a.queue_number - b.queue_number);
          setJobs(activeJobs);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchActiveJobs();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // 🌟 2. ฟังก์ชันอัปเดตสถานะแบบไดนามิก
  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    if (!currentUser?.uid) {
      alert("ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่");
      return;
    }

    try {
      // ส่งสถานะต่อไปให้ Backend
      await updateOrderStatus(orderId, nextStatus, currentUser.uid);
      
      // แจ้งเตือนตามสถานะที่เพิ่งอัปเดตไป
      if (nextStatus === "shipping") {
        alert("รับออเดอร์แล้ว! ขับขี่ปลอดภัยครับ 🛵");
      } else if (nextStatus === "delivered") {
        alert("จัดส่งสำเร็จ! ปิดงานเรียบร้อย 🎉");
      }
      
      // สั่งดึงข้อมูลใหม่เพื่อรีเฟรชหน้าจอ
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  // ฟังก์ชันจัดรูปแบบเวลา
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">กำลังโหลดคิวงาน...</div>;
  }

  return (
    <div className="p-4 flex flex-col gap-4 animate-fade-in">
      
      <h2 className="font-bold text-gray-800 flex items-center gap-2">
        <span>ออเดอร์ในคิวของคุณ</span>
        <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">{jobs.length}</span>
      </h2>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500">ตอนนี้คุณยังไม่มีคิวงานครับ</p>
          <p className="text-sm text-gray-400 mt-1">รอแอดมินมอบหมายงานสักครู่นะ 🛵</p>
        </div>
      ) : (
        jobs.map((job) => {
          const order = job.order_details;
          const mainItemText = order?.mainItems?.[0] ? `${order.mainItems[0].name} x${order.mainItems[0].quantity}` : "ไม่พบรายการหลัก";
          
          // 🌟 เช็คว่าตอนนี้อยู่ในสถานะกำลังไปส่งหรือเปล่า
          const isShipping = job.order_details.status === "shipping";
          
          return (
            <div 
              key={job.order_id} 
              // 🌟 3. เปลี่ยนสีกราเดียนต์ของการ์ดตามสถานะ (Shipping = สีเขียว, Ready = สีส้ม)
              className={`rounded-2xl p-5 text-white shadow-lg relative overflow-hidden transition-all duration-300 ${
                isShipping 
                  ? "bg-linear-to-br from-emerald-500 to-green-600" 
                  : "bg-linear-to-br from-orange-500 to-red-600"
              }`}
            >
              <div className="absolute -top-4 -right-4 opacity-10 pointer-events-none">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C12 2 7 6.48 7 11.5C7 14.54 9.46 17 12.5 17C15.54 17 18 14.54 18 11.5C18 6.48 13 2 13 2H12ZM12.5 15C10.57 15 9 13.43 9 11.5C9 9.3 11.41 6.55 12.5 5.37C13.59 6.55 16 9.3 16 11.5C16 13.43 14.43 15 12.5 15Z"/>
                  <path d="M4 22H21V20H4V22Z"/>
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                    {/* เปลี่ยนป้ายบอกสถานะมุมซ้ายบน */}
                    {isShipping ? "กำลังไปส่ง 🚀" : "ออเดอร์เตรียมส่ง 🛵"} 
                    (คิวที่ {job.queue_number})
                  </span>
                  <span className="text-sm text-white/80">สั่งเมื่อ {formatTime(order?.created_at)} น.</span>
                </div>
                
                <h3 className="text-xl font-bold mb-1">{mainItemText}</h3>
                
                <p className="text-white/80 text-sm mb-4 flex items-center gap-1 flex-wrap">
                   <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                   <span>
                     เพิ่ม: เตา {order?.equipment?.stoveCount || 0}, 
                     กระทะ {order?.equipment?.panCount || 0}
                     {order?.addOnItems && order.addOnItems.length > 0 ? `, ${order.addOnItems.map((a: any) => a.name).join(", ")}` : ''}
                   </span>
                </p>

                <div className="bg-white/10 rounded-xl p-3 mb-5 border border-white/20">
                  <p className="text-xs text-white/90 mb-1 flex justify-between">
                    <span>📍 จัดส่งที่: {order?.shipping?.recipient} ({order?.shipping?.phone})</span>
                  </p>
                  <p className="font-medium text-sm leading-relaxed">{order?.shipping?.address}</p>
                  {order?.shipping?.note && (
                    <p className="text-xs mt-1 text-yellow-200">💡 จุดสังเกต: {order.shipping.note}</p>
                  )}
                </div>

                {/* 🌟 4. เปลี่ยนปุ่มกดตามสถานะ */}
                <button 
                  onClick={() => handleUpdateStatus(job.order_id, isShipping ? "delivered" : "shipping")}
                  className={`w-full bg-white font-bold py-3.5 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 ${
                    isShipping ? "text-green-600 hover:bg-green-50" : "text-red-600 hover:bg-orange-50"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  {isShipping ? "จัดส่งสำเร็จ ปิดงาน" : "รับของและเริ่มไปส่ง"}
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* สรุปยอดสำหรับไรเดอร์ประจำร้าน */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <p className="text-gray-500 text-xs font-medium">วิ่งไปแล้ววันนี้</p>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-1">0 <span className="text-sm font-normal text-gray-500">รอบ</span></p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p className="text-gray-500 text-xs font-medium">ค่ารอบสะสม</p>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">฿ 0</p>
        </div>
      </div>
      
      {/* กระดานเตือนใจจากเจ้าของร้าน */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl shadow-sm mb-6">
        <p className="text-sm font-bold text-yellow-800 mb-1 flex items-center gap-1">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
           ข้อควรระวัง!
        </p>
        <p className="text-xs text-yellow-700 leading-relaxed">ช่วงนี้ลูกค้าบ่นเรื่องลืมน้ำจิ้มซีฟู้ด รบกวนพี่ๆ ไรเดอร์เช็คของในถุงให้ครบก่อนออกรถทุกครั้งนะครับ และอย่าลืมถามเรื่องการเก็บเตาคืนด้วยครับ</p>
      </div>

    </div>
  );
}