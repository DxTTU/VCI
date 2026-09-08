import React from 'react';

/**
 * Step 2: Contact Info
 * Telecommunications and postal residential address specifications.
 */
export default function StepContactInfo({ formData, updateFormData, errors }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs text-VASAVI-blue font-bold">02.0</span>
          <h2 className="text-sm font-semibold tracking-wider uppercase text-neutral-900">
            Contact & Geospatial Registry
          </h2>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Provide telephonic, digital and physical coordinates for official correspondence and district notices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div>
          <label className="clinical-label">
            Electronic Mail (Email) <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="e.g. rajesh.sundaram@gmail.com"
            value={formData.email}
            onChange={(e) => updateFormData('email', e.target.value)}
            className={`clinical-input ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email ? (
            <span className="font-mono text-[10px] text-red-600 block mt-1">
              {errors.email}
            </span>
          ) : (
            <span className="font-mono text-[9px] text-neutral-400 block mt-1">
              Serves as primary login & credential dispatch address
            </span>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="clinical-label">
            Telephonic Contact <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            placeholder="e.g. +91 98401 23456"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            className={`clinical-input ${errors.phone ? 'border-red-500' : ''}`}
          />
          {errors.phone && (
            <span className="font-mono text-[10px] text-red-600 block mt-1">
              {errors.phone}
            </span>
          )}
        </div>

        {/* Street Address */}
        <div className="md:col-span-2">
          <label className="clinical-label">
            Residential Address (Street & Door Number) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Flat 3B, Sunshine Apartments, 14 Sterling Road"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
            className={`clinical-input ${errors.address ? 'border-red-500' : ''}`}
          />
          {errors.address && (
            <span className="font-mono text-[10px] text-red-600 block mt-1">
              {errors.address}
            </span>
          )}
        </div>

        {/* City */}
        <div>
          <label className="clinical-label">
            City / Municipality <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Chennai"
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            className={`clinical-input ${errors.city ? 'border-red-500' : ''}`}
          />
          {errors.city && (
            <span className="font-mono text-[10px] text-red-600 block mt-1">
              {errors.city}
            </span>
          )}
        </div>

        {/* State */}
        <div>
          <label className="clinical-label">State / Federal Territory</label>
          <input
            type="text"
            placeholder="e.g. Tamil Nadu"
            value={formData.state}
            onChange={(e) => updateFormData('state', e.target.value)}
            className="clinical-input"
          />
        </div>

        {/* Postal Code */}
        <div>
          <label className="clinical-label">
            Postal / PIN Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 600034"
            value={formData.postalCode}
            onChange={(e) => updateFormData('postalCode', e.target.value)}
            className={`clinical-input font-mono ${errors.postalCode ? 'border-red-500' : ''}`}
          />
          {errors.postalCode && (
            <span className="font-mono text-[10px] text-red-600 block mt-1">
              {errors.postalCode}
            </span>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="clinical-label">Sovereignty / Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => updateFormData('country', e.target.value)}
            className="clinical-input"
          />
        </div>
      </div>
    </div>
  );
}
