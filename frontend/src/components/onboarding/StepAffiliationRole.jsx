import React from 'react';
import { Award, Shield, CheckCircle2 } from 'lucide-react';

/**
 * Step 3: Vasavi Club Affiliation & Role
 * Institutional placement, membership type, and official office assignment.
 */
export default function StepAffiliationRole({ formData, updateFormData, errors, availableClubs }) {
  const membershipTypes = [
    {
      id: 'Regular',
      name: 'Regular Member',
      code: 'TYPE-REG',
      desc: 'Active member with full voting privileges and community service commitments.',
    },
    {
      id: 'Associate',
      name: 'Associate Member',
      code: 'TYPE-ASC',
      desc: 'Primary membership in another Vasavi Club; holds secondary local affiliation.',
    },
    {
      id: 'Honorary',
      name: 'Honorary Member',
      code: 'TYPE-HON',
      desc: 'Distinguished individual honored by the club for outstanding civic deeds.',
    },
    {
      id: 'Life',
      name: 'Life Member',
      code: 'TYPE-LIF',
      desc: 'Recognized for decades of service, confirmed by Vasavi Clubs International HQ.',
    },
  ];

  const roles = [
    'Vasavi Member',
    'Club President',
    'Club Secretary',
    'Club Treasurer',
    'First Vice President',
    'Second Vice President',
    'Director',
    'Committee Chair',
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs text-VASAVI-blue font-bold">03.0</span>
          <h2 className="text-sm font-semibold tracking-wider uppercase text-neutral-900">
            Institutional Affiliation & Cabinet Role
          </h2>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Specify local chapter designation, operational classification, and governance assignments.
        </p>
      </div>

      <div className="space-y-5">
        {/* Designated Club */}
        <div>
          <label className="clinical-label">
            Target Vasavi Club Chapter <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.clubId}
            onChange={(e) => updateFormData('clubId', e.target.value)}
            className={`clinical-input ${errors.clubId ? 'border-red-500' : ''}`}
          >
            <option value="">-- SELECT CHAPTER ENTITY --</option>
            {availableClubs?.length > 0 ? (
              availableClubs.map((club) => (
                <option key={club._id} value={club._id}>
                  {club.clubName} ({club.clubNumber} / {club.district})
                </option>
              ))
            ) : (
              <>
                <option value="65e8a1f2b34a1c0012345678">
                  Vasavi Club of Metropolitan Central (VC-324A-01 / District V-324)
                </option>
                <option value="65e8a1f2b34a1c0012345679">
                  Vasavi Club of Marina Bay (VC-324A-02 / District V-324)
                </option>
                <option value="65e8a1f2b34a1c0012345680">
                  Vasavi Club of Temple City (VC-324B-03 / District V-324)
                </option>
              </>
            )}
          </select>
          {errors.clubId && (
            <span className="font-mono text-[10px] text-red-600 block mt-1">
              {errors.clubId}
            </span>
          )}
        </div>

        {/* Membership Classification (Radio Cards) */}
        <div>
          <label className="clinical-label">Membership Classification Tier</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
            {membershipTypes.map((tier) => {
              const isSelected = formData.membershipType === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => updateFormData('membershipType', tier.id)}
                  className={`p-3.5 border cursor-pointer transition-all duration-150 relative ${
                    isSelected
                      ? 'border-VASAVI-blue bg-neutral-50/70 ring-1 ring-VASAVI-blue'
                      : 'border-neutral-200 bg-white hover:border-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-900 tracking-wide">
                      {tier.name}
                    </span>
                    <span
                      className={`font-mono text-[9px] px-1.5 py-0.5 border ${
                        isSelected
                          ? 'border-VASAVI-blue text-VASAVI-blue font-bold'
                          : 'border-neutral-200 text-neutral-400'
                      }`}
                    >
                      {tier.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-2 leading-relaxed">
                    {tier.desc}
                  </p>
                  {isSelected && (
                    <div className="mt-2.5 flex items-center space-x-1.5 text-VASAVI-blue font-mono text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-VASAVI-gold"></span>
                      <span>ACTIVE SELECTION</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Role in Chapter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="clinical-label">
              Initial Office / Chapter Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => updateFormData('role', e.target.value)}
              className="clinical-input"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <span className="font-mono text-[9px] text-neutral-400 block mt-1">
              Select PST officer role or regular Lion Member
            </span>
          </div>

          <div>
            <label className="clinical-label">Induction Sponsor Member ID (If Any)</label>
            <input
              type="text"
              placeholder="e.g. L-100201"
              value={formData.sponsorMemberId}
              onChange={(e) => updateFormData('sponsorMemberId', e.target.value.toUpperCase())}
              className="clinical-input font-mono"
            />
            <span className="font-mono text-[9px] text-neutral-400 block mt-1">
              Member ID of the sponsoring Vasavite in good standing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
