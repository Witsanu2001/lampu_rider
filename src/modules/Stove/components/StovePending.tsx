/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { getStove, updateStoveStatus } from "../../api/api_stoves";

export default function StovePending() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 🌟 กุญแจล็อก ป้องกันการเรียก API รัวๆ ซ้อนกัน
  const fetchingRef = useRef(false);
  // 🌟 เก็บรายการปัจจุบันไว้เช็คข้อมูลซ้ำ ป้องกันบั๊กสกอร์บาร์ค้างล่างสุด
  const jobsRef = useRef<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [collectionType, setCollectionType] = useState<"complete" | "incomplete">("complete");
  const [collectedStoves, setCollectedStoves] = useState<number>(0);
  const [collectedPans, setCollectedPans] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. ดึงข้อมูล (โหลดหน้า 1 และหน้าถัดไป)
  useEffect(() => {
    let isMounted = true;

    const fetchStoveData = async () => {
      if (page === 1) setLoading(true);
      else setIsLoadingMore(true);

      try {
        const response = await getStove(page, limit);
        const data = response?.items || response || [];

        if (isMounted) {
          if (page === 1) {
            setJobs(data);
            jobsRef.current = data;
            setHasMore(data.length >= limit);
          } else {
            // กรองข้อมูลซ้ำ
            const existingIds = new Set(jobsRef.current.map((job) => job.order_id));
            const uniqueData = data.filter((job: any) => !existingIds.has(job.order_id));

            // ✅ ป้องกันบั๊ก Infinite Loop: ถ้า Backend ส่งข้อมูลชุดเดิมมาซ้ำๆ ให้หยุดเรียกทันที!
            if (uniqueData.length === 0) {
              setHasMore(false);
            } else {
              const updatedJobs = [...jobsRef.current, ...uniqueData];
              setJobs(updatedJobs);
              jobsRef.current = updatedJobs;
              setHasMore(data.length >= limit);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching stove jobs:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsLoadingMore(false);
          // 🔓 ปลดล็อกกุญแจเมื่อโหลดเสร็จ ให้พร้อมโหลดหน้าต่อไป
          setTimeout(() => {
            fetchingRef.current = false;
          }, 300); // ดีเลย์ไว้นิดนึงกันเหนียวเวลานิ้วกระตุก
        }
      }
    };

    fetchStoveData();

    return () => {
      isMounted = false;
    };
  }, [page, limit]);

  // 🌟 2. ดัก Scroll แบบครอบจักรวาล (จบปัญหาเรื่องตัวแม่แย่ง Scroll)
  useEffect(() => {
    const handleGlobalScroll = (e: Event) => {
      const target = e.target as HTMLElement;

      // คัดกรองให้ดักจับเฉพาะกล่องที่มีการ Scroll จริงๆ เท่านั้น
      if (!target || !target.scrollHeight) return;
      
      if (target.scrollHeight > target.clientHeight) {
        const { scrollTop, scrollHeight, clientHeight } = target;
        
        // เผื่อระยะ 100px ก่อนถึงล่างสุด
        if (scrollHeight - Math.ceil(scrollTop) <= clientHeight + 100) {
          // ✅ เช็คว่ามีของให้โหลดต่อ และ "ไม่ได้ติดล็อกอยู่"
          if (hasMore && !fetchingRef.current && !loading) {
            fetchingRef.current = true; // 🔒 ล็อกกุญแจทันที! ป้องกัน Event ยิงรัว
            setIsLoadingMore(true); 
            setPage((prev) => prev + 1);
          }
        }
      }
    };

    // ติดตั้ง Event แบบดักจับทุก Element ในหน้าจอ
    window.addEventListener("scroll", handleGlobalScroll, true);
    return () => window.removeEventListener("scroll", handleGlobalScroll, true);
  }, [hasMore, loading]); // อัปเดตผูก Event ใหม่เมื่อมีของให้โหลดต่อ

  const openModal = (job: any) => {
    setSelectedJob(job);
    setCollectionType("complete");
    setCollectedStoves(job.equipment?.stoveCount || 0);
    setCollectedPans(job.equipment?.panCount || 0);
    setReason("");
    setIsModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    if (!selectedJob) return;

    setIsSubmitting(true);

    try {
      const payload = {
        order_id: selectedJob.order_id,
        is_complete: collectionType === "complete",
        collected_stoves:
          collectionType === "complete"
            ? selectedJob.equipment?.stoveCount || 0
            : collectedStoves,
        collected_pans:
          collectionType === "complete"
            ? selectedJob.equipment?.panCount || 0
            : collectedPans,
        reason: collectionType === "complete" ? "" : reason,
      };

      await updateStoveStatus(payload);

      setJobs((prev) => {
        const newJobs = prev.filter((job) => job.order_id !== selectedJob.order_id);
        jobsRef.current = newJobs; // อัปเดต ref ด้วย
        return newJobs;
      });
      
      setIsModalOpen(false);
      alert(
        `อัปเดตสถานะเก็บเตาออเดอร์ #${selectedJob.order_id.slice(-6)} สำเร็จ!`
      );
    } catch (error: any) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStoveFalseSuccess = async (orderId: string) => {
    const isConfirmed = window.confirm(
      "ยืนยันว่าเก็บอุปกรณ์ส่วนที่เหลือครบแล้ว และต้องการปิดงานนี้ใช่หรือไม่?"
    );
    if (!isConfirmed) return;

    setIsSubmitting(true);
    try {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("firebase_token") ||
        "";
      const userDataString = localStorage.getItem("userData");
      const currentUser = userDataString
        ? JSON.parse(userDataString)
        : { uid: "admin" };
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

      const response = await fetch(
        `${apiUrl}/api/orders/orders_put/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: currentUser.uid,
            status: "success",
          }),
        }
      );

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to update order");
      }

      setJobs((prev) => {
        const newJobs = prev.filter((job) => job.order_id !== orderId);
        jobsRef.current = newJobs; // อัปเดต ref ด้วย
        return newJobs;
      });
      
      alert(`ปิดงานออเดอร์ #${orderId.slice(-6)} ที่เคยค้างไว้สำเร็จ! 🎉`);
    } catch (error: any) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden animate-fade-in transition-colors duration-300">
      
      {/* 🌟 ลบ onScroll ออกจากกล่องนี้ เพราะเราย้ายไปดักที่ Global ด้านบนแล้ว */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
        
        {loading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500 font-medium animate-pulse">
              กำลังโหลดงานเก็บเตา...
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-6xl mb-4 opacity-50">♨️</span>
            <p className="text-lg font-medium">ไม่มีงานรอเก็บเตาในขณะนี้</p>
          </div>
        ) : (
          jobs.map((job) => {
            const isStoveFalse = job.status === "stoveFalse";

            return (
              <div
                key={job.order_id}
                className={`rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 ${
                  isStoveFalse
                    ? "bg-red-50/30 dark:bg-red-900/10 border-red-200 dark:border-red-800/50"
                    : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700"
                }`}
              >
                <div className="p-4 sm:p-5">
                  {isStoveFalse && (
                    <div className="mb-3 px-3 py-2 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors">
                      <span className="text-base">⚠️</span>{" "}
                      ออเดอร์นี้เคยแจ้งว่าเก็บไม่ครบ กรุณาตามเก็บส่วนที่เหลือ
                    </div>
                  )}

                  <div
                    className={`flex items-start gap-2 text-sm mb-4 p-3 rounded-xl border transition-colors ${
                      isStoveFalse
                        ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50 text-red-800 dark:text-red-300"
                        : "bg-gray-50 dark:bg-gray-700/50 border-gray-100 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <span className="line-clamp-2 leading-relaxed">
                      <span className="font-bold text-gray-800 dark:text-gray-100">
                        คุณ {job.shipping?.recipient || "ไม่ระบุชื่อ"}
                      </span>
                      <br />
                      <span className="text-xs opacity-80">
                        ที่อยู่: {job.shipping?.address || "ไม่ระบุที่อยู่"}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div
                      className={`border rounded-xl p-3 flex flex-col items-center justify-center transition-colors ${
                        isStoveFalse
                          ? "bg-red-100/50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
                          : "bg-orange-50/50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20"
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold mb-1 ${
                          isStoveFalse
                            ? "text-red-600/70 dark:text-red-400/80"
                            : "text-orange-600/70 dark:text-orange-400/80"
                        }`}
                      >
                        จำนวนเตา
                      </span>
                      <span
                        className={`text-xl font-black ${
                          isStoveFalse
                            ? "text-red-600 dark:text-red-400"
                            : "text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        {job.equipment?.stoveCount || 0}
                      </span>
                    </div>
                    <div
                      className={`border rounded-xl p-3 flex flex-col items-center justify-center transition-colors ${
                        isStoveFalse
                          ? "bg-red-100/50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
                          : "bg-orange-50/50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20"
                      }`}
                    >
                      <span
                        className={`text-xs font-semibold mb-1 ${
                          isStoveFalse
                            ? "text-red-600/70 dark:text-red-400/80"
                            : "text-orange-600/70 dark:text-orange-400/80"
                        }`}
                      >
                        จำนวนกระทะ
                      </span>
                      <span
                        className={`text-xl font-black ${
                          isStoveFalse
                            ? "text-red-600 dark:text-red-400"
                            : "text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        {job.equipment?.panCount || 0}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      isStoveFalse
                        ? handleStoveFalseSuccess(job.order_id)
                        : openModal(job)
                    }
                    disabled={isSubmitting}
                    className={`w-full py-3 mt-2 rounded-xl font-bold text-[14px] shadow-sm transition-all flex items-center justify-center gap-2 text-white active:scale-[0.98] disabled:opacity-50 ${
                      isStoveFalse
                        ? "bg-red-500 hover:bg-red-600 shadow-red-500/30 dark:shadow-red-900/30"
                        : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 dark:shadow-emerald-900/30"
                    }`}
                  >
                    {isStoveFalse
                      ? "ยืนยันปิดงาน (ตามเก็บครบแล้ว)"
                      : "ยืนยันเก็บเตา"}
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* 🌟 แสดงตัวโหลดด้านล่างสุด */}
        {isLoadingMore && hasMore && (
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-orange-500 rounded-full animate-spin shadow-sm"></div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-3 animate-pulse">
              กำลังโหลดเพิ่มเติม...
            </p>
          </div>
        )}
      </div>

      {/* 🌟 Modal บันทึกสถานะเก็บเตา */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black mb-1 text-gray-900 dark:text-white">
              สถานะการเก็บอุปกรณ์
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              ออเดอร์: {selectedJob.shipping?.recipient}
            </p>
            <div className="space-y-3 mb-5">
              <label
                className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                  collectionType === "complete"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <input
                  type="radio"
                  value="complete"
                  checked={collectionType === "complete"}
                  onChange={() => setCollectionType("complete")}
                  className="w-5 h-5 text-emerald-600 dark:text-emerald-500 border-gray-300 dark:border-gray-600"
                />
                <span className="ml-3 font-bold text-gray-800 dark:text-gray-200">
                  ✅ เก็บครบทุกชิ้น
                </span>
              </label>

              <label
                className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                  collectionType === "incomplete"
                    ? "border-red-500 bg-red-50 dark:bg-red-500/20 shadow-sm"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <input
                  type="radio"
                  value="incomplete"
                  checked={collectionType === "incomplete"}
                  onChange={() => setCollectionType("incomplete")}
                  className="w-5 h-5 text-red-600 dark:text-red-500 border-gray-300 dark:border-gray-600"
                />
                <span className="ml-3 font-bold text-gray-800 dark:text-gray-200">
                  ⚠️ เก็บไม่ครบ / สูญหาย
                </span>
              </label>
            </div>

            {collectionType === "incomplete" && (
              <div className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      เตาที่เก็บได้ (จาก {selectedJob.equipment?.stoveCount || 0})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedJob.equipment?.stoveCount || 0}
                      value={collectedStoves}
                      onChange={(e) =>
                        setCollectedStoves(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                      กระทะ (จาก {selectedJob.equipment?.panCount || 0})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedJob.equipment?.panCount || 0}
                      value={collectedPans}
                      onChange={(e) => setCollectedPans(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">
                    ระบุเหตุผลที่เก็บไม่ครบ
                  </label>
                  <textarea
                    rows={2}
                    placeholder="เช่น ลูกค้าทำหาย, กระทะแตก..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 resize-none text-sm placeholder-gray-400 dark:placeholder-gray-500"
                  ></textarea>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="flex-1 py-3 text-gray-600 dark:text-gray-300 font-bold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleConfirmSubmit}
                disabled={
                  isSubmitting ||
                  (collectionType === "incomplete" && !reason.trim())
                }
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white dark:disabled:text-gray-500 font-bold rounded-xl shadow-sm transition-all flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white dark:border-t-white/80 rounded-full animate-spin"></div>
                    กำลังบันทึก...
                  </>
                ) : (
                  "บันทึกสถานะ"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}