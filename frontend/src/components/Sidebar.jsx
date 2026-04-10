import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, Package, AlertTriangle, ShoppingCart,
  Pill, LogOut, User
} from 'lucide-react';

const NAV = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/inventory',icon: Package,         label: 'Inventory'    },
  { to: '/alerts',   icon: AlertTriangle,   label: 'Alerts'       },
  { to: '/reorder',  icon: ShoppingCart,    label: 'Reorder List' },
];

export default function Sidebar({ alertCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-slate-100 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Pill size={16} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800">PharmaFlow</div>
          <div className="text-[10px] text-slate-400 leading-none">Inventory System</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-3 px-2">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                <span>{label}</span>
                {label === 'Alerts' && alertCount > 0 && (
                  <span className="ml-auto text-[10px] font-semibold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {alertCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <User size={13} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-700 truncate">{user?.name || user?.username}</div>
            <div className="text-[10px] text-slate-400 capitalize">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-1.5 mt-1 rounded-lg text-xs text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
