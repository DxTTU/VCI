import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Database,
  ChevronRight,
  Sparkles,
  LogOut,
  Lock
} from 'lucide-react';

/**
 * Sidebar Component
 * Modeled after "The Ordinary" clinical minimalist design philosophy:
 * - High contrast black/white structure
 * - Hairline 1px borders (#E5E5E5)
 * - Monospaced uppercase micro-typography
 * - Restrained VASAVI Blue (#00338D) active borders and VASAVI Gold (#F2A900) micro-accents
 */
export default function Sidebar({ currentView, setCurrentView, openOnboardingModal }) {
  const { logout, user, isAdmin, role } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      code: 'NAV.01',
      icon: LayoutDashboard,
      description: 'System telemetry & key indicators',
      adminOnly: false,
    },
    {
      id: 'club-master',
      label: 'Club Master',
      code: 'NAV.02',
      icon: Building2,
      description: 'Charter entities & district roster',
      adminOnly: true,
    },
    {
      id: 'member-master',
      label: 'Member Master',
      code: 'NAV.03',
      icon: Users,
      description: 'Individual dossiers & status',
      adminOnly: true,
    },
    {
      id: 'pst-master',
      label: 'PST Master',
      code: 'NAV.04',
      icon: ShieldCheck,
      description: 'Presidents, Secretaries & Treasurers',
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-64 md:w-72 bg-white h-screen fixed top-0 left-0 border-r border-neutral-200 flex flex-col justify-between z-30 select-none">
      {/* Brand Identity / Masthead */}
      <div>
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center space-x-3 mb-2">
            {/* Minimalist Clinical Monogram with Vasavi Accent */}
            <div className="w-8 h-8 border border-neutral-900 flex items-center justify-center bg-white relative">
              <span className="font-mono text-xs font-bold text-neutral-900 tracking-tighter">VC</span>
              {/* Subtle Vasavi Gold Accent Pip */}
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-VASAVI-gold rounded-full ring-2 ring-white"></span>
            </div>
            <div>
              <h1 className="text-xs font-semibold uppercase tracking-wider text-neutral-900">
                Vasavi Club Intl.
              </h1>
              <p className="font-mono text-[9px] text-neutral-400 tracking-clinical uppercase">
                District V-324 // Chapter Portal
              </p>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-dashed border-neutral-200 flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span>ROLE: <span className={isAdmin ? 'text-VASAVI-blue font-bold' : 'text-neutral-700 font-bold'}>{isAdmin ? 'ADMIN' : 'MEMBER'}</span></span>
            <span className={isAdmin ? 'text-emerald-600 font-semibold text-[9px]' : 'text-neutral-400 text-[9px]'}>
              {isAdmin ? '[FULL ACCESS]' : '[RESTRICTED]'}
            </span>
          </div>
        </div>

        {/* Primary Action Button: Member Onboarding */}
        <div className="p-4 border-b border-neutral-100">
          <button
            onClick={openOnboardingModal}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-neutral-900 hover:bg-VASAVI-blue text-white text-xs font-medium tracking-wide transition-all duration-200 group"
          >
            <div className="flex items-center space-x-2">
              <UserPlus className="w-3.5 h-3.5 text-VASAVI-gold group-hover:rotate-12 transition-transform duration-200" />
              <span className="uppercase text-[11px] tracking-wider">Member Onboarding</span>
            </div>
            <span className="font-mono text-[10px] text-neutral-400 group-hover:text-white transition-colors">
              +NEW
            </span>
          </button>
        </div>

        {/* Core Menu Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1.5">
            <span className="font-mono text-[9px] uppercase tracking-clinical text-neutral-400">
              Core Modules
            </span>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isLocked = !isAdmin && item.adminOnly;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-xs transition-colors duration-150 relative ${
                  isActive
                    ? 'bg-neutral-50 text-neutral-900 font-medium'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50/60'
                }`}
              >
                {/* Active Indicator Bar: VASAVI Blue with Gold dot */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-VASAVI-blue flex items-center">
                    <div className="w-1.5 h-1.5 -left-0.5 relative bg-VASAVI-gold rounded-full ring-2 ring-white"></div>
                  </div>
                )}

                <div className="flex items-center space-x-3 pl-1">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-VASAVI-blue' : isLocked ? 'text-neutral-300' : 'text-neutral-400'
                    }`}
                  />
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className={`block leading-snug ${isLocked ? 'text-neutral-400' : ''}`}>{item.label}</span>
                      {isLocked && <Lock className="w-2.5 h-2.5 text-neutral-400" />}
                    </div>
                    <span className="font-mono text-[9px] text-neutral-400 tracking-wider">
                      {item.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {isLocked && (
                    <span className="font-mono text-[8px] text-neutral-400 tracking-tighter uppercase px-1 py-0.5 border border-neutral-200">
                      ADMIN
                    </span>
                  )}
                  <ChevronRight
                    className={`w-3 h-3 transition-transform ${
                      isActive ? 'text-VASAVI-blue translate-x-0.5' : 'text-neutral-300 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sign Out Button & System Telemetry */}
      <div>
        {/* Sign Out Action */}
        <div className="p-3 border-t border-neutral-100 bg-white">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-3 py-2 border border-neutral-200 hover:border-neutral-900 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 text-xs font-mono uppercase tracking-wider transition-all duration-150 group"
          >
            <div className="flex items-center space-x-2">
              <LogOut className="w-3.5 h-3.5 text-neutral-400 group-hover:text-red-600 transition-colors" />
              <span>Sign Out</span>
            </div>
            <span className="text-[9px] text-neutral-400 group-hover:text-neutral-700">[EXIT]</span>
          </button>
        </div>

        {/* System Telemetry & Clinical Footer */}
        <div className="p-5 border-t border-neutral-200 bg-white">
        <div className="space-y-2 text-[10px] font-mono text-neutral-500">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">REPOSITORY:</span>
            <span className="text-neutral-800 font-medium">COMPASS LOCAL</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">DATABASE:</span>
            <span className="text-neutral-800 font-medium">vasaviclub</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-neutral-600">ONLINE</span>
            </span>
            <span className="text-neutral-400">PORT: 27017</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 text-[9px] font-mono text-neutral-400 flex items-center justify-between">
          <span>VASAVI INT. SYSTEM v2.4</span>
          <span className="text-VASAVI-blue">#00338D</span>
        </div>
      </div>
    </div>
  </aside>
  );
}
