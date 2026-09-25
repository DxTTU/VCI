import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Activity, ShieldCheck, ShieldAlert, Terminal, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

/**
 * System Telemetry (Audit Records) Component
 * Strict adherence to "The Ordinary" clinical aesthetic:
 * - High-contrast black/white palette
 * - Ultra-thin borders (border-b border-gray-200)
 * - Excessive white space and hairline dividers
 * - Uppercase monospace micro-typography
 * - Status styled purely clinically via text color (text-emerald-700 / text-red-700),
 *   strictly eliminating standard rounded pills and bulky backgrounds.
 */
export default function AuditLogs() {
  const { token, isAdmin, isSuperAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const modules = ['ALL', 'AUTH', 'MEMBERS', 'CLUBS', 'SYSTEM'];
  const statuses = ['ALL', 'SUCCESS', 'FAILED'];

  // Fetch telemetry records from backend
  const fetchAuditLogs = async (showRefreshSpinner = false) => {
    try {
      if (showRefreshSpinner) setIsRefreshing(true);
      else setLoading(true);
      setError(null);

      const authToken = token || localStorage.getItem('vci_auth_token');
      const res = await fetch(getApiUrl('/api/audit-logs?limit=250'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Accept': 'application/json',
        },
      });

      const text = await res.text();
      let json = {};
      if (text) {
        try {
          json = JSON.parse(text);
        } catch {
          json = { message: text.startsWith('<') ? `Server error (${res.status})` : text };
        }
      }

      if (!res.ok) {
        throw new Error(json.message || `Failed to fetch telemetry archive (${res.status})`);
      }

      setLogs(json.data || []);
    } catch (err) {
      console.error('Audit log fetch error:', err);
      setError(err.message || 'System telemetry query failed');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Format timestamp into clinical ISO-adjacent monospace string: YYYY-MM-DD HH:mm:ss
  const formatDateTime = (dateString) => {
    if (!dateString) return '0000-00-00 00:00:00';
    try {
      const d = new Date(dateString);
      const pad = (n) => String(n).padStart(2, '0');
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      const seconds = pad(d.getSeconds());
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch {
      return dateString;
    }
  };

  // Filtered telemetry records
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        !searchTerm ||
        log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.module?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModule =
        selectedModule === 'ALL' ||
        log.module?.toUpperCase() === selectedModule.toUpperCase();

      const matchesStatus =
        selectedStatus === 'ALL' ||
        log.status?.toUpperCase() === selectedStatus.toUpperCase();

      return matchesSearch && matchesModule && matchesStatus;
    });
  }, [logs, searchTerm, selectedModule, selectedStatus]);

  // Telemetry KPIs
  const totalEvents = logs.length;
  const successEvents = logs.filter((l) => l.status === 'Success').length;
  const failedEvents = logs.filter((l) => l.status === 'Failed').length;
  const successRate = totalEvents > 0 ? ((successEvents / totalEvents) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-6">
      {/* Header Info Panel */}
      <div className="border border-neutral-200 bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-sans text-[10px] uppercase tracking-wider text-neutral-400 block font-medium">
                AUDIT TRAIL // DISTRICT V-324 TELEMETRY ARCHIVE
              </span>
              {isSuperAdmin ? (
                <span className="font-sans text-[9px] bg-neutral-900 text-VASAVI-gold border border-neutral-700 px-1.5 py-0.5 uppercase tracking-wider font-semibold">
                  SUPER ADMIN ACCESS
                </span>
              ) : (
                <span className="font-sans text-[9px] bg-neutral-900 text-white px-1.5 py-0.5 uppercase tracking-wider font-semibold">
                  ADMIN CONSOLE ACTIVE
                </span>
              )}
            </div>
            <h2 className="text-base font-sans font-bold uppercase tracking-wider text-neutral-900 mt-1 flex items-center space-x-2">
              <span>System Telemetry & Audit Records</span>
              <Terminal className="w-4 h-4 text-neutral-400" />
            </h2>
            <p className="text-xs font-sans font-normal text-neutral-500 mt-0.5">
              Cryptographic audit log recording user authentications, role elevations, member lifecycle changes, and security operations.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchAuditLogs(true)}
              disabled={isRefreshing || loading}
              className="flex items-center space-x-2 px-4 py-2 border border-neutral-900 hover:bg-neutral-900 hover:text-white text-neutral-900 text-xs font-sans font-medium uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? '[ REFRESHING... ]' : '[ REFRESH TELEMETRY ]'}</span>
            </button>
          </div>
        </div>

        {/* Telemetry KPIs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-neutral-100 font-sans text-xs">
          <div className="p-3 border border-neutral-100 bg-neutral-50/50 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-medium">TOTAL TELEMETRY EVENTS</span>
            <span className="text-xl font-sans font-bold text-neutral-900">{totalEvents}</span>
          </div>
          <div className="p-3 border border-neutral-100 bg-neutral-50/50 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-medium">AUTHENTICATED SUCCESS</span>
            <span className="text-xl font-sans font-bold text-emerald-700">{successEvents}</span>
          </div>
          <div className="p-3 border border-neutral-100 bg-neutral-50/50 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-medium">FAILED / REJECTED ACTIONS</span>
            <span className="text-xl font-sans font-bold text-red-700">{failedEvents}</span>
          </div>
          <div className="p-3 border border-neutral-100 bg-neutral-50/50 space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-medium">TELEMETRY RELIABILITY</span>
            <span className="text-xl font-sans font-bold text-neutral-900">{successRate}%</span>
          </div>
        </div>

        {/* Search & Clinical Filter Bar */}
        <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by user, action, reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-VASAVI-blue font-sans outline-none"
            />
          </div>

          {/* Module & Status Selector */}
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {/* Module Filter */}
            <div className="flex items-center space-x-1 overflow-x-auto">
              <span className="font-sans text-[10px] text-neutral-400 uppercase mr-1 font-medium">MODULE:</span>
              {modules.map((mod) => (
                <button
                  key={mod}
                  onClick={() => setSelectedModule(mod)}
                  className={`px-2 py-1 font-sans text-xs border transition-colors ${
                    selectedModule === mod
                      ? 'border-neutral-900 bg-neutral-900 text-white font-bold'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 font-medium'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1">
              <span className="font-sans text-[10px] text-neutral-400 uppercase mr-1 font-medium">STATUS:</span>
              {statuses.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-2 py-1 font-sans text-xs border transition-colors ${
                    selectedStatus === st
                      ? 'border-neutral-900 bg-neutral-900 text-white font-bold'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 font-medium'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 font-sans text-xs flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>[TELEMETRY QUERY ERROR] {error}</span>
        </div>
      )}

      {/* Data Table */}
      <div className="border border-neutral-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-gray-200 font-sans text-[10px] text-neutral-400 uppercase tracking-wider bg-neutral-50/50 font-medium">
              <th className="py-3 px-4 whitespace-nowrap">DATE/TIME</th>
              <th className="py-3 px-4 whitespace-nowrap">MODULE</th>
              <th className="py-3 px-4 whitespace-nowrap">ACTION</th>
              <th className="py-3 px-4 whitespace-nowrap">REFERENCE</th>
              <th className="py-3 px-4 whitespace-nowrap">USER</th>
              <th className="py-3 px-4 whitespace-nowrap">ROLE</th>
              <th className="py-3 px-4 whitespace-nowrap">STATUS</th>
              <th className="py-3 px-4">REMARKS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 font-sans text-xs">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-neutral-400 font-sans text-xs">
                  <div className="flex items-center justify-center space-x-2 animate-pulse">
                    <Activity className="w-4 h-4 text-VASAVI-blue animate-spin" />
                    <span>[ RETRIEVING SYSTEM TELEMETRY LEDGER... ]</span>
                  </div>
                </td>
              </tr>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => {
                const isSuccess = log.status?.toLowerCase() === 'success';

                return (
                  <tr
                    key={log._id || index}
                    className="border-b border-gray-200 hover:bg-neutral-50/80 transition-colors"
                  >
                    {/* 1. DATE/TIME */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-neutral-600 font-medium">
                      {formatDateTime(log.timestamp)}
                    </td>

                    {/* 2. MODULE */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs font-bold text-neutral-900 tracking-wide">
                      {log.module || 'SYSTEM'}
                    </td>

                    {/* 3. ACTION */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-neutral-900 font-semibold tracking-normal">
                      {log.action}
                    </td>

                    {/* 4. REFERENCE */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-neutral-600 font-medium">
                      {log.reference || 'N/A'}
                    </td>

                    {/* 5. USER */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-neutral-900 font-medium">
                      {log.user}
                    </td>

                    {/* 6. ROLE */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs uppercase text-neutral-500 font-medium">
                      {log.role || 'anonymous'}
                    </td>

                    {/* 7. STATUS (Strict clinical text styling: text-emerald-700 / text-red-700, no rounded pills) */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs uppercase font-bold tracking-wider">
                      {isSuccess ? (
                        <span className="text-emerald-700">Success</span>
                      ) : (
                        <span className="text-red-700">Failed</span>
                      )}
                    </td>

                    {/* 8. REMARKS */}
                    <td className="py-3.5 px-4 text-xs text-neutral-500 max-w-xs truncate" title={log.remarks}>
                      {log.remarks || 'None'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-neutral-400 font-sans text-xs font-medium"
                >
                  NO AUDIT RECORDS LOCATED IN SYSTEM TELEMETRY ARCHIVE
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Clinical Telemetry Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-sans text-neutral-400 px-1 font-medium">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>SYSTEM AUDIT SPECIFICATION: ISO/IEC 27001 COMPLIANT TELEMETRY</span>
        </div>
        <span>ARCHIVE LEDGER: MONGO COMPASS `vasaviclub.auditlogs`</span>
      </div>
    </div>
  );
}
