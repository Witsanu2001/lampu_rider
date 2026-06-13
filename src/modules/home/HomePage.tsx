// src/modules/home/HomePage.tsx

export default function HomePage() {
  return (
    <div className="p-4 flex flex-col gap-5 animate-fade-in">
      
      {/* การ์ดสรุปรายได้วันนี้ */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-sm font-medium text-blue-100">รายได้วันนี้</h2>
          <span className="text-xs bg-blue-500/50 px-2 py-1 rounded-full">อัปเดตล่าสุด: 10:30 น.</span>
        </div>
        <div className="text-3xl font-bold mb-4">฿ 1,250.00</div>
        
        <div className="flex justify-between text-sm border-t border-blue-400/30 pt-4 mt-2">
          <div className="text-center w-full border-r border-blue-400/30">
            <p className="text-blue-100 text-xs mb-1">จำนวนงาน</p>
            <p className="font-semibold text-lg">15 งาน</p>
          </div>
          <div className="text-center w-full border-r border-blue-400/30">
            <p className="text-blue-100 text-xs mb-1">ชั่วโมงออนไลน์</p>
            <p className="font-semibold text-lg">6.5 ชม.</p>
          </div>
          <div className="text-center w-full">
            <p className="text-blue-100 text-xs mb-1">คะแนน</p>
            <p className="font-semibold text-lg text-yellow-300">4.9 ★</p>
          </div>
        </div>
      </div>

      {/* สถานะการรับงาน */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-4 relative">
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
          <svg className="w-12 h-12 text-green-500 relative z-10" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">กำลังค้นหางาน...</h3>
        <p className="text-sm text-gray-500 mt-2 mb-6">กรุณารอรับออเดอร์ในพื้นที่ที่มีความต้องการสูง</p>
        <button className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3.5 rounded-xl transition-colors border border-red-200">
          ออฟไลน์ (หยุดรับงาน)
        </button>
      </div>

      {/* กระดานประกาศ */}
      <div className="mt-1">
        <h3 className="font-bold text-gray-800 mb-3 px-1 text-sm">ประกาศด่วนจากระบบ</h3>
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <p className="text-sm text-orange-800 font-bold">โบนัสพิเศษช่วงฝนตก!</p>
              <p className="text-xs text-orange-700 mt-1 leading-relaxed">รับเพิ่ม 20 บาท/ออเดอร์ เมื่อรับงานในเขตปทุมวัน ตั้งแต่เวลา 17:00 - 20:00 น.</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}