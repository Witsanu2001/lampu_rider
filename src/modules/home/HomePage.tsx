// src/modules/home/HomePage.tsx

export default function HomePage() {
  return (
    <div className="p-4 flex flex-col gap-4 animate-fade-in">
      
      {/* ส่วนหัว: แจ้งสถานะคิวของไรเดอร์ */}
      {/* <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">สถานะของคุณ</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
            <p className="text-sm text-orange-600 font-semibold">คิวที่ 2 • รออาหารจากครัว</p>
          </div>
        </div>
        <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-200">
          <span className="text-2xl font-black text-orange-600">#2</span>
        </div>
      </div> */}

      {/* การ์ดออเดอร์ที่กำลังเตรียมไปส่ง (เน้นสีสันสะดุดตา) */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        {/* ไอคอนตกแต่งพื้นหลัง */}
        <div className="absolute -top-4 -right-4 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C12 2 7 6.48 7 11.5C7 14.54 9.46 17 12.5 17C15.54 17 18 14.54 18 11.5C18 6.48 13 2 13 2H12ZM12.5 15C10.57 15 9 13.43 9 11.5C9 9.3 11.41 6.55 12.5 5.37C13.59 6.55 16 9.3 16 11.5C16 13.43 14.43 15 12.5 15Z"/>
            <path d="M4 22H21V20H4V22Z"/>
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
            <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              ออเดอร์เตรียมส่ง 🛵
            </span>
            <span className="text-sm text-orange-100">สั่งเมื่อ 18:30 น.</span>
          </div>
          
          <h3 className="text-2xl font-bold mb-1">ชุดครอบครัว (ใหญ่) x1</h3>
          <p className="text-orange-100 text-sm mb-4 flex items-center gap-1">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
             เพิ่ม: เตา 1, ถ่าน 1 ถุง, แป๊ปซี่ 1.5L
          </p>

          <div className="bg-white/10 rounded-xl p-3 mb-5 border border-white/20">
            <p className="text-xs text-orange-200 mb-1">จัดส่งที่:</p>
            <p className="font-medium text-sm leading-relaxed">หมู่บ้านสุขสันต์ ซอย 5 บ้านประตูสีฟ้า (ห่างไป 3.2 กม.)</p>
          </div>

          <button className="w-full bg-white text-red-600 font-bold py-3.5 rounded-xl shadow-md hover:bg-orange-50 transition-colors flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            รับของและเริ่มไปส่ง
          </button>
        </div>
      </div>

      {/* สรุปยอดสำหรับไรเดอร์ประจำร้าน */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <p className="text-gray-500 text-xs font-medium">วิ่งไปแล้ววันนี้</p>
          </div>
          <p className="text-2xl font-bold text-gray-800 mt-1">12 <span className="text-sm font-normal text-gray-500">รอบ</span></p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p className="text-gray-500 text-xs font-medium">ค่ารอบสะสม</p>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">฿ 360</p>
        </div>
      </div>
      
      {/* กระดานเตือนใจจากเจ้าของร้าน */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl shadow-sm mt-1 mb-6">
        <p className="text-sm font-bold text-yellow-800 mb-1 flex items-center gap-1">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
           ข้อควรระวัง!
        </p>
        <p className="text-xs text-yellow-700 leading-relaxed">ช่วงนี้ลูกค้าบ่นเรื่องลืมน้ำจิ้มซีฟู้ด รบกวนพี่ๆ ไรเดอร์เช็คของในถุงให้ครบก่อนออกรถทุกครั้งนะครับ และอย่าลืมถามเรื่องการเก็บเตาคืนด้วยครับ</p>
      </div>

    </div>
  );
}