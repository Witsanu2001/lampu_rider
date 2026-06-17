// src/shared/infra/auth/token.ts
import { auth } from "../../const/firebase";

export async function getFreshToken(): Promise<string> {
  // 🌟 1. ดึงจาก Firebase ก่อน (สำหรับกรณีใช้ LocalLogin ตอนพัฒนา)
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken(true); 
  }

  // 🌟 2. ถ้าไม่มี Firebase ให้ไปดึง Token ของ LINE LIFF จาก localStorage (สำหรับ Production)
  const liffToken = localStorage.getItem("auth_token");
  if (liffToken) {
    return liffToken;
  }

  // 🌟 3. ถ้าไม่มีทั้งคู่ (Session หมด)
  console.error("Session expired or no token found.");
  
  // ให้ลบ window.location.href = "/login" ออก เพราะแอปคุณใช้ LINE Auth อัตโนมัติ 
  // และไม่มีหน้า /login ในระบบ Routing
  return "";
}