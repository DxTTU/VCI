import React from 'react';

/**
 * Step 1: Basic Details
 * Focuses on core biometric and professional identity attributes.
 */
export default function StepBasicDetails({ formData, updateFormData, errors }) {
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const titles = ['Vasavite', 'Dr.', 'Mr.', 'Ms.', 'Mrs.'];
  const genders = ['Male', 'Female', 'Non-Binary', 'Other', 'Prefer Not to Disclose'];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs text-VASAVI-blue font-bold">01.0</span>
          <h2 className="text-sm font-semibold tracking-wider uppercase text-neutral-900">
            Personal Dossier Attributes
          </h2>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Record essential demographic identity data for Vasavi Club International official member roster.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="clinical-label">Salutation / Title</label>
          <select
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            className="clinical-input"
          >
            {titles.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* First Name */}
        <div className="md:col-span-2">
          <label className="clinical-label">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Rajesh"
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            className={`clinical-input ${errors.firstName ? 'border-red-500' : ''}`}
          />
          {errors.firstName && (
            <span className="font-mono text-[10px] text-red-600 block mt-1">
              {errors.firstName}
            </span>
          )}
        </div>

        {/* Last Name */}
        <div className="md:col-span-2">
          <label className="clinical-label">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Sundaram"
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            className={`clinical-input ${errors.lastName ? 'border-red-500' : ''}`}
          />
          {errors.lastName && (
            <span className="font-mono text-[10px] text-red-600 block mt-1">
              {errors.lastName}
            </span>
          )}
        </div>

        {/* Date of Birth */}
        <div className="md:col-span-3">
          <label className="clinical-label">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
            className={`clinical-input ${errors.dateOfBirth ? 'border-red-500' : ''}`}
          />
          {errors.dateOfBirth && (
            <span className="font-mono text-[10px] text-red-600 block mt-1">
              {errors.dateOfBirth}
            </span>
          )}
        </div>

        {/* Gender */}
        <div className="md:col-span-3">
          <label className="clinical-label">Gender Classification</label>
          <select
            value={formData.gender}
            onChange={(e) => updateFormData('gender', e.target.value)}
            className="clinical-input"
          >
            {genders.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Blood Group */}
        <div className="md:col-span-2">
          <label className="clinical-label">
            Blood Group <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.bloodGroup}
            onChange={(e) => updateFormData('bloodGroup', e.target.value)}
            className={`clinical-input font-mono ${errors.bloodGroup ? 'border-red-500' : ''}`}
          >
            <option value="">-- SELECT --</option>
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
          {errors.bloodGroup && (
            <span className="font-mono text-[10px] text-red-600 block mt-1">
              {errors.bloodGroup}
            </span>
          )}
          <span className="font-mono text-[9px] text-neutral-400 block mt-1">
            Required for Vasavi community blood donor registry
          </span>
        </div>

        {/* Occupation */}
        <div className="md:col-span-4">
          <label className="clinical-label">
            Professional Vocation / Occupation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Chartered Accountant, Software Architect, Surgeon"
            value={formData.occupation}
            onChange={(e) => updateFormData('occupation', e.target.value)}
            className={`clinical-input ${errors.occupation ? 'border-red-500' : ''}`}
          />
          {errors.occupation && (
            <span className="font-mono text-[10px] text-red-600 block mt-1">
              {errors.occupation}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
