import React, { useState, useEffect } from 'react';
import { Building2, Calendar, MapPin, Mail, Users, Plus, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

/**
 * Club Master Page / Component
 * Modeled strictly after "The Ordinary" clinical design philosophy:
 * - High contrast black/white layout
 * - Ultra-thin borders (border-gray-200)
 * - Raw, uppercase monospace typography
 * - [ ADD NEW CLUB ] button restricted strictly to Super Admin role
 *   with subtle Lions Gold (#F2A900) hover state and thin border
 */
export default function ClubMasterPage({ clubs = [], onClubCreated, onClubDeleted }) {
  const { isSuperAdmin, token } = useAuth();
  const [clubList, setClubList] = useState(clubs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Deletion modal state
  const [clubToDelete, setClubToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Form input state
  const [formData, setFormData] = useState({
    clubName: '',
    clubId: '',
    charterDate: '',
    location: '',
    email: '',
    meetingSchedule: '',
  });

  // Keep local club state synchronized with parent props
  useEffect(() => {
    if (clubs && clubs.length > 0) {
      setClubList(clubs);
    }
  }, [clubs]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!formData.clubName.trim() || !formData.clubId.trim() || !formData.charterDate || !formData.email.trim()) {
      setFormError('CLUB NAME, CLUB ID, CHARTER DATE, AND EMAIL ARE MANDATORY.');
      return;
    }

    try {
      setIsSubmitting(true);
      const authToken = token || localStorage.getItem('vci_auth_token');

      const response = await fetch(getApiUrl('/api/clubs'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      const text = await response.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text.startsWith('<') ? `Server error (${response.status})` : text };
        }
      }

      if (!response.ok) {
        throw new Error(data.message || `Failed to create chartered club (${response.status})`);
      }

      const createdClub = data.data;

      // Instantly append new club card to UI without requiring page refresh
      setClubList((prev) => [createdClub, ...prev]);
      if (onClubCreated) {
        onClubCreated(createdClub);
      }

      // Close modal and reset form
      setIsModalOpen(false);
      setFormData({
        clubName: '',
        clubId: '',
        charterDate: '',
        location: '',
        email: '',
        meetingSchedule: '',
      });

      setFeedback(`CHARTER ENTITY [${createdClub.clubNumber}] SUCCESSFULLY REGISTERED IN REGISTRY.`);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setFormError(err.message || 'Operation failed. Please verify submission parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!clubToDelete) return;
    setDeleteError(null);

    try {
      setIsDeleting(true);
      const authToken = token || localStorage.getItem('vci_auth_token');
      const targetIdentifier = clubToDelete._id || clubToDelete.clubNumber;

      const response = await fetch(getApiUrl(`/api/clubs/${targetIdentifier}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      const text = await response.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text.startsWith('<') ? `Server error (${response.status})` : text };
        }
      }

      if (!response.ok) {
        throw new Error(data.message || `Failed to remove club (${response.status})`);
      }

      // Instantly filter out the removed club from the React state array
      setClubList((prev) =>
        prev.filter((c) => c._id !== clubToDelete._id && c.clubNumber !== clubToDelete.clubNumber)
      );

      if (onClubDeleted) {
        onClubDeleted(clubToDelete);
      }

      setFeedback(`CHARTERED ENTITY [${clubToDelete.clubNumber}] SUCCESSFULLY DISBANDED AND REMOVED.`);
      setTimeout(() => setFeedback(null), 5000);
      setClubToDelete(null);
    } catch (err) {
      setDeleteError(err.message || 'Failed to disband club. Please verify network and permissions.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border border-neutral-200 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-sans text-[10px] uppercase tracking-wider text-neutral-400 block font-medium">
                INSTITUTIONAL DIRECTORY // DISTRICT V-324
              </span>
              {isSuperAdmin && (
                <span className="font-sans text-[9px] bg-neutral-900 text-VASAVI-gold border border-neutral-700 px-1.5 py-0.5 uppercase tracking-wider font-semibold">
                  SUPER ADMIN
                </span>
              )}
            </div>
            <h2 className="text-base font-sans font-bold uppercase tracking-wider text-neutral-900 mt-1">
              Club Master Registry
            </h2>
            <p className="text-xs font-sans font-normal text-neutral-500 mt-0.5">
              Official chartered clubs operating under Vasavi Clubs International (District V-324) jurisdiction.
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start sm:self-center">
            <div className="font-sans text-xs font-semibold text-VASAVI-blue border border-neutral-200 px-3 py-1.5 bg-neutral-50/50">
              TOTAL CLUBS: {clubList.length}
            </div>

            {/* Restricted to Super Admin role: Clean geometric sans button with subtle Lions Gold (#F2A900) hover */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="font-sans text-xs font-medium uppercase tracking-wider px-3.5 py-1.5 border border-neutral-300 hover:border-VASAVI-gold hover:text-VASAVI-goldDark text-neutral-900 transition-all duration-150 bg-white flex items-center space-x-1.5 cursor-pointer select-none"
                title="Super Admin: Induct new club entity"
              >
                <Plus className="w-3.5 h-3.5 text-VASAVI-gold" />
                <span>[ ADD NEW CLUB ]</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div className="mt-4 p-3 border border-emerald-200 bg-emerald-50/50 text-emerald-800 font-sans text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{feedback}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-neutral-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubList.map((club) => (
          <div
            key={club._id || club.clubNumber}
            className="border border-neutral-200 bg-white p-6 space-y-4 hover:border-neutral-400 transition-colors text-left"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="font-sans text-[11px] text-VASAVI-blue font-semibold">
                {club.clubNumber}
              </span>
              <div className="flex items-center space-x-2">
                <span className="font-sans text-[10px] px-2 py-0.5 border border-neutral-200 text-neutral-600 uppercase font-medium">
                  {club.status || 'Active'}
                </span>
                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setClubToDelete(club);
                      setDeleteError(null);
                    }}
                    className="font-sans text-[10px] uppercase tracking-wider text-neutral-400 hover:text-red-700 hover:border-red-300 border border-neutral-200 px-1.5 py-0.5 transition-colors cursor-pointer font-medium"
                    title={`Remove ${club.clubName}`}
                  >
                    [ REMOVE ]
                  </button>
                )}
              </div>
            </div>

            {/* Club Name & District */}
            <div>
              <h3 className="text-sm font-sans font-bold text-neutral-900 leading-snug">
                {club.clubName}
              </h3>
              <p className="font-sans text-[11px] text-neutral-400 tracking-wider uppercase mt-1">
                {club.district || 'District V-324'} // {club.multipleDistrict || 'VCI 324'}
              </p>
            </div>

            {/* Details */}
            <div className="space-y-2 text-xs font-sans font-normal text-neutral-600 border-t border-neutral-100 pt-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                <span>
                  Charter: {club.charterDate ? new Date(club.charterDate).toLocaleDateString() : '1984-06-15'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                <span className="truncate">
                  {club.location || club.meetingSchedule?.venue || 'Vasavi Cultural Hall'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                <span className="font-sans text-xs truncate">
                  {club.contactEmail}
                </span>
              </div>
            </div>

            {/* Footer Stats */}
            <div className="border-t border-neutral-100 pt-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-VASAVI-gold" />
                <span className="font-sans text-xs text-neutral-700 font-medium">
                  {club.totalMembers || 0} Members
                </span>
              </div>
              <span className="font-sans text-[10px] text-neutral-400 uppercase font-medium">
                {typeof club.meetingSchedule === 'string'
                  ? club.meetingSchedule
                  : club.meetingSchedule?.frequency || 'Bi-Weekly'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* "The Ordinary" Clinical Add Club Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 max-w-lg w-full p-6 sm:p-8 space-y-5 text-left animate-in fade-in zoom-in-95 duration-150 shadow-none">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="font-sans text-[10px] uppercase tracking-wider text-neutral-400 block font-medium">
                  CHARTER REGISTRATION // DISTRICT V-324
                </span>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 mt-0.5">
                  Induct New Chartered Club Entity
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="font-sans text-xs text-neutral-400 hover:text-neutral-900 px-1 py-0.5"
                title="Close"
              >
                [ X ]
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-3 border border-red-200 bg-red-50 text-red-700 font-sans text-xs flex items-center space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                <span>[ERR // VALIDATION] {formError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-sans">
              {/* Input 1: Club Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1 font-medium">
                  CLUB NAME // OFFICIAL TITLE <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vasavi Club of Cyber City"
                  value={formData.clubName}
                  onChange={(e) => handleInputChange('clubName', e.target.value)}
                  className="w-full text-xs font-sans p-2.5 border border-gray-200 focus:border-VASAVI-blue outline-none bg-neutral-50/50 focus:bg-white transition-colors"
                />
              </div>

              {/* Grid: Club ID & Charter Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Input 2: Club ID */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1 font-medium">
                    CLUB ID (SPECIFICATION) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VC-324A-02"
                    value={formData.clubId}
                    onChange={(e) => handleInputChange('clubId', e.target.value)}
                    className="w-full text-xs font-sans uppercase p-2.5 border border-gray-200 focus:border-VASAVI-blue outline-none bg-neutral-50/50 focus:bg-white transition-colors"
                  />
                </div>

                {/* Input 3: Charter Date */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1 font-medium">
                    CHARTER DATE <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.charterDate}
                    onChange={(e) => handleInputChange('charterDate', e.target.value)}
                    className="w-full text-xs font-sans p-2.5 border border-gray-200 focus:border-VASAVI-blue outline-none bg-neutral-50/50 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Input 4: Location */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1 font-medium">
                  LOCATION // JURISDICTION & VENUE <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad, Telangana"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full text-xs font-sans p-2.5 border border-gray-200 focus:border-VASAVI-blue outline-none bg-neutral-50/50 focus:bg-white transition-colors"
                />
              </div>

              {/* Input 5: Email */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1 font-medium">
                  OFFICIAL CONTACT EMAIL <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="secretariat@vasavicybercity.org"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full text-xs font-sans p-2.5 border border-gray-200 focus:border-VASAVI-blue outline-none bg-neutral-50/50 focus:bg-white transition-colors"
                />
              </div>

              {/* Input 6: Meeting Schedule */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1 font-medium">
                  MEETING SCHEDULE // FREQUENCY <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. First and Third Thursdays or Bi-Weekly"
                  value={formData.meetingSchedule}
                  onChange={(e) => handleInputChange('meetingSchedule', e.target.value)}
                  className="w-full text-xs font-sans p-2.5 border border-gray-200 focus:border-VASAVI-blue outline-none bg-neutral-50/50 focus:bg-white transition-colors"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-200 hover:border-neutral-900 text-neutral-700 text-xs font-sans uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer font-medium"
                >
                  [ CANCEL ]
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-neutral-900 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-sans uppercase tracking-wider transition-colors disabled:opacity-40 flex items-center space-x-1.5 cursor-pointer font-medium"
                >
                  <span>{isSubmitting ? '[ INDUCTING... ]' : '[ CONFIRM & INDUCT CLUB ]'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* "The Ordinary" Clinical Disband / Remove Confirmation Modal */}
      {clubToDelete && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 max-w-md w-full p-6 space-y-4 text-left animate-in fade-in zoom-in-95 duration-150 shadow-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div>
                <span className="font-sans text-[10px] uppercase tracking-wider text-red-700 block font-medium">
                  TERMINATION ACTION // SUPER ADMIN ONLY
                </span>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 mt-0.5 font-sans">
                  CONFIRM DELETION OF CHARTERED ENTITY?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isDeleting) {
                    setClubToDelete(null);
                    setDeleteError(null);
                  }
                }}
                disabled={isDeleting}
                className="font-sans text-xs text-neutral-400 hover:text-neutral-900 px-1 py-0.5 disabled:opacity-40"
                title="Close"
              >
                [ X ]
              </button>
            </div>

            {/* Error Message */}
            {deleteError && (
              <div className="p-3 border border-red-200 bg-red-50 text-red-700 font-sans text-xs flex items-center space-x-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                <span>[ERR // PURGE] {deleteError}</span>
              </div>
            )}

            {/* Target Specification */}
            <div className="p-3 border border-neutral-100 bg-neutral-50/50 font-sans text-xs space-y-1">
              <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">
                TARGET CHARTER REGISTRY:
              </div>
              <div className="font-semibold text-neutral-900 text-sm">
                {clubToDelete.clubName}
              </div>
              <div className="text-neutral-500 text-[11px]">
                ID: <span className="font-bold text-neutral-800">{clubToDelete.clubNumber}</span> // DISTRICT: {clubToDelete.district || 'District V-324'}
              </div>
            </div>

            <p className="font-sans text-xs text-neutral-600 leading-relaxed">
              Are you sure you wish to permanently remove this chartered entity from the District V-324 registry? This destructive action cannot be undone.
            </p>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-gray-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setClubToDelete(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-200 hover:border-neutral-900 text-neutral-700 text-xs font-sans uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer font-medium"
              >
                [ CANCEL ]
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 border border-red-700 bg-red-700 hover:bg-red-800 text-white text-xs font-sans uppercase tracking-wider transition-colors disabled:opacity-40 flex items-center space-x-1.5 cursor-pointer font-medium"
              >
                <span>{isDeleting ? '[ REMOVING... ]' : '[ CONFIRM REMOVAL ]'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
