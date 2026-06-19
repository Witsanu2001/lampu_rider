/* eslint-disable @typescript-eslint/no-explicit-any */
// src/shared/ui/LocalLogin.tsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../const/firebase';
import { setToken } from '../infra/auth/token';

// 🌟 1. เพิ่ม Interface ให้รับฟังก์ชัน onSuccess
interface LocalLoginProps {
  onSuccess: (userData: any) => void;
}

export default function LocalLogin({ onSuccess }: LocalLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 🌟 เพิ่ม 2 บรรทัดนี้ เพื่อให้ LocalLogin เก็บ Token ด้วย
      const firebaseToken = await userCredential.user.getIdToken();
      setToken(firebaseToken, 24);

      onSuccess({
        uid: userCredential.user.uid,
        displayName: userCredential.user.email?.split('@')[0] || "Rider",
        photoURL: "",
        provider: 'firebase'
      });
      
    } catch (err: any) {
      console.error(err);
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... (ส่วน UI ของ Form ด้านล่างใช้โค้ดเดิมของคุณได้เลยครับ)
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-orange-100 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🛵</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Local Development Login</h2>
        <p className="text-xs text-gray-500 mt-1 mb-6">ระบบเข้าสู่ระบบจำลองสำหรับรันบน Localhost</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 text-left">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-3.5 text-left">
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Email</label>
            <input
              type="email"
              placeholder="rider@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-orange-500 to-red-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:opacity-90 transition-opacity mt-2 flex items-center justify-center"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ (Local)'}
          </button>
        </form>
      </div>
    </div>
  );
}