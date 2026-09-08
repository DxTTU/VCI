import React from 'react';
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  UserPlus, 
  Activity, 
  ArrowUpRight,
  HeartHandshake
} from 'lucide-react';

export default function DashboardPage({ members, clubs, psts, openOnboardingModal }) {
  const stats = [
    {
      code: 'METRIC.01',
      label: 'Enrolled Members',
      value: members.length || '38',
      subtext: '+4 inducted this quarter',
      color: 'text-neutral-900',
    },
    {
      code: 'METRIC.02',
      label: 'Chartered Clubs',
      value: clubs.length || '3',
      subtext: 'District 324-A Jurisdiction',
      color: 'text-VASAVI-blue',
    },
    {
      code: 'METRIC.03',
      label: 'Active PST Cabinets',
      value: psts.length || '1',
      subtext: 'Year 2024-2025 Incumbent',
      color: 'text-neutral-900',
    },
    {
      code: 'METRIC.04',
      label: 'Service Impact Index',
      value: '99.4%',
      subtext: 'Vision & Hunger Relief Target',
      color: 'text-VASAVI-goldDark',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Clinical Banner */}
      <div className="border border-neutral-200 bg-white p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-clinical text-neutral-400">
              OPERATIONAL JURISDICTION // DISTRICT V-324
            </span>
            <h2 className="text-xl font-light tracking-tight text-neutral-900">
              Vasavi Club International <span className="font-semibold text-neutral-900">Executive Console</span>
            </h2>
            <p className="text-xs text-neutral-500 max-w-xl">
              Minimalist chapter administration system. Monitor charter entities, member dossiers, and cabinet governance in real-time.
            </p>
          </div>

          <button
            onClick={openOnboardingModal}
            className="self-start md:self-auto flex items-center space-x-2 px-5 py-2.5 bg-neutral-900 hover:bg-VASAVI-blue text-white text-xs font-medium uppercase tracking-wider transition-colors"
          >
            <UserPlus className="w-4 h-4 text-VASAVI-gold" />
            <span>Launch Member Onboarding</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="border border-neutral-200 bg-white p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-clinical">
                {s.code}
              </span>
              <span className="w-1.5 h-1.5 bg-VASAVI-blue"></span>
            </div>
            <div className={`text-2xl font-light tracking-tight ${s.color}`}>
              {s.value}
            </div>
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="font-medium text-neutral-800 text-[11px] uppercase tracking-wide">
                {s.label}
              </span>
              <span className="font-mono text-[9px] text-neutral-400">
                {s.subtext}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Recent Inductions & PST Leadership Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Member Inductions Table (2 cols) */}
        <div className="lg:col-span-2 border border-neutral-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <div>
              <span className="font-mono text-[9px] uppercase tracking-clinical text-neutral-400 block">
                PERSONNEL REGISTRY
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Recent Member Inductions
              </h3>
            </div>
            <button
              onClick={openOnboardingModal}
              className="text-[10px] font-mono text-VASAVI-blue hover:underline uppercase"
            >
              + Onboard Member
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 font-mono text-[9px] text-neutral-400 uppercase tracking-clinical">
                  <th className="py-2">MEMBER ID</th>
                  <th className="py-2">NAME</th>
                  <th className="py-2">BLOOD</th>
                  <th className="py-2">ROLE</th>
                  <th className="py-2">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {members.slice(0, 5).map((m) => (
                  <tr key={m._id || m.memberId} className="hover:bg-neutral-50/70">
                    <td className="py-3 font-mono text-neutral-600">{m.memberId}</td>
                    <td className="py-3 font-medium text-neutral-900">
                      {m.firstName} {m.lastName}
                    </td>
                    <td className="py-3 font-mono text-neutral-600">{m.bloodGroup}</td>
                    <td className="py-3 text-neutral-600">{m.role || 'Vasavi Member'}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 border border-neutral-200 font-mono text-[9px] text-neutral-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{m.status || 'Active'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PST Cabinet Quick Card */}
        <div className="border border-neutral-200 bg-white p-6 space-y-4">
          <div className="border-b border-neutral-200 pb-3">
            <span className="font-mono text-[9px] uppercase tracking-clinical text-neutral-400 block">
              EXECUTIVE LEADERSHIP
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
              PST Cabinet // 2024-2025
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* President */}
            <div className="p-3 border border-neutral-200 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>[P] CLUB PRESIDENT</span>
                <span className="text-VASAVI-blue font-bold">INCUMBENT</span>
              </div>
              <div className="font-sans font-semibold text-neutral-900 text-sm">
                Rajesh Sundaram
              </div>
              <div className="text-[10px] text-neutral-500 truncate">
                president@vasaviclub.org
              </div>
            </div>

            {/* Secretary */}
            <div className="p-3 border border-neutral-200 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>[S] CLUB SECRETARY</span>
                <span className="text-VASAVI-blue font-bold">INCUMBENT</span>
              </div>
              <div className="font-sans font-semibold text-neutral-900 text-sm">
                Dr. Ananya Venkatesh
              </div>
              <div className="text-[10px] text-neutral-500 truncate">
                secretary@vasaviclub.org
              </div>
            </div>

            {/* Treasurer */}
            <div className="p-3 border border-neutral-200 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>[T] CLUB TREASURER</span>
                <span className="text-VASAVI-blue font-bold">INCUMBENT</span>
              </div>
              <div className="font-sans font-semibold text-neutral-900 text-sm">
                Karthik Narayanan
              </div>
              <div className="text-[10px] text-neutral-500 truncate">
                treasurer@vasaviclub.org
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
