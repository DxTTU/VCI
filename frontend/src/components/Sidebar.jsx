import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Lock,
  Activity,
  Network,
  X
} from 'lucide-react';

/**
 * Sidebar Component
 * Modeled after "The Ordinary" clinical minimalist design philosophy:
 * - High contrast black/white structure
 * - Hairline 1px borders (#E5E5E5)
 * - Restrained VASAVI Blue (#00338D) active borders and VASAVI Gold (#F2A900) micro-accents
 * - Responsive mobile drawer with backdrop overlay
 */
export default function Sidebar({ currentView, setCurrentView, openOnboardingModal, isOpen, onClose }) {
  const { logout, user, isAdmin, isSuperAdmin, role } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    if (onClose) onClose();
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
    {
      id: 'drz-master',
      label: 'DRZ Master',
      code: 'NAV.05',
      icon: Network,
      description: 'District, Region & Zone hierarchy',
      adminOnly: true,
      path: '/drz-master',
    },
    {
      id: 'audit-logs',
      label: 'System Telemetry',
      code: 'NAV.06',
      icon: Activity,
      description: 'Audit records & system telemetry',
      adminOnly: true,
      path: '/audit-logs',
    },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-neutral-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      <aside
        className={`w-64 md:w-72 bg-white h-screen fixed top-0 left-0 border-r border-neutral-200 flex flex-col justify-between z-50 select-none transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Identity / Masthead */}
        <div>
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-2">
              <Link to="/" className="flex items-center space-x-3 group" title="Return to Public Portal">
                {/* Official Vasavi Clubs International Logo */}
                <img
                  src="/logo.png"
                  alt="Vasavi Clubs International"
                  className="w-9 h-9 object-contain flex-shrink-0 transition-transform group-hover:scale-105"
                />
                <div>
                  <h1 className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-900 group-hover:text-VASAVI-blue transition-colors">
                    Vasavi Club Intl.
                  </h1>
                  <p className="font-sans text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
                    District V-324 // Chapter Portal
                  </p>
                </div>
              </Link>

              {/* Close Button on Mobile View */}
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="md:hidden p-1.5 text-neutral-400 hover:text-neutral-900 border border-neutral-200 hover:bg-neutral-50"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="mt-3 pt-3 border-t border-dashed border-neutral-200 flex items-center justify-between text-[10px] font-sans text-neutral-400 font-medium">
              <span>
                ROLE:{' '}
                <span
                  className={
                    isSuperAdmin
                      ? 'text-VASAVI-gold font-bold'
                      : isAdmin
                      ? 'text-VASAVI-blue font-bold'
                      : 'text-neutral-700 font-bold'
                  }
                >
                  {isSuperAdmin ? 'SUPER ADMIN' : isAdmin ? 'ADMIN' : 'MEMBER'}
                </span>
              </span>
              <span
                className={
                  isSuperAdmin
                    ? 'text-VASAVI-gold font-semibold text-[9px]'
                    : isAdmin
                    ? 'text-emerald-600 font-semibold text-[9px]'
                    : 'text-neutral-400 text-[9px]'
                }
              >
                {isSuperAdmin ? '[ROOT ACCESS]' : isAdmin ? '[FULL ACCESS]' : '[RESTRICTED]'}
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
            <span className="font-sans text-[10px] font-semibold text-neutral-400 group-hover:text-white transition-colors">
              +NEW
            </span>
          </button>
        </div>

        {/* Core Menu Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1.5">
            <span className="font-sans text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
              Core Modules
            </span>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isLocked = !isAdmin && item.adminOnly;

            const handleClick = () => {
              setCurrentView(item.id);
              if (item.path) {
                navigate(item.path);
              } else {
                navigate('/dashboard');
              }
              if (onClose) onClose();
            };

            return (
              <button
                type="button"
                key={item.id}
                onClick={handleClick}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-xs transition-colors duration-150 relative cursor-pointer ${
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
                      <span className={`block font-sans font-medium leading-snug ${isLocked ? 'text-neutral-400' : ''}`}>{item.label}</span>
                      {isLocked && <Lock className="w-2.5 h-2.5 text-neutral-400" />}
                    </div>
                    <span className="font-sans text-[10px] text-neutral-400 tracking-wider font-medium">
                      {item.code}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  {isLocked && (
                    <span className="font-sans text-[9px] font-semibold text-neutral-400 tracking-wider uppercase px-1 py-0.5 border border-neutral-200">
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
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-3 py-2 border border-neutral-200 hover:border-neutral-900 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 text-xs font-sans font-medium uppercase tracking-wider transition-all duration-150 group cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <LogOut className="w-3.5 h-3.5 text-neutral-400 group-hover:text-red-600 transition-colors" />
              <span>Sign Out</span>
            </div>
            <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-700">[EXIT]</span>
          </button>
        </div>

        {/* System Telemetry & Clinical Footer */}
        <div className="p-5 border-t border-neutral-200 bg-white">
          <div className="space-y-2 text-xs font-sans text-neutral-500 font-medium">
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

          <div className="mt-4 pt-3 border-t border-neutral-100 text-[10px] font-sans font-medium text-neutral-400 flex items-center justify-between">
            <span>VASAVI INT. SYSTEM v2.4</span>
            <span className="text-VASAVI-blue">#00338D</span>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}
