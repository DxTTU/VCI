import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Sparkles, RefreshCw, Menu } from 'lucide-react';

export default function Header({ currentView, openOnboardingModal, refreshData, toggleMobileSidebar }) {
  const getTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return {
          title: 'Executive Dashboard',
          spec: 'VCI-METRICS // REALTIME TELEMETRY',
        };
      case 'club-master':
        return {
          title: 'Club Master Registry',
          spec: 'VCI-CHARTER // ENTITIES ROSTER',
        };
      case 'member-master':
        return {
          title: 'Member Master Dossier',
          spec: 'VCI-INDIVIDUALS // PERSONNEL ARCHIVE',
        };
      case 'pst-master':
        return {
          title: 'PST Leadership Master',
          spec: 'VCI-CABINET // PRESIDENT - SECRETARY - TREASURER',
        };
      case 'drz-master':
        return {
          title: 'DRZ Hierarchy Master',
          spec: 'VCI-HIERARCHY // DISTRICT - REGION - ZONE',
        };
      case 'audit-logs':
        return {
          title: 'System Telemetry',
          spec: 'VCI-AUDIT // IMMUTABLE SYSTEM EVENT LOG',
        };
      default:
        return {
          title: 'Overview',
          spec: 'VCI-PORTAL // GENERAL',
        };
    }
  };

  const viewInfo = getTitle();

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-4 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="md:hidden p-1.5 text-neutral-700 hover:text-neutral-900 border border-neutral-200 hover:bg-neutral-50 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <Link to="/" title="Return to Public Portal" className="hidden sm:block">
          <img
            src="/logo.png"
            alt="Vasavi Clubs International"
            className="w-7 h-7 object-contain flex-shrink-0 hover:scale-105 transition-transform"
          />
        </Link>
        <div className="flex items-center space-x-2">
          <h1 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-neutral-900 truncate">
            {viewInfo.title}
          </h1>
          <span className="text-neutral-300 hidden sm:inline">|</span>
          <span className="font-sans text-[10px] text-neutral-400 uppercase tracking-wider font-medium hidden sm:inline">
            {viewInfo.spec}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Clinical Sync Status */}
        <div className="hidden sm:flex items-center space-x-2 font-sans text-xs text-neutral-500 border border-neutral-200 px-2.5 py-1 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>COMPASS: 27017</span>
        </div>

        {/* Action Button: Induct Member */}
        <button
          type="button"
          onClick={openOnboardingModal}
          className="flex items-center space-x-2 px-3 py-1.5 bg-VASAVI-blue hover:bg-VASAVI-blueDark text-white text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-VASAVI-gold" />
          <span className="hidden sm:inline">New Induction</span>
        </button>
      </div>
    </header>
  );
}
