// ตัวอย่างไฟล์ src/modules/api/api_login.ts
const apiUrl = import.meta.env.VITE_API_URL;

export async function postLineAuth(lineToken: string) {
  return await fetch(`${apiUrl}/api/auth/line`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: lineToken }), // 🌟 แก้ตรงนี้
  });
}