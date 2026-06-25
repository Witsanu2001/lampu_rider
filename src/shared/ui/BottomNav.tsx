/* eslint-disable @typescript-eslint/no-explicit-any */
// src/shared/ui/BottomNav.tsx

import { NavLink } from 'react-router-dom';
import { menuConfig } from './menu';

interface BottomNavProps {
  user?: any;
  isPaymentPage?: boolean;
  hasPermission?: (item: any) => boolean;
}

export default function BottomNav({ user, isPaymentPage, hasPermission }: BottomNavProps) {
  // 🌟 ถ้าไม่มี user ล็อกอินอยู่ หรืออยู่ในหน้าจ่ายเงิน จะซ่อนเมนูด้านล่าง
  if (!user || isPaymentPage) return null;

  // 🌟 กรองเมนูเฉพาะที่มีสิทธิ์เห็น (ถ้ามีการเช็คสิทธิ์)
  const visibleMenu = hasPermission ? menuConfig.filter(hasPermission) : menuConfig;

  return (
    <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-white dark:bg-gray-900 border-t border-blue-100 dark:border-blue-800 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around items-center pb-safe pt-2 px-2 z-50 transition-colors duration-300">
      {visibleMenu.map((item, index) => (
        <NavLink
          key={index}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center p-4 mb-4 rounded-lg transition-all duration-200 ${
              isActive 
                ? 'text-blue-600 dark:text-blue-400 scale-110' 
                : 'text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400'
            }`
          }
        >
          <div className="w-6 h-6 mb-1 relative flex justify-center items-center">
             {item.iconUrl ? (
                 <img src={item.iconUrl} alt={item.label} className="max-w-full max-h-full object-contain transition-all" />
             ) : (
                 <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded-sm transition-colors"></div>
             )}
          </div>
          {/* <span className="text-[10px] font-medium">{item.label}</span> */}
        </NavLink>
      ))}
    </nav>
  );
}