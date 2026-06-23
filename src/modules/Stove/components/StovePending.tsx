/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getStove, updateStoveStatus } from "../../api/api_stoves";

export default function StovePending() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [collectionType, setCollectionType] = useState<"complete" | "incomplete">("complete");
  const [collectedStoves, setCollectedStoves] = useState<number>(0);
  const [collectedPans, setCollectedPans] = useState<number>(0);
  const [reason, setReason] = useState("");
  
  // State ป้องกันการกดเบิ้ลตอนกำลังโหลด
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ดึงข้อมูลงานเก็บเตาจาก API
  useEffect(() => {
    let isMounted = true;
    const fetchJobs = async () => {
      try {
        const data = await getStove();
        if (isMounted) setJobs(data || []);
      } catch (error) {
        console.error("Error fetching stove jobs:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchJobs();
    return () => { isMounted = false; };
  }, []);

  // เปิด Modal (สำหรับสถานะ pending ปกติ)
  const openModal = (job: any) => {
    setSelectedJob(job);
    setCollectionType("complete");
    setCollectedStoves(job.equipment?.stoveCount || 0);
    setCollectedPans(job.equipment?.panCount || 0);
    setReason("");
    setIsModalOpen(true);
  };

  // 🌟 [1] ฟังก์ชันยืนยันสำหรับรายการปกติ (Pending)
  const handleConfirmSubmit = async () => {
    if (!selectedJob) return;

    setIsSubmitting(true);

    try {
      const payload = {
        order_id: selectedJob.order_id,
        is_complete: collectionType === "complete",
        collected_stoves: collectionType === "complete" ? (selectedJob.equipment?.stoveCount || 0) : collectedStoves,
        collected_pans: collectionType === "complete" ? (selectedJob.equipment?.panCount || 0) : collectedPans,
        reason: collectionType === "complete" ? "" : reason,
      };

      await updateStoveStatus(payload);

      setJobs((prev) => prev.filter((job) => job.order_id !== selectedJob.order_id));
      setIsModalOpen(false);
      alert(`อัปเดตสถานะเก็บเตาออเดอร์ #${selectedJob.order_id.slice(-6)} สำเร็จ!`);

    } catch (error: any) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🌟 [2] ฟังก์ชันยืนยันสำหรับรายการ StoveFalse (ยิง API PUT Success โดยตรง)
  const handleStoveFalseSuccess = async (orderId: string) => {
    const isConfirmed = window.confirm("ยืนยันว่าเก็บอุปกรณ์ส่วนที่เหลือครบแล้ว และต้องการปิดงานนี้ใช่หรือไม่?");
    if (!isConfirmed) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("firebase_token") || "";
      const userDataString = localStorage.getItem("userData");
      const currentUser = userDataString ? JSON.parse(userDataString) : { uid: "admin" };
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

      const response = await fetch(`${apiUrl}/api/orders/orders_put/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        // ส่ง user_id ไปด้วยเผื่อ Backend ต้องการใช้เช็กว่าใครเป็นคนปิดงาน
        body: JSON.stringify({ 
            user_id: currentUser.uid,
            status: "success"
        }) 
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to update order");
      }

      setJobs((prev) => prev.filter((job) => job.order_id !== orderId));
      alert(`ปิดงานออเดอร์ #${orderId.slice(-6)} ที่เคยค้างไว้สำเร็จ! 🎉`);
    } catch (error: any) {
      alert(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mb-3"></div>
        <p className="text-gray-500 font-medium animate-pulse">กำลังโหลดงานเก็บเตา...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <span className="text-6xl mb-4 opacity-50">♨️</span>
        <p className="text-lg font-medium">ไม่มีงานรอเก็บเตาในขณะนี้</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        // 🌟 ตรวจสอบว่าใช่งานที่เคยเก็บไม่ครบหรือไม่
        const isStoveFalse = job.status === "stoveFalse";

        return (
          <div
            key={job.order_id}
            // 🌟 ปรับสีการ์ดเป็นสีแดง ถ้าเป็น stoveFalse
            className={`rounded-2xl border shadow-sm overflow-hidden transition-all ${
              isStoveFalse 
                ? "bg-red-50/30 border-red-200" 
                : "bg-white border-gray-100"
            }`}
          >
            <div className="p-4 sm:p-5">

              {/* ป้ายเตือนกรณีเคยเก็บไม่ครบ */}
              {isStoveFalse && (
                <div className="mb-3 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center gap-2">
                  <span className="text-base">⚠️</span> ออเดอร์นี้เคยแจ้งว่าเก็บไม่ครบ กรุณาตามเก็บส่วนที่เหลือ
                </div>
              )}

              <div className={`flex items-start gap-2 text-sm mb-4 p-3 rounded-xl border ${
                isStoveFalse 
                  ? "bg-red-50 border-red-100 text-red-800" 
                  : "bg-gray-50 border-gray-100 text-gray-600"
              }`}>
                <span className="line-clamp-2 leading-relaxed">
                  <span className="font-bold text-gray-800">คุณ {job.shipping?.recipient || "ไม่ระบุชื่อ"}</span><br/>
                  <span className="text-xs opacity-80">ที่อยู่: {job.shipping?.address || "ไม่ระบุที่อยู่"}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className={`border rounded-xl p-3 flex flex-col items-center justify-center ${
                  isStoveFalse ? "bg-red-100/50 border-red-200" : "bg-orange-50/50 border-orange-100"
                }`}>
                  <span className={`text-xs font-semibold mb-1 ${isStoveFalse ? "text-red-600/70" : "text-orange-600/70"}`}>จำนวนเตา</span>
                  <span className={`text-xl font-black ${isStoveFalse ? "text-red-600" : "text-orange-600"}`}>{job.equipment?.stoveCount || 0}</span>
                </div>
                <div className={`border rounded-xl p-3 flex flex-col items-center justify-center ${
                  isStoveFalse ? "bg-red-100/50 border-red-200" : "bg-orange-50/50 border-orange-100"
                }`}>
                  <span className={`text-xs font-semibold mb-1 ${isStoveFalse ? "text-red-600/70" : "text-orange-600/70"}`}>จำนวนกระทะ</span>
                  <span className={`text-xl font-black ${isStoveFalse ? "text-red-600" : "text-orange-600"}`}>{job.equipment?.panCount || 0}</span>
                </div>
              </div>

              {/* 🌟 เปลี่ยนปุ่มและฟังก์ชันตามสถานะ */}
              <button
                onClick={() => isStoveFalse ? handleStoveFalseSuccess(job.order_id) : openModal(job)}
                disabled={isSubmitting}
                className={`w-full py-3 mt-2 rounded-xl font-bold text-[14px] shadow-sm transition-all flex items-center justify-center gap-2 text-white active:scale-[0.98] disabled:opacity-50 ${
                  isStoveFalse 
                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/30" 
                    : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30"
                }`}
              >
                {isStoveFalse ? "ยืนยันปิดงาน (ตามเก็บครบแล้ว)" : "ยืนยันเก็บเตา"}
              </button>
            </div>
          </div>
        );
      })}

      {/* 🌟 Modal Popup (ใช้สำหรับงาน Pending ปกติเท่านั้น) */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black mb-1 text-gray-900">สถานะการเก็บอุปกรณ์</h2>
            <p className="text-sm text-gray-500 mb-5">
              ออเดอร์: {selectedJob.shipping?.recipient}
            </p>

            <div className="space-y-3 mb-5">
              <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${collectionType === "complete" ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-gray-200 hover:bg-gray-50"}`}>
                <input type="radio" value="complete" checked={collectionType === "complete"} onChange={() => setCollectionType("complete")} className="w-5 h-5 text-emerald-600" />
                <span className="ml-3 font-bold text-gray-800">✅ เก็บครบทุกชิ้น</span>
              </label>

              <label className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${collectionType === "incomplete" ? "border-red-500 bg-red-50 shadow-sm" : "border-gray-200 hover:bg-gray-50"}`}>
                <input type="radio" value="incomplete" checked={collectionType === "incomplete"} onChange={() => setCollectionType("incomplete")} className="w-5 h-5 text-red-600" />
                <span className="ml-3 font-bold text-gray-800">⚠️ เก็บไม่ครบ / สูญหาย</span>
              </label>
            </div>

            {collectionType === "incomplete" && (
              <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">เตาที่เก็บได้ (จาก {selectedJob.equipment?.stoveCount || 0})</label>
                    <input type="number" min="0" max={selectedJob.equipment?.stoveCount || 0} value={collectedStoves} onChange={(e) => setCollectedStoves(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">กระทะ (จาก {selectedJob.equipment?.panCount || 0})</label>
                    <input type="number" min="0" max={selectedJob.equipment?.panCount || 0} value={collectedPans} onChange={(e) => setCollectedPans(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">ระบุเหตุผลที่เก็บไม่ครบ</label>
                  <textarea rows={2} placeholder="เช่น ลูกค้าทำหาย, กระทะแตก..." value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm"></textarea>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => setIsModalOpen(false)} 
                disabled={isSubmitting}
                className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              
              <button 
                onClick={handleConfirmSubmit} 
                disabled={isSubmitting || (collectionType === "incomplete" && !reason.trim())} 
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-sm transition-all flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
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