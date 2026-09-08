import React from 'react';
import { UserPlus, Sparkles, RefreshCw } from 'lucide-react';

export default function Header({ currentView, openOnboardingModal, refreshData }) {
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
      default:
        return {
          title: 'Overview',
          spec: 'VCI-PORTAL // GENERAL',
        };
    }
  };

  const viewInfo = getTitle();

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 md:px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
            {viewInfo.title}
          </h1>
          <span className="text-neutral-300">|</span>
          <span className="font-mono text-[9px] text-neutral-400 tracking-clinical">
            {viewInfo.spec}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Clinical Sync Status */}
        <div className="hidden sm:flex items-center space-x-2 font-mono text-[10px] text-neutral-500 border border-neutral-200 px-2.5 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>COMPASS: 27017</span>
        </div>

        {/* Action Button: Induct Member */}
        <button
          onClick={openOnboardingModal}
          className="flex items-center space-x-2 px-3.5 py-1.5 bg-VASAVI-blue hover:bg-VASAVI-blueDark text-white text-xs font-medium uppercase tracking-wider transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5 text-VASAVI-gold" />
          <span className="hidden sm:inline">New Induction</span>
        </button>
      </div>
    </header>
  );
}
