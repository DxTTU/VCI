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
  const { isAdmin, isSuperAdmin, token } = useAuth();
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

  // Handle Role Assignment (Super Admin Only: [ MAKE ADMIN ] & [ REVOKE ADMIN ])
  const handleRoleChange = async (member, newRole) => {
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
        body: JSON.stringify({ role: newRole }),
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
        throw new Error(data.message || `Failed to update member role to '${newRole}'`);
      }

      if (onMemberRoleUpdated) {
        onMemberRoleUpdated(targetId, newRole);
      }
      if (refreshData) refreshData();

      setFeedback({
        type: 'success',
        text:
          newRole === 'admin'
            ? `MEMBER [${member.memberId}] ELEVATED TO ADMINISTRATOR PRIVILEGE.`
            : `MEMBER [${member.memberId}] ADMINISTRATOR PRIVILEGE REVOKED TO REGULAR MEMBER.`,
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
              <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400 block">
                MEMBERSHIP DIRECTORY // DISTRICT V-324
              </span>
              {isSuperAdmin ? (
                <span className="text-[10px] font-sans font-semibold bg-neutral-900 text-VASAVI-gold border border-neutral-700 px-2 py-0.5 uppercase tracking-wider">
                  SUPER ADMIN CONSOLE ACTIVE
                </span>
              ) : isAdmin ? (
                <span className="text-[10px] font-sans font-semibold bg-neutral-900 text-white px-2 py-0.5 uppercase tracking-wider">
                  ADMIN CONSOLE ACTIVE
                </span>
              ) : null}
            </div>
            <h2 className="text-base font-sans font-bold uppercase tracking-wider text-neutral-900 mt-1">
              Member Master Dossier
            </h2>
            <p className="text-xs font-sans font-normal text-neutral-500 mt-0.5">
              Comprehensive personnel records, blood donor classifications, and chapter administrative controls.
            </p>
          </div>

          <button
            onClick={openOnboardingModal}
            className="self-start md:self-auto flex items-center space-x-2 px-4 py-2 bg-neutral-900 hover:bg-VASAVI-blue text-white text-xs font-sans font-semibold uppercase tracking-wider transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-VASAVI-gold" />
            <span>Induct New Member</span>
          </button>
        </div>

        {/* Feedback Alert Bar */}
        {feedback && (
          <div
            className={`mt-4 p-3 border font-sans text-xs font-medium flex items-center justify-between transition-all ${
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
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-VASAVI-blue font-sans"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs font-sans font-medium text-neutral-400 uppercase mr-1">
              BLOOD:
            </span>
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedBlood(bg)}
                className={`px-2.5 py-1 font-sans text-xs font-semibold border transition-colors ${
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
        <table className="w-full text-left text-xs font-sans font-normal">
          <thead>
            <tr className="border-b border-neutral-200 text-[11px] font-sans font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-50/50">
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
                const isItemSuperAdmin = m.role === 'superadmin';
                const isItemAdmin = m.role === 'admin';
                const memberKey = m._id || m.memberId;
                const isOperating = actionLoading === memberKey;

                return (
                  <tr
                    key={memberKey}
                    className="hover:bg-neutral-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-sans font-semibold text-neutral-700">
                      {m.memberId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-sans font-bold text-neutral-900 flex items-center space-x-1.5">
                        <span>
                          {m.firstName} {m.lastName}
                        </span>
                        {isItemSuperAdmin && (
                          <span className="text-[9px] font-sans font-semibold bg-neutral-900 text-VASAVI-gold border border-neutral-700 px-1.5 py-0.5 uppercase">
                            SUPER ADMIN
                          </span>
                        )}
                        {isItemAdmin && !isItemSuperAdmin && (
                          <span className="text-[9px] font-sans font-semibold bg-neutral-100 border border-neutral-300 text-neutral-700 px-1.5 py-0.5 uppercase">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-sans font-normal text-neutral-500 truncate max-w-[180px]">
                        {m.occupation || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 border border-neutral-200 font-sans text-xs font-bold text-neutral-800">
                        {m.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-neutral-900 font-sans font-normal capitalize">
                        {m.designation ||
                          (isItemSuperAdmin
                            ? 'Super Administrator'
                            : isItemAdmin
                            ? 'Club Administrator'
                            : 'Vasavi Member')}
                      </div>
                      <div className="font-sans text-[11px] text-neutral-400 truncate max-w-[180px]">
                        {m.club?.clubName || 'Vasavi Club Metropolitan'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-sans text-xs text-neutral-600">
                      <div>{m.email}</div>
                      <div className="text-neutral-400">{m.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 border border-neutral-200 font-sans text-xs text-neutral-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{m.status || 'Active'}</span>
                      </span>
                    </td>

                    {/* Actions Column (Role Management strictly conditional on isSuperAdmin) */}
                    {isAdmin && (
                      <td className="py-3.5 px-4 font-sans text-xs font-semibold">
                        <div className="flex items-center space-x-3 whitespace-nowrap">
                          {/* Super Admin Role Assignment Controls */}
                          {isSuperAdmin && (
                            <>
                              {isItemSuperAdmin ? (
                                <span className="text-neutral-400 font-sans text-xs tracking-wider">
                                  [ ROOT ]
                                </span>
                              ) : isItemAdmin ? (
                                <button
                                  onClick={() => handleRoleChange(m, 'member')}
                                  disabled={isOperating}
                                  className="text-amber-700 hover:text-amber-800 font-sans text-xs font-semibold tracking-wider transition-colors disabled:opacity-40"
                                  title="Revoke Administrator privilege"
                                >
                                  {isOperating ? '[ PROCESSING... ]' : '[ REVOKE ADMIN ]'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRoleChange(m, 'admin')}
                                  disabled={isOperating}
                                  className="text-VASAVI-blue hover:text-VASAVI-blueDark font-sans text-xs font-semibold tracking-wider transition-colors disabled:opacity-40"
                                  title="Elevate member to Administrator"
                                >
                                  {isOperating ? '[ PROCESSING... ]' : '[ MAKE ADMIN ]'}
                                </button>
                              )}
                            </>
                          )}

                          {!isSuperAdmin && (
                            <span className="text-neutral-400 font-sans text-xs tracking-wider">
                              {isItemAdmin ? '[ ADMIN ]' : '[ MEMBER ]'}
                            </span>
                          )}

                          <button
                            onClick={() => setMemberToDelete(m)}
                            disabled={isOperating || isItemSuperAdmin}
                            className="text-red-600 hover:text-red-700 font-sans text-xs font-semibold tracking-wider transition-colors disabled:opacity-40"
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
                  className="py-8 text-center text-neutral-400 font-sans text-xs font-medium"
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
              <span className="font-sans text-xs uppercase tracking-wider text-red-600 font-semibold flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>CONFIRM PROTOCOL // DOSSIER PURGE</span>
              </span>
              <span className="text-[10px] font-sans font-medium text-neutral-400">SPEC: SEC-DEL-01</span>
            </div>

            {/* Modal Body */}
            <div className="space-y-2 text-xs font-sans">
              <p className="font-semibold text-neutral-900">
                Are you certain you wish to purge the following member record?
              </p>

              <div className="bg-neutral-50 border border-neutral-200 p-3 font-sans text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-400">MEMBER ID:</span>
                  <span className="font-bold text-neutral-900">{memberToDelete.memberId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">NAME:</span>
                  <span className="text-neutral-900 font-medium">
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

              <p className="text-xs text-neutral-500 font-sans tracking-tight pt-1 leading-relaxed">
                THIS WILL PERMANENTLY REMOVE THE DOSSIER FROM THE DISTRICT V-324 REGISTRY AND TERMINATE ACCESS TO THE PORTAL.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-100 font-sans text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                disabled={actionLoading}
                className="px-3 py-1.5 border border-neutral-200 hover:border-neutral-900 text-neutral-700 text-xs font-sans uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                [ CANCEL ]
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-sans uppercase tracking-wider transition-colors flex items-center space-x-1 disabled:opacity-50"
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
