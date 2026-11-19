import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Camera,
  Video,
  History,
  BarChart3,
  BookOpen,
  Home,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { ModelStatus } from '../types';

export const Layout: React.FC = () => {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      try {
        await api.getHealth();
        if (isMounted) setBackendOnline(true);
      } catch {
        if (isMounted) setBackendOnline(false);
      }

      try {
        const m = await api.getModelStatus();
        if (isMounted) setModelStatus(m);
      } catch {
        if (isMounted) setModelStatus(null);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Overview', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Image Inspection', path: '/detect-image', icon: Camera },
    { name: 'Video Inspection', path: '/detect-video', icon: Video },
    { name: 'Audit History', path: '/history', icon: History },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Methodology & Syllabus', path: '/methodology', icon: BookOpen },
  ];

  return (
    <div className="flex h-screen bg-[#0B0F17] overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#111726] border-r border-slate-800/80 z-20">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
            <ShieldAlert className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">RoadGuard</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">CSE471 Deep Vision</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Model Readiness Footer Card */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-[#161F33] border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">YOLOv8-nano</span>
              {modelStatus?.model_ready ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Ready
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Pending Colab
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              {modelStatus?.model_ready
                ? `Running on ${modelStatus.device.toUpperCase()}`
                : 'Checkpoint best.pt not detected. Run Colab notebook to train.'}
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-[#111726] border-r border-slate-800 z-50 flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 h-20 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            <span className="font-extrabold text-lg text-white">RoadGuard AI</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-[#111726]/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold text-slate-200">
                Automated Road Pothole and Asphalt Crack Detection
              </h1>
              <p className="text-xs text-slate-500">Autonomous Infrastructure Condition Assessment</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Backend status pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-800">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendOnline ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'
                }`}
              ></span>
              <span className="text-slate-300">
                {backendOnline ? 'Backend Online' : 'Connecting...'}
              </span>
            </div>

            {/* Model status pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-900 border border-slate-800">
              {modelStatus?.model_ready ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">YOLOv8 Online</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-300">Model Pending</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

