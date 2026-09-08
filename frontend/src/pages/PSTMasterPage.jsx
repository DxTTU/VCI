import React from 'react';
import { ShieldCheck, Mail, Phone, Calendar, Award } from 'lucide-react';

export default function PSTMasterPage({ psts }) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border border-neutral-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-clinical text-neutral-400 block">
              EXECUTIVE GOVERNANCE
            </span>
            <h2 className="text-base font-semibold uppercase tracking-wider text-neutral-900">
              PST Master // President - Secretary - Treasurer
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              The core executive cabinet responsible for administrative, operational, and fiduciary leadership.
            </p>
          </div>
          <div className="font-mono text-xs text-VASAVI-blue border border-neutral-200 px-3 py-1.5 self-start">
            VASAVI YEAR: 2024-2025
          </div>
        </div>
      </div>

      {/* PST Cards */}
      <div className="space-y-6">
        {psts.map((pst, idx) => (
          <div
            key={pst._id || idx}
            className="border border-neutral-200 bg-white p-6 space-y-6"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-200 pb-4 gap-2">
              <div>
                <span className="font-mono text-[9px] text-neutral-400 uppercase tracking-clinical">
                  EXECUTIVE ROSTER
                </span>
                <h3 className="text-sm font-semibold text-neutral-900">
                  {pst.club?.clubName || 'Vasavi Club of Metropolitan Central'}
                </h3>
              </div>

              <div className="flex items-center space-x-3 font-mono text-[10px]">
                <span className="text-neutral-500">YEAR: {pst.lionYear || '2024-2025'}</span>
                <span className="text-neutral-300">|</span>
                <span className="px-2 py-0.5 border border-VASAVI-blue text-VASAVI-blue font-semibold uppercase">
                  {pst.status || 'Incumbent'}
                </span>
              </div>
            </div>

            {/* The 3 Core Executive Officers (P - S - T) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* President */}
              <div className="border border-neutral-200 p-5 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] px-2 py-0.5 bg-neutral-900 text-white uppercase font-bold">
                    P // PRESIDENT
                  </span>
                  <Award className="w-4 h-4 text-VASAVI-gold" />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">
                    {pst.president?.member?.firstName
                      ? `${pst.president.member.firstName} ${pst.president.member.lastName}`
                      : 'Rajesh Sundaram'}
                  </h4>
                  <span className="font-mono text-[10px] text-neutral-400">
                    Chief Executive Officer
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-600 border-t border-neutral-100 pt-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-mono text-[11px] truncate">
                      {pst.president?.officialEmail || 'president@vasaviclub.org'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-mono text-[11px]">
                      {pst.president?.directPhone || '+91 98401 23456'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 italic border-t border-neutral-100 pt-2 leading-relaxed">
                  "{pst.president?.termBio || 'Dedicated to community welfare, educational scholarships, and civic outreach.'}"
                </p>
              </div>

              {/* Secretary */}
              <div className="border border-neutral-200 p-5 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] px-2 py-0.5 bg-neutral-900 text-white uppercase font-bold">
                    S // SECRETARY
                  </span>
                  <Award className="w-4 h-4 text-VASAVI-gold" />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">
                    {pst.secretary?.member?.firstName
                      ? `${pst.secretary.member.firstName} ${pst.secretary.member.lastName}`
                      : 'Dr. Ananya Venkatesh'}
                  </h4>
                  <span className="font-mono text-[10px] text-neutral-400">
                    Chief Administrative Officer
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-600 border-t border-neutral-100 pt-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-mono text-[11px] truncate">
                      {pst.secretary?.officialEmail || 'secretary@vasaviclub.org'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-mono text-[11px]">
                      {pst.secretary?.directPhone || '+91 98402 34567'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 italic border-t border-neutral-100 pt-2 leading-relaxed">
                  "{pst.secretary?.termBio || 'Directing administrative governance, member correspondence, and district records.'}"
                </p>
              </div>

              {/* Treasurer */}
              <div className="border border-neutral-200 p-5 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] px-2 py-0.5 bg-neutral-900 text-white uppercase font-bold">
                    T // TREASURER
                  </span>
                  <Award className="w-4 h-4 text-VASAVI-gold" />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">
                    {pst.treasurer?.member?.firstName
                      ? `${pst.treasurer.member.firstName} ${pst.treasurer.member.lastName}`
                      : 'Karthik Narayanan'}
                  </h4>
                  <span className="font-mono text-[10px] text-neutral-400">
                    Chief Financial Officer
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-600 border-t border-neutral-100 pt-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-mono text-[11px] truncate">
                      {pst.treasurer?.officialEmail || 'treasurer@vasaviclub.org'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-mono text-[11px]">
                      {pst.treasurer?.directPhone || '+91 98403 45678'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 italic border-t border-neutral-100 pt-2 leading-relaxed">
                  "{pst.treasurer?.termBio || 'Overseeing club dues, VCI trust contributions, and audited statements.'}"
                </p>
              </div>
            </div>

            {/* Cabinet Motto Banner */}
            <div className="border-t border-neutral-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-500 gap-2">
              <span className="font-mono text-[10px] text-neutral-400">
                MOTTO: <span className="text-neutral-900 font-semibold">{pst.cabinetMotto || 'Fellowship and Service'}</span>
              </span>
              <span className="font-mono text-[10px] text-VASAVI-blue">
                INSTALLED: {pst.installedDate ? new Date(pst.installedDate).toLocaleDateString() : 'JULY 1, 2024'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
