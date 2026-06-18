/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react"; // 🌟 1. นำเข้า useRef
import { getJobs, getJobSummary, updateOrderStatus } from "../api/api_jobs";
import { ref, onValue } from "firebase/database";
import { db } from "../../shared/const/firebase";
import { useNavigate } from "react-router-dom";

export default function JobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // 🌟 2. สร้าง Reference สำหรับชี้ไปที่จุดบนสุดของหน้า
  const topRef = useRef<HTMLDivElement>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    orderId: string;
    nextStatus: string;
  }>({
    isOpen: false,
    orderId: "",
    nextStatus: "",
  });

  const userDataString = localStorage.getItem("userData");
  const currentUser = userDataString ? JSON.parse(userDataString) : null;

  const [summary, setSummary] = useState({ total_rounds: 0, total_delivery_fee: 0 });

  useEffect(() => {
    if (!currentUser?.uid) {
      return;
    }

    let debounceTimer: ReturnType<typeof setTimeout>;
    const jobsRef = ref(db, `live_jobs/${currentUser.uid}`);

    const unsubscribe = onValue(jobsRef, () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        setRefreshKey((prev) => prev + 1);
      }, 500);
    });

    return () => {
      unsubscribe();
      clearTimeout(debounceTimer);
    };
  }, [currentUser?.uid]);

  useEffect(() => {
    let isMounted = true;

    const fetchActiveJobs = async () => {
      try {
        const data = await getJobs();
        if (isMounted) {
          const activeJobs = data.filter(
            (job: any) => job.status === "ready" || job.status === "shipping",
          );

          activeJobs.sort((a: any, b: any) => {
            if (a.status === "shipping" && b.status !== "shipping") return -1;
            if (a.status !== "shipping" && b.status === "shipping") return 1;
            return (
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
            );
          });

          setJobs(activeJobs);
        }
      } catch (error) {
        console.error("❌ Error fetching jobs:", error);
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

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    if (!currentUser?.uid) {
      alert("ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่");
      return;
    }

    try {
      await updateOrderStatus(orderId, nextStatus, currentUser.uid);

      if (nextStatus === "delivered") {
        setJobs((prevJobs) =>
          prevJobs.filter((job) => String(job.id) !== String(orderId)),
        );
      } else if (nextStatus === "shipping") {
        // 🌟 1. เปลี่ยนเป็นการ์ดสีเขียวก่อน (ยังไม่ย้ายตำแหน่ง)
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            String(job.id) === String(orderId)
              ? { ...job, status: "shipping" }
              : job,
          ),
        );

        // 🌟 2. หน่วงเวลา 0.5 วินาทีให้เห็นการ์ดสีเขียวชัดๆ แล้วค่อยดันขึ้นบนสุด
        setTimeout(() => {
          setJobs((prevJobs) => {
            const updatedJobs = [...prevJobs];
            return updatedJobs.sort((a: any, b: any) => {
              if (a.status === "shipping" && b.status !== "shipping") return -1;
              if (a.status !== "shipping" && b.status === "shipping") return 1;
              return (
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
              );
            });
          });

          // 🌟 3. สั่งสไลด์หน้าจอขึ้นไปบนสุด (ใช้ window.scrollTo จะทำงานได้ชัวร์กว่าบนมือถือ)
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }, 500); // 500 คือ 0.5 วินาที (ปรับเพิ่มลดความหน่วงได้ตามชอบ)
      }
    } catch (error: any) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchSummary = async () => {
      try {
        // หาค่าวันที่ปัจจุบันให้อยู่ในฟอร์แมต YYYY-MM-DD
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");
        const todayStr = `${year}-${month}-${day}`;

        // ส่ง userID และ วันที่ปัจจุบัน ไปดึงข้อมูล
        const data = await getJobSummary(currentUser.uid, todayStr);
        if (data) {
          setSummary({
            total_rounds: data.total_rounds || 0,
            total_delivery_fee: data.total_delivery_fee || 0,
          });
        }
      } catch (error) {
        console.error("❌ Error fetching job summary:", error);
      }
    };

    fetchSummary();
  }, [currentUser?.uid, refreshKey]);

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-4 shadow-sm"></div>
        <div className="text-gray-500 font-medium">กำลังโหลดคิวงาน...</div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4 animate-fade-in relative">
      {/* 🌟 4. ตัวจุดหมุด (Anchor) ล่องหน เอาไว้ให้จอเลื่อนขึ้นมาหา */}
      <div ref={topRef} className="absolute top-0 left-0 w-full h-px" />

      <div className="font-bold text-gray-800 text-lg flex items-center gap-2">
        <span>ออเดอร์ในคิวของคุณ</span>
        <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">
          {jobs.length}
        </span>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500">ตอนนี้คุณยังไม่มีคิวงานครับ</p>
          <p className="text-sm text-gray-400 mt-1">
            รอแอดมินมอบหมายงานสักครู่นะ 🛵
          </p>
        </div>
      ) : (
        jobs.map((order) => {
          const isShipping = order.status === "shipping";

          return (
            <div
              key={order.id}
              className={`rounded-2xl p-5 text-white shadow-lg relative overflow-hidden transition-all duration-300 ${
                isShipping
                  ? "bg-linear-to-br from-emerald-500 to-green-600"
                  : "bg-linear-to-br from-orange-500 to-red-600"
              }`}
            >
              {/* ... (เนื้อหาด้านในการ์ดออเดอร์คงเดิม ไม่ต้องแก้ไข) ... */}
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
                    สั่งเมื่อ {formatTime(order?.created_at)} น.
                  </span>
                  <button
                    onClick={() => navigate(`/job_detail/${order.id}`)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white p-1.5 rounded-full transition-all active:scale-95 flex items-center justify-center"
                  >
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

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
                    />
                  </svg>
                  <span>
                    เตา {order?.equipment?.stoveCount || 0}, กระทะ{" "}
                    {order?.equipment?.panCount || 0}
                  </span>
                </p>

                <div className="bg-black/20 rounded-xl p-4 mb-5 border border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-white text-base">
                        {order?.shipping?.recipient}
                      </p>
                      <p className="text-xs text-white/60 mb-2">
                        เบอร์โทร: {order?.shipping?.phone}
                      </p>
                      <span className="text-sm">📍</span>
                      <span className="text-xs font-medium text-white/70">
                        จัดส่งที่ {order?.shipping?.address}
                      </span>
                    </div>
                    <a
                      href={`tel:${order?.shipping?.phone}`}
                      className="shrink-0 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center mt-1"
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
                  </div>
                </div>

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
                        setConfirmModal({
                          isOpen: true,
                          orderId: order.id,
                          nextStatus: isShipping ? "delivered" : "shipping",
                        })
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
                />
              </svg>
            </div>
            <p className="text-gray-500 text-xs font-medium">
              วิ่งไปแล้ววันนี้
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {summary.total_rounds} <span className="text-sm font-normal text-gray-500">รอบ</span>
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
                />
              </svg>
            </div>
            <p className="text-gray-500 text-xs font-medium">ค่ารอบสะสม</p>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">฿ {summary.total_delivery_fee.toLocaleString()}</p>
        </div>
      </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-slide-up border border-gray-100">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                confirmModal.nextStatus === "shipping"
                  ? "bg-orange-100 text-orange-500"
                  : "bg-green-100 text-green-500"
              }`}
            >
              {confirmModal.nextStatus === "shipping" ? (
                <span className="text-3xl">🛵</span>
              ) : (
                <span className="text-3xl">🎉</span>
              )}
            </div>

            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
              {confirmModal.nextStatus === "shipping"
                ? "ยืนยันรับออเดอร์?"
                : "ยืนยันส่งมอบสำเร็จ?"}
            </h3>

            <p className="text-gray-500 text-sm text-center mb-6 leading-relaxed px-2">
              {confirmModal.nextStatus === "shipping"
                ? "ตรวจสอบรายการอาหารและอุปกรณ์ครบถ้วนแล้วใช่หรือไม่?"
                : "คุณได้ส่งมอบอาหารให้ลูกค้าและรับชำระเงิน (ถ้ามี) เรียบร้อยแล้วใช่หรือไม่?"}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setConfirmModal({
                    isOpen: false,
                    orderId: "",
                    nextStatus: "",
                  })
                }
                className="flex-1 py-3.5 font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(
                    confirmModal.orderId,
                    confirmModal.nextStatus,
                  );
                  setConfirmModal({
                    isOpen: false,
                    orderId: "",
                    nextStatus: "",
                  });
                }}
                className={`flex-1 py-3.5 font-bold text-white rounded-xl shadow-lg transition-colors ${
                  confirmModal.nextStatus === "shipping"
                    ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/30"
                    : "bg-green-500 hover:bg-green-600 shadow-green-500/30"
                }`}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
