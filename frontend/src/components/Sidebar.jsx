import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Package, AlertTriangle, ShoppingCart, Pill, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/inventory', icon: Package,          label: 'Inventory'    },
  { to: '/alerts',    icon: AlertTriangle,    label: 'Alerts'       },
  { to: '/reorder',   icon: ShoppingCart,     label: 'Reorder List' },
];

export default function Sidebar({ alertCount }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  
  const initials = (user?.name || user?.username || 'U')
    .split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 80 : 250 }}
      className="bg-slate-900 flex flex-col min-h-screen shrink-0 relative transition-all duration-300 ease-in-out border-r border-slate-800"
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 bg-slate-800 border border-slate-700 rounded-full p-1 text-slate-400 hover:text-white hover:bg-slate-700 z-50 transition-colors"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo */}
      <div className={`p-5 border-b border-slate-800 flex items-center ${collapsed ? 'justify-center tracking-tight' : 'gap-3'} h-[76px]`}>
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
          <Pill size={18} className="text-white" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-hidden whitespace-nowrap">
            <div className="text-white text-sm font-semibold tracking-wide">PharmaFlow</div>
            <div className="text-slate-400 text-[10px] mt-0.5 uppercase tracking-wider">Inventory System</div>
          </motion.div>
        )}
      </div>

      {/* Section label */}
      {!collapsed && (
        <div className="px-5 pt-6 pb-2 text-slate-500 text-[10px] font-bold tracking-[0.1em] uppercase">
          Main Menu
        </div>
      )}
      {collapsed && <div className="pt-6"></div>}

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
              ${isActive 
                ? 'bg-blue-600/15 text-white border-l-2 border-blue-500 font-medium' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-2 border-transparent'
              }
              ${collapsed ? 'justify-center !px-0 !border-l-0 w-11 mx-auto' : ''}
            `}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className={collapsed ? "shrink-0" : ""} />
            {!collapsed && <span className="flex-1 truncate">{label}</span>}
            {!collapsed && label === 'Alerts' && alertCount > 0 && (
              <span className="text-[10px] font-bold bg-red-500 text-white rounded-full px-2 py-0.5 shrink-0 shadow-sm shadow-red-500/30">
                {alertCount}
              </span>
            )}
            {collapsed && label === 'Alerts' && alertCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-slate-800 p-4">
        <div className={`flex items-center gap-3 bg-slate-800/50 rounded-xl p-2.5 ${collapsed ? 'justify-center !p-2' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="overflow-hidden min-w-0">
              <div className="text-xs text-slate-200 font-medium truncate">{user?.name || user?.username}</div>
              <div className="text-[10px] text-slate-500 capitalize">{user?.role}</div>
            </div>
          )}
        </div>
        <button onClick={() => { logout(); navigate('/login'); }}
          className={`flex items-center gap-2 mt-2 w-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2 text-xs'}`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={15} /> 
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>
  );
}
