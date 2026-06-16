export default function StoveSuccess() {
  // จำลองข้อมูลงานที่เก็บสำเร็จแล้ว (ใส่ข้อมูลจำลองไว้ดู UI ก่อน)
  const mockSuccessJobs = [
    {
      id: "ORD-003",
      recipient: "คุณจอห์น",
      address: "88/9 ซอยสุขุมวิท 55 (ทองหล่อ) วัฒนา กทม.",
      stoveCount: 3,
      panCount: 3,
      isComplete: true,
    },
    {
      id: "ORD-004",
      recipient: "คุณวิภา",
      address: "หมู่บ้านแสนสุข ซอย 2",
      stoveCount: 1,
      panCount: 1,
      isComplete: false,
      collectedStoves: 1,
      collectedPans: 0,
      reason: "กระทะไหม้จนแตก ลูกค้าขอชดใช้ค่าเสียหาย",
    }
  ];

  if (mockSuccessJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
        <span className="text-6xl mb-4 opacity-50">🫙</span>
        <p className="text-lg font-medium">ยังไม่มีรายการเก็บสำเร็จ</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mockSuccessJobs.map((job) => (
        <div
          key={job.id}
          className="bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          <div className="p-4 sm:p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-[15px]">
                  {job.recipient}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  #{job.id}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${job.isComplete ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'}`}>
                {job.isComplete ? "✅ เก็บครบ" : "⚠️ เก็บไม่ครบ"}
              </span>
            </div>

            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <span className="mt-0.5 text-red-400 shrink-0">📍</span>
              <span className="line-clamp-2 leading-relaxed">
                <span className="font-semibold mr-1">บ้านของคุณ:</span> 
                {job.address}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 rounded-xl p-3 flex flex-col items-center justify-center">
                <span className="text-xs text-orange-600/70 dark:text-orange-400/70 font-semibold mb-1">จำนวนเตา</span>
                <span className="text-xl font-black text-orange-600 dark:text-orange-400">{job.stoveCount}</span>
              </div>
              <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 rounded-xl p-3 flex flex-col items-center justify-center">
                <span className="text-xs text-orange-600/70 dark:text-orange-400/70 font-semibold mb-1">จำนวนกระทะ</span>
                <span className="text-xl font-black text-orange-600 dark:text-orange-400">{job.panCount}</span>
              </div>
            </div>

            {!job.isComplete && (
              <div className="mt-4 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800/30 text-xs text-red-600 dark:text-red-400">
                <p><span className="font-bold">เก็บได้จริง:</span> เตา {job.collectedStoves} / กระทะ {job.collectedPans}</p>
                <p className="mt-1"><span className="font-bold">เหตุผล:</span> {job.reason}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}