import React, { useState } from 'react';
import { Search, UserPlus, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

export default function MemberMasterPage({
  members,
  openOnboardingModal,
  onMemberDeleted,
  onMemberRoleUpdated,
  refreshData,
}) {
  const { isAdmin, token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlood, setSelectedBlood] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBlood =
      selectedBlood === 'ALL' || m.bloodGroup === selectedBlood;

    return matchesSearch && matchesBlood;
  });

  const bloodGroups = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Handle Role Promotion to 'admin'
  const handlePromote = async (member) => {
    const targetId = member._id || member.memberId;
    try {
      setActionLoading(targetId);
      const authToken = token || localStorage.getItem('vci_auth_token');
      const res = await fetch(getApiUrl(`/api/members/${targetId}/role`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ role: 'admin' }),
      });

      const text = await res.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text.startsWith('<') ? `Server error (${res.status})` : text };
        }
      }
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update member role');
      }

      if (onMemberRoleUpdated) {
        onMemberRoleUpdated(targetId, 'admin');
      }
      if (refreshData) refreshData();

      setFeedback({
        type: 'success',
        text: `MEMBER [${member.memberId}] ELEVATED TO ADMINISTRATOR PRIVILEGE.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Member Deletion / Purge Confirmation
  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    const targetId = memberToDelete._id || memberToDelete.memberId;

    try {
      setActionLoading(targetId);
      const authToken = token || localStorage.getItem('vci_auth_token');
      const res = await fetch(getApiUrl(`/api/members/${targetId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const text = await res.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text.startsWith('<') ? `Server error (${res.status})` : text };
        }
      }
      if (!res.ok) {
        throw new Error(data.message || 'Failed to remove member dossier');
      }

      if (onMemberDeleted) {
        onMemberDeleted(targetId);
      }
      if (refreshData) refreshData();

      setFeedback({
        type: 'success',
        text: `DOSSIER [${memberToDelete.memberId}] PURGED FROM REGISTRY DATABASE.`,
      });
      setMemberToDelete(null);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border border-neutral-200 bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[9px] uppercase tracking-clinical text-neutral-400 block">
                MEMBERSHIP DIRECTORY // DISTRICT V-324
              </span>
              {isAdmin && (
                <span className="font-mono text-[8px] bg-neutral-900 text-white px-1.5 py-0.5 uppercase tracking-wider">
                  ADMIN CONSOLE ACTIVE
                </span>
              )}
            </div>
            <h2 className="text-base font-semibold uppercase tracking-wider text-neutral-900 mt-1">
              Member Master Dossier
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Comprehensive personnel records, blood donor classifications, and chapter administrative controls.
            </p>
          </div>

          <button
            onClick={openOnboardingModal}
            className="self-start md:self-auto flex items-center space-x-2 px-4 py-2 bg-neutral-900 hover:bg-VASAVI-blue text-white text-xs font-medium uppercase tracking-wider transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-VASAVI-gold" />
            <span>Induct New Member</span>
          </button>
        </div>

        {/* Feedback Alert Bar */}
        {feedback && (
          <div
            className={`mt-4 p-3 border font-mono text-[11px] flex items-center justify-between transition-all ${
              feedback.type === 'error'
                ? 'bg-red-50/50 border-red-200 text-red-700'
                : 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {feedback.type === 'error' ? (
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ID, name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-VASAVI-blue font-mono"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="font-mono text-[10px] text-neutral-400 uppercase mr-1">
              BLOOD:
            </span>
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedBlood(bg)}
                className={`px-2 py-1 font-mono text-[10px] border transition-colors ${
                  selectedBlood === bg
                    ? 'border-VASAVI-blue bg-VASAVI-blue text-white font-bold'
                    : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Member Table */}
      <div className="border border-neutral-200 bg-white overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-200 font-mono text-[9px] text-neutral-400 uppercase tracking-clinical bg-neutral-50/50">
              <th className="py-3 px-4">MEMBER ID</th>
              <th className="py-3 px-4">NAME & VOCATION</th>
              <th className="py-3 px-4">BLOOD</th>
              <th className="py-3 px-4">ROLE & CHAPTER</th>
              <th className="py-3 px-4">CONTACT</th>
              <th className="py-3 px-4">STATUS</th>
              {isAdmin && <th className="py-3 px-4">ACTIONS</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredMembers.length > 0 ? (
              filteredMembers.map((m) => {
                const isItemAdmin = m.role === 'admin';
                const memberKey = m._id || m.memberId;
                const isOperating = actionLoading === memberKey;

                return (
                  <tr
                    key={memberKey}
                    className="hover:bg-neutral-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-medium text-neutral-700">
                      {m.memberId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-900 flex items-center space-x-1.5">
                        <span>
                          {m.firstName} {m.lastName}
                        </span>
                        {isItemAdmin && (
                          <span className="font-mono text-[8px] bg-neutral-100 border border-neutral-300 text-neutral-700 px-1 py-0.2 tracking-tighter uppercase">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate max-w-[180px]">
                        {m.occupation || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 border border-neutral-200 font-mono text-[10px] font-bold text-neutral-800">
                        {m.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-neutral-900 font-medium capitalize">
                        {m.designation || (isItemAdmin ? 'Club Administrator' : 'Vasavi Member')}
                      </div>
                      <div className="font-mono text-[10px] text-neutral-400 truncate max-w-[180px]">
                        {m.club?.clubName || 'Vasavi Club Metropolitan'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-600">
                      <div>{m.email}</div>
                      <div className="text-neutral-400">{m.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 border border-neutral-200 font-mono text-[9px] text-neutral-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{m.status || 'Active'}</span>
                      </span>
                    </td>

                    {/* Admin Actions Column */}
                    {isAdmin && (
                      <td className="py-3.5 px-4 font-mono text-[10px]">
                        <div className="flex items-center space-x-3 whitespace-nowrap">
                          {!isItemAdmin ? (
                            <button
                              onClick={() => handlePromote(m)}
                              disabled={isOperating}
                              className="text-amber-600 hover:text-amber-700 font-mono text-[10px] font-medium tracking-wider transition-colors disabled:opacity-40"
                              title="Promote member to Administrator"
                            >
                              {isOperating ? '[ PROCESSING... ]' : '[ PROMOTE ]'}
                            </button>
                          ) : (
                            <span className="text-neutral-400 font-mono text-[9px] tracking-widest">
                              [ ADMIN ]
                            </span>
                          )}

                          <button
                            onClick={() => setMemberToDelete(m)}
                            disabled={isOperating}
                            className="text-red-600 hover:text-red-700 font-mono text-[10px] font-medium tracking-wider transition-colors disabled:opacity-40"
                            title="Purge member dossier from database"
                          >
                            [ REMOVE ]
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={isAdmin ? 7 : 6}
                  className="py-8 text-center text-neutral-400 font-mono text-xs"
                >
                  NO RECORDS FOUND MATCHING QUERY SPECIFICATION
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Minimalist Thin-Bordered Deletion Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-900 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-red-600 font-semibold flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>CONFIRM PROTOCOL // DOSSIER PURGE</span>
              </span>
              <span className="font-mono text-[9px] text-neutral-400">SPEC: SEC-DEL-01</span>
            </div>

            {/* Modal Body */}
            <div className="space-y-2 text-xs">
              <p className="font-semibold text-neutral-900">
                Are you certain you wish to purge the following member record?
              </p>

              <div className="bg-neutral-50 border border-neutral-200 p-3 font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">MEMBER ID:</span>
                  <span className="font-bold text-neutral-900">{memberToDelete.memberId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">NAME:</span>
                  <span className="text-neutral-900">
                    {memberToDelete.firstName} {memberToDelete.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">ELECTRONIC MAIL:</span>
                  <span className="text-neutral-900">{memberToDelete.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">CURRENT ROLE:</span>
                  <span className="text-neutral-900 uppercase font-semibold">
                    {memberToDelete.role || 'MEMBER'}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-neutral-500 font-mono tracking-tight pt-1 leading-relaxed">
                THIS WILL PERMANENTLY REMOVE THE DOSSIER FROM THE DISTRICT V-324 REGISTRY AND TERMINATE ACCESS TO THE PORTAL.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100 font-mono text-xs">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                disabled={actionLoading}
                className="px-3 py-1.5 border border-neutral-200 hover:border-neutral-900 text-neutral-700 text-xs font-mono uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                [ CANCEL ]
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-mono uppercase tracking-wider transition-colors flex items-center space-x-1 disabled:opacity-50"
              >
                <span>{actionLoading ? '[ PURGING... ]' : '[ CONFIRM PURGE ]'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
