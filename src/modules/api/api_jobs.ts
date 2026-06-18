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

export async function getJobsById(orderId: string): Promise<any[]> {
  const token = await getFreshToken(); // ✨ ใช้แบบนี้ทุกฟังก์ชัน

  const response = await fetch(`${apiUrl}/api/jobs/jobs_get/${orderId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch order");
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

export async function getStoveSuccess(selectDate: string, searchName: string, page: number, limit: number): Promise<any[]> {
  const token = await getFreshToken();
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // 🌟 สร้างเครื่องมือจัดระเบียบ Parameter
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (selectDate) queryParams.append("date", selectDate);
  if (searchName) queryParams.append("name", searchName); 

  // 🎯 แก้ไขเพิ่มการต่อเครื่องหมาย ? และ queryParams.toString() เข้าท้าย URL ปลายทาง
  const response = await fetch(`${apiUrl}/api/jobs/stove_success?${queryParams.toString()}`, {
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


export async function getJobSummary(rider_id: string, date: string): Promise<any> {
  const token = await getFreshToken(); 

  // 🌟 นำ rider_id และ date ไปต่อท้าย URL
  const response = await fetch(`${apiUrl}/api/jobs/jobs_summary?user_id=${rider_id}&date=${date}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch summary");
  }

  return json.data;
}