/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getJobs, updateOrderStatus } from "../api/api_jobs";

// 🌟 1. นำเข้าคำสั่งใช้งาน Firebase Realtime Database
import { ref, onValue } from "firebase/database";
import { db } from "../../shared/const/firebase";
import { useNavigate } from "react-router-dom";

export default function JobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [refreshKey, setRefreshKey] = useState(0);
  const userDataString = localStorage.getItem("userData");
  const currentUser = userDataString ? JSON.parse(userDataString) : null;

  console.log("🚀 JobsPage rendering, currentUser:", currentUser);

  // 🌟 2. ตัวดักจับ (Listener) เมื่อแอดมินโยนงานมาให้ใหม่ (แบบ Realtime)
  useEffect(() => {
    if (!currentUser?.uid) {
      console.log("⚠️ No currentUser.uid, skipping Firebase listener");
      return;
    }

    console.log("📡 Setting up Firebase listener for:", currentUser.uid);
    let debounceTimer: ReturnType<typeof setTimeout>;
    // ชี้เป้าไปที่โหนดคิวงานของไรเดอร์คนนี้โดยเฉพาะ
    const jobsRef = ref(db, `live_jobs/${currentUser.uid}`);

    // ทันทีที่มีการเปลี่ยนแปลงในโหนดนี้ (แอดมินเพิ่มงาน, เปลี่ยนสถานะ) ฟังก์ชันนี้จะทำงาน
    const unsubscribe = onValue(jobsRef, () => {
      clearTimeout(debounceTimer);
      // หน่วงเวลาเล็กน้อย (500ms) ป้องกันการยิง API รัวๆ ในกรณีแอดมินจัดคิวหลายออเดอร์พร้อมกัน
      debounceTimer = setTimeout(() => {
        console.log("🔄 Refreshing jobs due to Firebase change");
        setRefreshKey((prev) => prev + 1); // 🎯 สั่งให้ useEffect ตัวล่างดึง API อัตโนมัติ
      }, 500);
    });

    return () => {
      unsubscribe(); // ยกเลิกการฟังเมื่อปิดหน้าต่าง ป้องกันเครื่องหน่วง
      clearTimeout(debounceTimer);
    };
  }, [currentUser?.uid]);

  // ฟังก์ชันดึงคิวงาน (จะถูกเรียกครั้งแรก และทุกครั้งที่ refreshKey เปลี่ยน)
  useEffect(() => {
    let isMounted = true;

    const fetchActiveJobs = async () => {
      console.log("📥 Fetching jobs...");
      // 🌟 นำ setLoading(true) ออกจากตรงนี้ เพื่อไม่ให้หน้าจอกระพริบขาวเวลาข้อมูลเข้าแบบเรียลไทม์
      try {
        const data = await getJobs();
        console.log("✅ Jobs fetched:", data);
        if (isMounted) {
          const activeJobs = data.filter(
            (job: any) => job.status === "ready" || job.status === "shipping",
          );

          activeJobs.sort(
            (a: any, b: any) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          );

          setJobs(activeJobs);
          console.log("🎯 Active jobs set:", activeJobs.length);
        }
      } catch (error) {
        console.error("❌ Error fetching jobs:", error);
      } finally {
        if (isMounted) {
          setLoading(false); // ปิดฉากโหลดหลังจากโหลดเสร็จครั้งแรก
          console.log("✅ Loading set to false");
        }
      }
    };

    fetchActiveJobs();

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  // ฟังก์ชันอัปเดตสถานะแบบไดนามิก
  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    if (!currentUser?.uid) {
      alert("ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่");
      return;
    }

    try {
      await updateOrderStatus(orderId, nextStatus, currentUser.uid);

      if (nextStatus === "shipping") {
        alert("รับออเดอร์แล้ว! ขับขี่ปลอดภัยครับ 🛵");
      } else if (nextStatus === "delivered") {
        alert("จัดส่งสำเร็จ! ปิดงานเรียบร้อย 🎉");
      }

      // ระบบจะรีเฟรชเองผ่าน onValue ด้านบนอยู่แล้ว แต่ใส่เผื่อไว้เป็น Fallback ได้ครับ
      // setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  // ฟังก์ชันจัดรูปแบบเวลา
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  console.log(
    "🎨 JobsPage render state - loading:",
    loading,
    "jobs:",
    jobs.length,
  );

  if (loading) {
    console.log("⏳ Showing loading state");
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-4 shadow-sm"></div>
        <div className="text-gray-500 font-medium">กำลังโหลดคิวงาน...</div>
      </div>
    );
  }

  console.log("✅ Showing jobs content");
  return (
    <div className="p-4 flex flex-col gap-4 animate-fade-in">
      <h2 className="font-bold text-gray-800 flex items-center gap-2">
        <span>ออเดอร์ในคิวของคุณ</span>
        <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">
          {jobs.length}
        </span>
      </h2>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500">ตอนนี้คุณยังไม่มีคิวงานครับ</p>
          <p className="text-sm text-gray-400 mt-1">
            รอแอดมินมอบหมายงานสักครู่นะ 🛵
          </p>
        </div>
      ) : (
        jobs.map((order, index) => {
          const isShipping = order.status === "shipping";

          return (
            <div
              key={order.id}
              onClick={() => navigate(`/job_detail/${order.id}`)}
              className={`rounded-2xl p-5 text-white shadow-lg relative overflow-hidden transition-all duration-300 ${
                isShipping
                  ? "bg-linear-to-br from-emerald-500 to-green-600"
                  : "bg-linear-to-br from-orange-500 to-red-600"
              }`}
            >
              {/* กราฟิกตกแต่ง */}
              <div className="absolute -top-4 -right-4 opacity-10 pointer-events-none">
                <svg
                  className="w-32 h-32"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C12 2 7 6.48 7 11.5C7 14.54 9.46 17 12.5 17C15.54 17 18 14.54 18 11.5C18 6.48 13 2 13 2H12ZM12.5 15C10.57 15 9 13.43 9 11.5C9 9.3 11.41 6.55 12.5 5.37C13.59 6.55 16 9.3 16 11.5C16 13.43 14.43 15 12.5 15Z" />
                  <path d="M4 22H21V20H4V22Z" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                    {isShipping ? "กำลังไปส่ง 🚀" : "ออเดอร์เตรียมส่ง 🛵"}
                    (คิวที่ {index + 1})
                  </span>
                  <span className="text-sm text-white/80">
                    สั่งเมื่อ {formatTime(order?.created_at)} น.
                  </span>
                </div>

                {/* แทนที่จะดึง [0] ให้วนลูปแทน */}
                <div className="flex flex-col gap-1">
                  {order?.mainItems && order.mainItems.length > 0 ? (
                    order.mainItems.map((item: any, idx: number) => (
                      <h3 key={idx} className="text-xl font-bold mb-1">
                        {item.name} x{item.quantity}
                      </h3>
                    ))
                  ) : (
                    <h3 className="text-xl font-bold mb-1">ไม่พบรายการหลัก</h3>
                  )}
                </div>

                <p className="text-white/80 text-sm mb-4 flex items-center gap-1 flex-wrap">
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    ></path>
                  </svg>
                  <span>
                    เตา {order?.equipment?.stoveCount || 0}, กระทะ{" "}
                    {order?.equipment?.panCount || 0}
                  </span>
                </p>

                <div className="bg-black/20 rounded-xl p-3 mb-5 border border-white/10 relative">
                  <a
                    href={`tel:${order?.shipping?.phone}`}
                    className="absolute top-2 right-2 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow-lg transition-all active:scale-90"
                    title="โทรหาลูกค้า"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </a>

                  <p className="text-xs text-white/90 mb-1 flex justify-between pr-8">
                    <span>
                      📍 จัดส่งที่: {order?.shipping?.recipient} (
                      {order?.shipping?.phone})
                    </span>
                  </p>

                  <p className="font-medium text-sm leading-relaxed pr-8">
                    {order?.shipping?.address}
                  </p>

                  {order?.shipping?.note && (
                    <p className="text-xs mt-1 text-yellow-200">
                      💡 จุดสังเกต: {order.shipping.note}
                    </p>
                  )}
                </div>

                {/* 🌟 ปุ่มกดต่างๆ ในการ์ดออเดอร์ */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-2">
                    <button
                      onClick={() => {
                        const lat = order?.shipping?.location?.lat;
                        const lng = order?.shipping?.location?.lng;
                        if (lat && lng) {
                          window.open(
                            `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
                            "_blank",
                          );
                        } else {
                          alert(
                            "ไม่พบข้อมูลพิกัดละติจูด/ลองจิจูด ของออเดอร์นี้",
                          );
                        }
                      }}
                      className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 text-white font-bold py-3.5 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      นำทาง
                    </button>

                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          order.id,
                          isShipping ? "delivered" : "shipping",
                        )
                      }
                      className={`w-full bg-white font-bold py-3.5 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 ${
                        isShipping
                          ? "text-green-600 hover:bg-green-50"
                          : "text-orange-600 hover:bg-orange-50"
                      }`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {isShipping ? "ส่งสำเร็จ ปิดงาน" : "รับและไปส่ง"}
                    </button>
                  </div>
                </div>
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
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <p className="text-gray-500 text-xs font-medium">
              วิ่งไปแล้ววันนี้
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            0 <span className="text-sm font-normal text-gray-500">รอบ</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <p className="text-gray-500 text-xs font-medium">ค่ารอบสะสม</p>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">฿ 0</p>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl shadow-sm mb-6">
        <p className="text-sm font-bold text-yellow-800 mb-1 flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
          ข้อควรระวัง!
        </p>
        <p className="text-xs text-yellow-700 leading-relaxed">
          ช่วงนี้ลูกค้าบ่นเรื่องลืมน้ำจิ้มซีฟู้ด รบกวนพี่ๆ
          ไรเดอร์เช็คของในถุงให้ครบก่อนออกรถทุกครั้งนะครับ
          และอย่าลืมถามเรื่องการเก็บเตาคืนด้วยครับ
        </p>
      </div>
    </div>
  );
}
