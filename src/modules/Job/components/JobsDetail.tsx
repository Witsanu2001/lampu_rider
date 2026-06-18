/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/order/OrderDetail.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobsById } from "../../api/api_jobs";

export default function JobsDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("Order ID not found");
        setLoading(false);
        return;
      }

      try {
        const data = await getJobsById(orderId);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "Failed to load order details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="h-full p-6 w-full overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="h-full p-6 w-full overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <p className="text-red-500">{error || "Order not found"}</p>
          <button
            onClick={() => navigate("/orders")}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            กลับไปหน้ารายการออเดอร์
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 w-full overflow-y-auto bg-gray-50 text-gray-800 relative">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/orders_user")}
          className="flex items-center text-sm text-gray-600 hover:text-orange-600 mb-3"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          กลับไปหน้ารายการออเดอร์
        </button>
        {/* 🌟 เปลี่ยน h1 เป็น div */}
        <div className="text-xl font-bold text-gray-800">รายละเอียดออเดอร์</div>
        <p className="text-sm text-gray-500 mt-1">
          เลขที่ออเดอร์: {order.id}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatDate(order.created_at)}
        </p>
      </div>

      <div className="space-y-4">
        {/* Main Items */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          {/* 🌟 เปลี่ยน h2 เป็น div */}
          <div className="font-semibold mb-3 text-orange-600">
            รายการหลัก
          </div>
          <div className="space-y-2">
            {order?.mainItems?.map((item: any, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    ฿{item.price?.toLocaleString()} x {item.quantity}
                  </p>
                </div>
                <span className="font-bold text-gray-800">
                  ฿{item.subtotal?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Add-on Items */}
        {order.addOnItems?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            {/* 🌟 เปลี่ยน h2 เป็น div */}
            <div className="font-semibold mb-3 text-orange-600">
              รายการเพิ่มเติม
            </div>
            <div className="space-y-2">
              {order.addOnItems.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      ฿{item.price?.toLocaleString()} x {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-gray-800">
                    ฿{item.subtotal?.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          {/* 🌟 เปลี่ยน h2 เป็น div */}
          <div className="font-semibold mb-3 text-orange-600">
            อุปกรณ์
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">เตา:</span>
              <span className="text-gray-800">{order.equipment?.stoveCount} ชุด</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">กระทะ:</span>
              <span className="text-gray-800">{order.equipment?.panCount} ใบ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ถ่าน:</span>
              <span className="text-gray-800">{order.equipment?.charcoalCount} ก้อน</span>
            </div>
            {order.equipment?.extraStoves > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  เตาเพิ่ม:
                </span>
                <span className="text-gray-800">{order.equipment.extraStoves} ชุด</span>
              </div>
            )}
            {order.equipment?.extraPans > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  กระทะเพิ่ม:
                </span>
                <span className="text-gray-800">{order.equipment.extraPans} ใบ</span>
              </div>
            )}
          </div>
        </div>

        {/* 🌟 Shipping */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            {/* 🌟 เปลี่ยน h2 เป็น div */}
            <div className="font-semibold text-orange-600 flex items-center gap-2">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              ที่อยู่จัดส่ง
            </div>

            <button
              onClick={() => {
                const lat = order.shipping?.location?.lat;
                const lng = order.shipping?.location?.lng;
                if (lat && lng) {
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
                    "_blank",
                  );
                } else {
                  alert("ไม่พบข้อมูลพิกัดในออเดอร์นี้");
                }
              }}
              className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-medium hover:bg-orange-200 transition-colors flex items-center gap-1"
            >
              เปิดแผนที่
            </button>
          </div>

          <p className="text-sm text-gray-800">{order.shipping?.address}</p>

          <div className="mt-2 text-xs text-gray-500">
            <p>ค่าส่ง: ฿{order.shipping?.totalFee?.toLocaleString()}</p>
          </div>
        </div>

        {/* Home Image */}
        {order.home_image_url && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            {/* 🌟 เปลี่ยน h2 เป็น div */}
            <div className="font-semibold mb-3 text-orange-600">
              รูปบ้านลูกค้า
            </div>
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-2 flex justify-center">
              <img
                src={order.home_image_url}
                alt="Home Image"
                className="w-full max-h-80 object-contain rounded"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          {/* 🌟 เปลี่ยน h2 เป็น div */}
          <div className="font-semibold mb-3 text-orange-600">
            สรุปยอดชำระ
          </div>
          <div className="space-y-2 text-sm text-gray-800">
            <div className="flex justify-between">
              <span className="text-gray-600">
                ยอดรายการหลัก:
              </span>
              <span>฿{order.totals?.cartTotal?.toLocaleString()}</span>
            </div>
            {order.totals?.addOnTotal > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  ยอดรายการเพิ่มเติม:
                </span>
                <span>฿{order.totals.addOnTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">ค่าส่ง:</span>
              <span>฿{order.totals?.shippingFee?.toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">วิธีชำระเงิน:</span>
              <span>
                {order.payment?.method === "promptpay"
                  ? "พร้อมเพย์"
                  : order.payment?.method}
              </span>
            </div>

            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-bold">ยอดรวมทั้งหมด:</span>
              <span className="font-bold text-lg text-orange-600">
                ฿{order.totals?.grandTotal?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
