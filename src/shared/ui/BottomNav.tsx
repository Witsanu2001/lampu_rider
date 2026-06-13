// src/shared/ui/BottomNav.tsx
import { NavLink } from 'react-router-dom';
import { menuConfig } from './menu';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full max-w-md mx-auto bg-white border-t border-gray-200 flex justify-around items-center pb-safe pt-2 px-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {menuConfig.map((item, index) => (
        <NavLink
          key={index}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
              isActive ? 'text-blue-600 scale-110' : 'text-gray-400 hover:text-blue-500'
            }`
          }
        >
          <div className="w-6 h-6 mb-1 relative flex justify-center items-center">
             {item.iconUrl ? (
                 <img src={item.iconUrl} alt={item.label} className="max-w-full max-h-full object-contain" />
             ) : (
                 <div className="w-full h-full bg-gray-300 rounded-sm"></div>
             )}
          </div>
          <span className="text-[10px] font-medium">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}