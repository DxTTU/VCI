import React from 'react';
import { ShieldAlert, CheckCircle2, Award } from 'lucide-react';

/**
 * Step 4: Clinical Dossier Review & Confirmation
 * Modeled after The Ordinary's analytical packaging labels and formula specifications.
 */
export default function StepReviewSubmit({
  formData,
  errors,
  availableClubs,
  agreementChecked,
  setAgreementChecked,
}) {
  const selectedClub = availableClubs?.find((c) => c._id === formData.clubId);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs text-VASAVI-blue font-bold">04.0</span>
          <h2 className="text-sm font-semibold tracking-wider uppercase text-neutral-900">
            Dossier Verification & Formal Induction
          </h2>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Perform analytical audit of candidate profile before writing record to the Vasavi Clubs International registry.
        </p>
      </div>

      {/* Clinical Dossier Specification Sheet ("The Ordinary" Style) */}
      <div className="border border-neutral-300 bg-white p-6 relative">
        {/* Top Header */}
        <div className="border-b border-neutral-200 pb-4 mb-4 flex items-start justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-clinical text-neutral-400 block">
              REGISTRATION CERTIFICATE SPECIFICATION
            </span>
            <h3 className="text-base font-semibold text-neutral-900 tracking-tight mt-0.5">
              {formData.title} {formData.firstName} {formData.lastName}
            </h3>
            <span className="font-mono text-[10px] text-VASAVI-blue uppercase">
              ASSIGNED ROLE: {formData.role}
            </span>
          </div>

          <div className="border border-neutral-200 px-3 py-1.5 text-right font-mono text-[9px]">
            <div className="text-neutral-400">MEMBERSHIP CLASS</div>
            <div className="font-semibold text-neutral-900">{formData.membershipType}</div>
          </div>
        </div>

        {/* Analytical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
          <div className="flex items-baseline justify-between border-b border-neutral-100 py-1.5">
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
              BLOOD GROUP
            </span>
            <span className="font-mono font-bold text-neutral-900">{formData.bloodGroup || 'N/A'}</span>
          </div>

          <div className="flex items-baseline justify-between border-b border-neutral-100 py-1.5">
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
              DATE OF BIRTH
            </span>
            <span className="font-mono text-neutral-800">{formData.dateOfBirth || 'N/A'}</span>
          </div>

          <div className="flex items-baseline justify-between border-b border-neutral-100 py-1.5">
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
              VOCATION / FIELD
            </span>
            <span className="text-neutral-800 font-medium truncate max-w-[200px]">
              {formData.occupation || 'N/A'}
            </span>
          </div>

          <div className="flex items-baseline justify-between border-b border-neutral-100 py-1.5">
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
              ELECTRONIC MAIL
            </span>
            <span className="font-mono text-neutral-900">{formData.email || 'N/A'}</span>
          </div>

          <div className="flex items-baseline justify-between border-b border-neutral-100 py-1.5">
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
              TELEPHONE
            </span>
            <span className="font-mono text-neutral-800">{formData.phone || 'N/A'}</span>
          </div>

          <div className="flex items-baseline justify-between border-b border-neutral-100 py-1.5">
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
              SPONSOR ID
            </span>
            <span className="font-mono text-neutral-800">
              {formData.sponsorMemberId || 'DIRECT CHARTER'}
            </span>
          </div>

          <div className="md:col-span-2 flex items-baseline justify-between border-b border-neutral-100 py-1.5">
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
              MUNICIPAL RESIDENCE
            </span>
            <span className="text-neutral-800">
              {formData.address}, {formData.city}, {formData.state} - {formData.postalCode}
            </span>
          </div>

          <div className="md:col-span-2 flex items-baseline justify-between py-1.5 bg-neutral-50 px-2 mt-1">
            <span className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
              AFFILIATED CHAPTER
            </span>
            <span className="font-semibold text-VASAVI-blue">
              {selectedClub?.clubName || 'Vasavi Club of Metropolitan Central (District V-324)'}
            </span>
          </div>
        </div>

        {/* Vasavi Code of Ethics Clinical Affirmation */}
        <div className="mt-6 pt-4 border-t border-neutral-200">
          <label className="flex items-start space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreementChecked}
              onChange={(e) => setAgreementChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-VASAVI-blue border-neutral-300 rounded-none focus:ring-0"
            />
            <span className="text-xs text-neutral-600 leading-relaxed">
              I affirm adherence to the{' '}
              <strong className="text-neutral-900 font-semibold">
                Vasavi Clubs International Constitution & Code of Ethics
              </strong>{' '}
              and certify that all submitted demographic and vocational metrics are accurate.
            </span>
          </label>
          {errors.agreement && (
            <span className="font-mono text-[10px] text-red-600 block mt-1.5 pl-7">
              {errors.agreement}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
