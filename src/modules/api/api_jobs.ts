import { getFreshToken } from "../../shared/infra/auth/token";
const apiUrl = import.meta.env.VITE_API_URL;
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getJobs(): Promise<any[]> {

  const token = await getFreshToken();

  const response = await fetch(`${apiUrl}/api/jobs/jobs_get`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch orders");
  }

  return json.data;
}

// ฟังก์ชันสำหรับอัปเดตสถานะออเดอร์
export async function updateOrderStatus(orderId: string, status: string, userId: string): Promise<string> {
  const token = await getFreshToken();

  const response = await fetch(`${apiUrl}/api/orders/orders_put/${orderId}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    // ส่งข้อมูลตามโครงสร้าง UpdateStatusRequest ใน Go
    body: JSON.stringify({ user_id: userId, status: status })
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to update order status");
  }

  return json.message;
}

export async function getHistorys(selectDate: string, searchName: string, page: number, limit: number): Promise<any[]> {
  const token = await getFreshToken();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // สร้าง Query String
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (selectDate) queryParams.append("date", selectDate);
  if (searchName) queryParams.append("name", searchName); // ส่งชื่อไปให้ Backend ค้นหา

  const response = await fetch(`${apiUrl}/api/jobs/jobs_history?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch history");
  }

  return json.data || [];
}
