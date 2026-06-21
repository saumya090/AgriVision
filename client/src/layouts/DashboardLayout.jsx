import React, { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Sprout,
  Calendar,
  IndianRupee,
  Activity,

  FileText,
  Microscope,
  ShoppingBag,
  Users,
  Menu,
  X,
  LogOut,
  UserCheck,
  User
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const farmerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Farms', path: '/farms', icon: Sprout },
    { name: 'Crop Tracking', path: '/crops', icon: Activity },
    { name: 'Irrigation Planner', path: '/irrigation', icon: Calendar },
    { name: 'Expenses & Income', path: '/expenses', icon: IndianRupee },
    { name: 'Harvest Logs', path: '/harvests', icon: FileText },
    { name: 'Farming Techniques', path: '/farming-techniques', icon: Microscope },
    { name: 'Government Schemes', path: '/schemes', icon: FileText },
    { name: 'Marketplace', path: '/marketplace', icon: ShoppingBag }
  ];

  const adminLinks = [
    { name: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Schemes', path: '/schemes', icon: FileText },
    { name: 'Marketplace listings', path: '/marketplace', icon: ShoppingBag }
  ];

  const activeLinks = user.role === 'Admin' ? adminLinks : farmerLinks;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR CONTAINER */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="h-20 border-b border-slate-800 flex items-center justify-between px-6">
            <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Sprout size={24} />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-wide">AgriVision</span>
                <span className="block text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Portal</span>
              </div>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)]">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-3 mb-3">
              Core Modules
            </div>
            {activeLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive 
                      ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Profile & Logout) */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 border border-slate-700">
              {user.role === 'Admin' ? <UserCheck size={20} /> : <User size={20} />}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-white truncate">{user.name}</h4>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <span className="inline-block mt-1 text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-rose-950/20 hover:text-rose-400 border border-slate-700 hover:border-rose-500/20 text-slate-300 rounded-xl text-xs font-semibold transition-all duration-200"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col overflow-hidden h-screen">
        
        {/* TOP HEADER */}
        <header className="h-20 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between lg:justify-end gap-4 shrink-0">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            {/* Quick State Indicator */}
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs text-slate-400 font-medium">District & State</span>
              <span className="text-sm font-semibold text-emerald-400">{user.district}, {user.state}</span>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 py-1.5 px-3 rounded-full text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Platform
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
