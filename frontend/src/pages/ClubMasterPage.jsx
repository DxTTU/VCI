import React from 'react';
import { Building2, Calendar, MapPin, Mail, Phone, Users, Shield } from 'lucide-react';

export default function ClubMasterPage({ clubs }) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border border-neutral-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-clinical text-neutral-400 block">
              INSTITUTIONAL DIRECTORY
            </span>
            <h2 className="text-base font-semibold uppercase tracking-wider text-neutral-900">
              Club Master Registry
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Official chartered clubs operating under Vasavi Clubs International (District V-324) jurisdiction.
            </p>
          </div>
          <div className="font-mono text-xs text-VASAVI-blue border border-neutral-200 px-3 py-1.5 self-start">
            TOTAL CLUBS: {clubs.length}
          </div>
        </div>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubs.map((club) => (
          <div
            key={club._id || club.clubNumber}
            className="border border-neutral-200 bg-white p-6 space-y-4 hover:border-neutral-400 transition-colors"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="font-mono text-[10px] text-VASAVI-blue font-semibold">
                {club.clubNumber}
              </span>
              <span className="font-mono text-[9px] px-2 py-0.5 border border-neutral-200 text-neutral-600 uppercase">
                {club.status || 'Active'}
              </span>
            </div>

            {/* Club Name & District */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 leading-snug">
                {club.clubName}
              </h3>
              <p className="font-mono text-[10px] text-neutral-400 tracking-wider uppercase mt-1">
                {club.district} // {club.multipleDistrict || 'VCI 324'}
              </p>
            </div>

            {/* Details */}
            <div className="space-y-2 text-xs text-neutral-600 border-t border-neutral-100 pt-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>
                  Charter: {club.charterDate ? new Date(club.charterDate).toLocaleDateString() : '1984-06-15'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span className="truncate">
                  {club.meetingSchedule?.venue || 'Royal International Hall, Chennai'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                <span className="font-mono text-[11px] truncate">
                  {club.contactEmail}
                </span>
              </div>
            </div>

            {/* Footer Stats */}
            <div className="border-t border-neutral-100 pt-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-VASAVI-gold" />
                <span className="font-mono text-[11px] text-neutral-700">
                  {club.totalMembers || 0} Members
                </span>
              </div>
              <span className="font-mono text-[9px] text-neutral-400 uppercase">
                {club.meetingSchedule?.frequency || 'Bi-Weekly'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
