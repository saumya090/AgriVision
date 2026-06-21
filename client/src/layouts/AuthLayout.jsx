import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout } from 'lucide-react';

const AuthLayout = () => {
  const { user, loading } = useAuth();

  // Redirect logged-in users to dashboard
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background blur effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-12 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Left pane: Branding & aesthetics (Hidden on mobile) */}
        <div className="hidden md:flex md:col-span-5 bg-gradient-to-br from-emerald-800 via-emerald-950 to-slate-950 p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800">
          {/* Animated visual pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <Sprout size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wider font-display">AgriVision</h1>
              <p className="text-xs text-emerald-400/80">Smart Agriculture Management</p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              Cultivating the future through intelligent insights.
            </h2>
            <p className="text-slate-300/80 text-sm leading-relaxed">
              Track crop lifecycles, optimize irrigation timelines, manage expenses, and navigate the marketplace with our state-of-the-art farming command centre.
            </p>
          </div>

          <div className="text-xs text-slate-400/60 relative z-10">
            © 2026 AgriVision Platform. All rights reserved.
          </div>
        </div>

        {/* Right pane: Auth forms */}
        <div className="col-span-12 md:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div className="flex justify-center md:hidden mb-8 gap-3 items-center">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Sprout size={28} />
            </div>
            <span className="text-xl font-bold text-white tracking-wide">AgriVision</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
