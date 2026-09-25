import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

/**
 * DRZ Master Component
 * Dedicated hierarchy management for Districts, Regions, and Zones.
 * Adheres strictly to "The Ordinary" clinical design philosophy:
 * - Stark white backgrounds, generous padding, and ultra-thin borders (border-neutral-200)
 * - Raw, uppercase monospace typography for labels, tabs, and action buttons
 * - Two-column responsive grid: forms on left (col-span-4), master listings on right (col-span-8)
 * - Text-only buttons with subtle Lions Blue (#00338D) accents on active states
 */
export default function DRZMasterPage() {
  const { token } = useAuth();
  const authToken = token || localStorage.getItem('vci_auth_token');

  // Master Data State
  const [districts, setDistricts] = useState([]);
  const [regions, setRegions] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active view & accordion state
  const [activeTab, setActiveTab] = useState('districts'); // 'districts' | 'regions' | 'zones'
  const [activeFormTab, setActiveFormTab] = useState('district'); // 'district' | 'region' | 'zone'

  // Notification / Feedback state
  const [feedback, setFeedback] = useState(null);

  // Form State: District
  const [districtForm, setDistrictForm] = useState({
    id: '',
    name: '',
    code: '',
    description: '',
  });
  const [isSubmittingDistrict, setIsSubmittingDistrict] = useState(false);

  // Form State: Region
  const [regionForm, setRegionForm] = useState({
    id: '',
    districtId: '',
    name: '',
    code: '',
    description: '',
  });
  const [isSubmittingRegion, setIsSubmittingRegion] = useState(false);

  // Form State: Zone
  const [zoneForm, setZoneForm] = useState({
    id: '',
    regionId: '',
    name: '',
    code: '',
    description: '',
  });
  const [isSubmittingZone, setIsSubmittingZone] = useState(false);

  // Deletion Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: '', // 'district' | 'region' | 'zone'
    item: null,
    isDeleting: false,
    error: null,
  });

  // Fetch all DRZ datasets
  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [distRes, regRes, zoneRes] = await Promise.all([
        fetch(getApiUrl('/api/drz/districts')),
        fetch(getApiUrl('/api/drz/regions')),
        fetch(getApiUrl('/api/drz/zones')),
      ]);

      const distData = await distRes.json();
      const regData = await regRes.json();
      const zoneData = await zoneRes.json();

      if (distData.success) setDistricts(distData.data || []);
      if (regData.success) setRegions(regData.data || []);
      if (zoneData.success) setZones(zoneData.data || []);
    } catch (err) {
      console.error('[DRZ // FETCH ERROR]', err);
      setFeedback({ type: 'error', message: 'Failed to retrieve DRZ hierarchy records from server.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Clear notification banner after 5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // -------------------------------------------------------------
  // DISTRICT FORM HANDLERS
  // -------------------------------------------------------------
  const handleSelectDistrict = (id) => {
    if (!id) {
      setDistrictForm({ id: '', name: '', code: '', description: '' });
      return;
    }
    const dist = districts.find((d) => d._id === id);
    if (dist) {
      setDistrictForm({
        id: dist._id,
        name: dist.name,
        code: dist.code,
        description: dist.description || '',
      });
    }
  };

  const handleSaveDistrict = async (isUpdate = false) => {
    if (!districtForm.name.trim() || !districtForm.code.trim()) {
      setFeedback({ type: 'error', message: 'District Name and Code are mandatory fields.' });
      return;
    }

    try {
      setIsSubmittingDistrict(true);
      const url = isUpdate
        ? getApiUrl(`/api/drz/districts/${districtForm.id}`)
        : getApiUrl('/api/drz/districts');
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: districtForm.name.trim(),
          code: districtForm.code.trim(),
          description: districtForm.description?.trim(),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Operation failed');

      setFeedback({
        type: 'success',
        message: result.message || `District ${isUpdate ? 'updated' : 'created'} successfully.`,
      });
      setDistrictForm({ id: '', name: '', code: '', description: '' });
      fetchData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmittingDistrict(false);
    }
  };

  // -------------------------------------------------------------
  // REGION FORM HANDLERS
  // -------------------------------------------------------------
  const handleSelectRegion = (id) => {
    if (!id) {
      setRegionForm({ id: '', districtId: '', name: '', code: '', description: '' });
      return;
    }
    const reg = regions.find((r) => r._id === id);
    if (reg) {
      setRegionForm({
        id: reg._id,
        districtId: reg.districtId?._id || reg.districtId || '',
        name: reg.name,
        code: reg.code,
        description: reg.description || '',
      });
    }
  };

  const handleSaveRegion = async (isUpdate = false) => {
    if (!regionForm.name.trim() || !regionForm.code.trim() || !regionForm.districtId) {
      setFeedback({ type: 'error', message: 'Region Name, Code, and Parent District are mandatory.' });
      return;
    }

    try {
      setIsSubmittingRegion(true);
      const url = isUpdate
        ? getApiUrl(`/api/drz/regions/${regionForm.id}`)
        : getApiUrl('/api/drz/regions');
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: regionForm.name.trim(),
          code: regionForm.code.trim(),
          districtId: regionForm.districtId,
          description: regionForm.description?.trim(),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Operation failed');

      setFeedback({
        type: 'success',
        message: result.message || `Region ${isUpdate ? 'updated' : 'created'} successfully.`,
      });
      setRegionForm({ id: '', districtId: '', name: '', code: '', description: '' });
      fetchData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmittingRegion(false);
    }
  };

  // -------------------------------------------------------------
  // ZONE FORM HANDLERS
  // -------------------------------------------------------------
  const handleSelectZone = (id) => {
    if (!id) {
      setZoneForm({ id: '', regionId: '', name: '', code: '', description: '' });
      return;
    }
    const zn = zones.find((z) => z._id === id);
    if (zn) {
      setZoneForm({
        id: zn._id,
        regionId: zn.regionId?._id || zn.regionId || '',
        name: zn.name,
        code: zn.code,
        description: zn.description || '',
      });
    }
  };

  const handleSaveZone = async (isUpdate = false) => {
    if (!zoneForm.name.trim() || !zoneForm.code.trim() || !zoneForm.regionId) {
      setFeedback({ type: 'error', message: 'Zone Name, Code, and Parent Region are mandatory.' });
      return;
    }

    try {
      setIsSubmittingZone(true);
      const url = isUpdate
        ? getApiUrl(`/api/drz/zones/${zoneForm.id}`)
        : getApiUrl('/api/drz/zones');
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: zoneForm.name.trim(),
          code: zoneForm.code.trim(),
          regionId: zoneForm.regionId,
          description: zoneForm.description?.trim(),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Operation failed');

      setFeedback({
        type: 'success',
        message: result.message || `Zone ${isUpdate ? 'updated' : 'created'} successfully.`,
      });
      setZoneForm({ id: '', regionId: '', name: '', code: '', description: '' });
      fetchData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmittingZone(false);
    }
  };

  // -------------------------------------------------------------
  // EDIT TRIGGER FROM DATA TABLE
  // -------------------------------------------------------------
  const handleEditItem = (type, item) => {
    if (type === 'district') {
      setActiveFormTab('district');
      setDistrictForm({
        id: item._id,
        name: item.name,
        code: item.code,
        description: item.description || '',
      });
    } else if (type === 'region') {
      setActiveFormTab('region');
      setRegionForm({
        id: item._id,
        districtId: item.districtId?._id || item.districtId || '',
        name: item.name,
        code: item.code,
        description: item.description || '',
      });
    } else if (type === 'zone') {
      setActiveFormTab('zone');
      setZoneForm({
        id: item._id,
        regionId: item.regionId?._id || item.regionId || '',
        name: item.name,
        code: item.code,
        description: item.description || '',
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // -------------------------------------------------------------
  // DELETE PURGE HANDLER
  // -------------------------------------------------------------
  const handleConfirmDelete = async () => {
    const { type, item } = deleteModal;
    if (!type || !item) return;

    try {
      setDeleteModal((prev) => ({ ...prev, isDeleting: true, error: null }));
      const endpoint =
        type === 'district'
          ? `/api/drz/districts/${item._id}`
          : type === 'region'
          ? `/api/drz/regions/${item._id}`
          : `/api/drz/zones/${item._id}`;

      const res = await fetch(getApiUrl(endpoint), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Deletion failed.');

      setFeedback({
        type: 'success',
        message: result.message || `${type.toUpperCase()} entity purged successfully.`,
      });

      // Reset corresponding form if the deleted item was currently selected
      if (type === 'district' && districtForm.id === item._id) {
        setDistrictForm({ id: '', name: '', code: '', description: '' });
      } else if (type === 'region' && regionForm.id === item._id) {
        setRegionForm({ id: '', districtId: '', name: '', code: '', description: '' });
      } else if (type === 'zone' && zoneForm.id === item._id) {
        setZoneForm({ id: '', regionId: '', name: '', code: '', description: '' });
      }

      setDeleteModal({ isOpen: false, type: '', item: null, isDeleting: false, error: null });
      fetchData();
    } catch (err) {
      setDeleteModal((prev) => ({ ...prev, isDeleting: false, error: err.message }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Protocol Header */}
      <div className="border border-neutral-200 bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-VASAVI-blue"></span>
            <span className="text-xs font-sans font-medium tracking-wider text-neutral-400 uppercase">
              SPEC: VCI-GEO-STRUCT // LEVEL 01-03 CLUSTERS
            </span>
          </div>
          <h2 className="text-xl font-sans font-bold uppercase tracking-wide text-neutral-900 mt-1">
            DRZ Master Hierarchy Console
          </h2>
          <p className="text-xs text-neutral-500 font-sans font-normal mt-0.5">
            Unified administrative data-entry and listings for Districts, Regions, and Zones.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-sans font-medium">
          <div className="border border-neutral-200 px-3 py-1.5 bg-neutral-50 flex items-center space-x-2">
            <span className="text-neutral-400">DISTRICTS:</span>
            <span className="font-bold text-neutral-900">{districts.length}</span>
          </div>
          <div className="border border-neutral-200 px-3 py-1.5 bg-neutral-50 flex items-center space-x-2">
            <span className="text-neutral-400">REGIONS:</span>
            <span className="font-bold text-neutral-900">{regions.length}</span>
          </div>
          <div className="border border-neutral-200 px-3 py-1.5 bg-neutral-50 flex items-center space-x-2">
            <span className="text-neutral-400">ZONES:</span>
            <span className="font-bold text-neutral-900">{zones.length}</span>
          </div>
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="border border-neutral-200 hover:border-VASAVI-blue px-3 py-1.5 text-neutral-600 hover:text-VASAVI-blue transition-colors flex items-center space-x-1.5 uppercase text-xs font-sans font-semibold"
            title="Refresh DRZ Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>[ SYNC ]</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`border p-4 text-xs font-sans font-medium uppercase flex items-center justify-between transition-all ${
            feedback.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:opacity-75 font-semibold"
          >
            [ DISMISS ]
          </button>
        </div>
      )}

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: FORMS (col-span-4)                           */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-4">
          {/* Section Navigation Tabs for Forms */}
          <div className="border border-neutral-200 bg-neutral-50/50 p-1 flex">
            <button
              type="button"
              onClick={() => setActiveFormTab('district')}
              className={`flex-1 py-2 text-center font-sans text-xs tracking-wider uppercase transition-colors ${
                activeFormTab === 'district'
                  ? 'bg-white text-VASAVI-blue font-bold shadow-sm border border-neutral-200'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              1. District
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('region')}
              className={`flex-1 py-2 text-center font-sans text-xs tracking-wider uppercase transition-colors ${
                activeFormTab === 'region'
                  ? 'bg-white text-VASAVI-blue font-bold shadow-sm border border-neutral-200'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              2. Region
            </button>
            <button
              type="button"
              onClick={() => setActiveFormTab('zone')}
              className={`flex-1 py-2 text-center font-sans text-xs tracking-wider uppercase transition-colors ${
                activeFormTab === 'zone'
                  ? 'bg-white text-VASAVI-blue font-bold shadow-sm border border-neutral-200'
                  : 'text-neutral-500 hover:text-neutral-900 font-medium'
              }`}
            >
              3. Zone
            </button>
          </div>

          {/* FORM 1: DISTRICT MASTER */}
          {activeFormTab === 'district' && (
            <div className="border border-neutral-200 bg-white p-6 space-y-5">
              <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400">
                    MODULE // DRZ.01
                  </span>
                  <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-neutral-900">
                    District Master Form
                  </h3>
                </div>
                {districtForm.id && (
                  <span className="text-[10px] font-sans font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 uppercase">
                    EDIT MODE
                  </span>
                )}
              </div>

              {/* Selector to pick existing District to update */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Select Existing District:
                </label>
                <select
                  value={districtForm.id}
                  onChange={(e) => handleSelectDistrict(e.target.value)}
                  className="w-full border border-neutral-200 bg-neutral-50/50 p-2.5 text-xs font-sans text-neutral-900 focus:bg-white focus:outline-none focus:border-VASAVI-blue"
                >
                  <option value="">[ + CREATE NEW DISTRICT ]</option>
                  {districts.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-medium uppercase tracking-wider text-neutral-500">
                    District Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. District V-324"
                    value={districtForm.name}
                    onChange={(e) => setDistrictForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 text-xs font-sans text-neutral-900 focus:outline-none focus:border-VASAVI-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-medium uppercase tracking-wider text-neutral-500">
                    District Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. V-324"
                    value={districtForm.code}
                    onChange={(e) => setDistrictForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full border border-neutral-200 p-2.5 text-xs font-sans font-semibold uppercase text-neutral-900 focus:outline-none focus:border-VASAVI-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Jurisdiction Remarks
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional administrative notes"
                    value={districtForm.description}
                    onChange={(e) => setDistrictForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 text-xs font-sans text-neutral-900 focus:outline-none focus:border-VASAVI-blue resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-neutral-100 flex items-center space-x-2 font-sans text-xs font-semibold">
                {districtForm.id ? (
                  <button
                    type="button"
                    disabled={isSubmittingDistrict}
                    onClick={() => handleSaveDistrict(true)}
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-VASAVI-blue text-white uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {isSubmittingDistrict ? 'Saving...' : '[ UPDATE DISTRICT ]'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmittingDistrict}
                    onClick={() => handleSaveDistrict(false)}
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-VASAVI-blue text-white uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {isSubmittingDistrict ? 'Saving...' : '[ SAVE NEW DISTRICT ]'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDistrictForm({ id: '', name: '', code: '', description: '' })}
                  className="border border-neutral-200 hover:border-neutral-400 px-3 py-2.5 text-neutral-600 uppercase tracking-wider transition-colors"
                >
                  [ CLEAR ]
                </button>
              </div>
            </div>
          )}

          {/* FORM 2: REGION MASTER */}
          {activeFormTab === 'region' && (
            <div className="border border-neutral-200 bg-white p-6 space-y-5">
              <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400">
                    MODULE // DRZ.02
                  </span>
                  <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-neutral-900">
                    Region Master Form
                  </h3>
                </div>
                {regionForm.id && (
                  <span className="text-[10px] font-sans font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 uppercase">
                    EDIT MODE
                  </span>
                )}
              </div>

              {/* Selector to pick existing Region to update */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Select Existing Region:
                </label>
                <select
                  value={regionForm.id}
                  onChange={(e) => handleSelectRegion(e.target.value)}
                  className="w-full border border-neutral-200 bg-neutral-50/50 p-2.5 text-xs font-sans text-neutral-900 focus:bg-white focus:outline-none focus:border-VASAVI-blue"
                >
                  <option value="">[ + CREATE NEW REGION ]</option>
                  {regions.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} ({r.code}) {r.districtId?.code ? `// ${r.districtId.code}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Parent District <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={regionForm.districtId}
                    onChange={(e) => setRegionForm((prev) => ({ ...prev, districtId: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 text-xs font-sans text-neutral-900 focus:outline-none focus:border-VASAVI-blue"
                  >
                    <option value="">-- SELECT PARENT DISTRICT --</option>
                    {districts.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Region Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Region II"
                    value={regionForm.name}
                    onChange={(e) => setRegionForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 text-xs font-sans text-neutral-900 focus:outline-none focus:border-VASAVI-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Region Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. REG-02"
                    value={regionForm.code}
                    onChange={(e) => setRegionForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full border border-neutral-200 p-2.5 text-xs font-sans font-semibold uppercase text-neutral-900 focus:outline-none focus:border-VASAVI-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Jurisdiction Remarks
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional administrative notes"
                    value={regionForm.description}
                    onChange={(e) => setRegionForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 text-xs font-sans text-neutral-900 focus:outline-none focus:border-VASAVI-blue resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-neutral-100 flex items-center space-x-2 font-sans text-xs font-semibold">
                {regionForm.id ? (
                  <button
                    type="button"
                    disabled={isSubmittingRegion}
                    onClick={() => handleSaveRegion(true)}
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-VASAVI-blue text-white uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {isSubmittingRegion ? 'Saving...' : '[ UPDATE REGION ]'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmittingRegion}
                    onClick={() => handleSaveRegion(false)}
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-VASAVI-blue text-white uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {isSubmittingRegion ? 'Saving...' : '[ SAVE NEW REGION ]'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setRegionForm({ id: '', districtId: '', name: '', code: '', description: '' })}
                  className="border border-neutral-200 hover:border-neutral-400 px-3 py-2.5 text-neutral-600 uppercase tracking-wider transition-colors"
                >
                  [ CLEAR ]
                </button>
              </div>
            </div>
          )}

          {/* FORM 3: ZONE MASTER */}
          {activeFormTab === 'zone' && (
            <div className="border border-neutral-200 bg-white p-6 space-y-5">
              <div className="border-b border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-400">
                    MODULE // DRZ.03
                  </span>
                  <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-neutral-900">
                    Zone Master Form
                  </h3>
                </div>
                {zoneForm.id && (
                  <span className="text-[10px] font-sans font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 uppercase">
                    EDIT MODE
                  </span>
                )}
              </div>

              {/* Selector to pick existing Zone to update */}
              <div className="space-y-1.5">
                <label className="block font-sans text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Select Existing Zone:
                </label>
                <select
                  value={zoneForm.id}
                  onChange={(e) => handleSelectZone(e.target.value)}
                  className="w-full border border-neutral-200 bg-neutral-50/50 p-2.5 text-xs font-sans text-neutral-900 focus:bg-white focus:outline-none focus:border-VASAVI-blue"
                >
                  <option value="">[ + CREATE NEW ZONE ]</option>
                  {zones.map((z) => (
                    <option key={z._id} value={z._id}>
                      {z.name} ({z.code}) {z.regionId?.code ? `// ${z.regionId.code}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Parent Region <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={zoneForm.regionId}
                    onChange={(e) => setZoneForm((prev) => ({ ...prev, regionId: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 text-xs font-sans text-neutral-900 focus:outline-none focus:border-VASAVI-blue"
                  >
                    <option value="">-- SELECT PARENT REGION --</option>
                    {regions.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({r.code}) {r.districtId?.code ? `// Dist: ${r.districtId.code}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Zone Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Zone 1"
                    value={zoneForm.name}
                    onChange={(e) => setZoneForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 text-xs font-sans text-neutral-900 focus:outline-none focus:border-VASAVI-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Zone Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ZN-01"
                    value={zoneForm.code}
                    onChange={(e) => setZoneForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full border border-neutral-200 p-2.5 text-xs font-sans font-semibold uppercase text-neutral-900 focus:outline-none focus:border-VASAVI-blue"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-sans text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Jurisdiction Remarks
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional administrative notes"
                    value={zoneForm.description}
                    onChange={(e) => setZoneForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-neutral-200 p-2.5 text-xs font-sans text-neutral-900 focus:outline-none focus:border-VASAVI-blue resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-neutral-100 flex items-center space-x-2 font-sans text-xs font-semibold">
                {zoneForm.id ? (
                  <button
                    type="button"
                    disabled={isSubmittingZone}
                    onClick={() => handleSaveZone(true)}
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-VASAVI-blue text-white uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {isSubmittingZone ? 'Saving...' : '[ UPDATE ZONE ]'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmittingZone}
                    onClick={() => handleSaveZone(false)}
                    className="flex-1 py-2.5 bg-neutral-900 hover:bg-VASAVI-blue text-white uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {isSubmittingZone ? 'Saving...' : '[ SAVE NEW ZONE ]'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setZoneForm({ id: '', regionId: '', name: '', code: '', description: '' })}
                  className="border border-neutral-200 hover:border-neutral-400 px-3 py-2.5 text-neutral-600 uppercase tracking-wider transition-colors"
                >
                  [ CLEAR ]
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: MASTER LISTINGS TABLE (col-span-8)          */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 border border-neutral-200 bg-white">
          {/* Table Header & Toggle Tabs */}
          <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/40">
            {/* View Switcher Tabs */}
            <div className="flex items-center space-x-2 text-xs font-sans font-semibold">
              <button
                onClick={() => setActiveTab('districts')}
                className={`px-3.5 py-1.5 uppercase transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'districts'
                    ? 'bg-neutral-900 text-white font-bold'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-VASAVI-blue hover:text-VASAVI-blue'
                }`}
              >
                <span>[ DISTRICTS ]</span>
                <span className="text-[10px] opacity-75">({districts.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('regions')}
                className={`px-3.5 py-1.5 uppercase transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'regions'
                    ? 'bg-neutral-900 text-white font-bold'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-VASAVI-blue hover:text-VASAVI-blue'
                }`}
              >
                <span>[ REGIONS ]</span>
                <span className="text-[10px] opacity-75">({regions.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('zones')}
                className={`px-3.5 py-1.5 uppercase transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'zones'
                    ? 'bg-neutral-900 text-white font-bold'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-VASAVI-blue hover:text-VASAVI-blue'
                }`}
              >
                <span>[ ZONES ]</span>
                <span className="text-[10px] opacity-75">({zones.length})</span>
              </button>
            </div>

            <div className="text-xs font-sans font-medium text-neutral-400 uppercase tracking-wider">
              ROSTER VIEW // {activeTab.toUpperCase()}
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-16 text-center">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-neutral-400 mb-2" />
                <span className="text-xs font-sans text-neutral-400 uppercase font-medium">
                  Fetching DRZ Hierarchy Records...
                </span>
              </div>
            ) : (
              <>
                {/* 1. DISTRICTS TABLE */}
                {activeTab === 'districts' && (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-sans font-semibold text-neutral-500 uppercase tracking-wider">
                        <th className="py-3 px-4 font-semibold">#</th>
                        <th className="py-3 px-4 font-semibold">District Name</th>
                        <th className="py-3 px-4 font-semibold">Code</th>
                        <th className="py-3 px-4 font-semibold">Regions Linked</th>
                        <th className="py-3 px-4 font-semibold">Remarks</th>
                        <th className="py-3 px-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs font-sans">
                      {districts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-neutral-400 text-xs font-sans uppercase font-medium">
                            No district entities recorded in database.
                          </td>
                        </tr>
                      ) : (
                        districts.map((d, index) => {
                          const childRegionsCount = regions.filter(
                            (r) => String(r.districtId?._id || r.districtId) === String(d._id)
                          ).length;
                          return (
                            <tr key={d._id} className="hover:bg-neutral-50/50 transition-colors">
                              <td className="py-3 px-4 text-xs text-neutral-400 font-medium">
                                {String(index + 1).padStart(2, '0')}
                              </td>
                              <td className="py-3 px-4 font-bold text-neutral-900">
                                {d.name}
                              </td>
                              <td className="py-3 px-4 font-bold text-VASAVI-blue">
                                {d.code}
                              </td>
                              <td className="py-3 px-4 text-neutral-600 font-medium">
                                {childRegionsCount} REGION(S)
                              </td>
                              <td className="py-3 px-4 text-neutral-500 text-xs max-w-xs truncate">
                                {d.description || '—'}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center space-x-2 text-xs font-semibold">
                                  <button
                                    onClick={() => handleEditItem('district', d)}
                                    className="border border-neutral-200 hover:border-VASAVI-blue hover:text-VASAVI-blue px-2.5 py-1 uppercase transition-colors"
                                  >
                                    [ EDIT ]
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteModal({
                                        isOpen: true,
                                        type: 'district',
                                        item: d,
                                        isDeleting: false,
                                        error: null,
                                      })
                                    }
                                    className="border border-neutral-200 hover:border-red-600 text-neutral-400 hover:text-red-600 px-2 py-1 uppercase transition-colors"
                                  >
                                    [ DELETE ]
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}

                {/* 2. REGIONS TABLE */}
                {activeTab === 'regions' && (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-sans font-semibold text-neutral-500 uppercase tracking-wider">
                        <th className="py-3 px-4 font-semibold">#</th>
                        <th className="py-3 px-4 font-semibold">Region Name</th>
                        <th className="py-3 px-4 font-semibold">Code</th>
                        <th className="py-3 px-4 font-semibold">Parent District</th>
                        <th className="py-3 px-4 font-semibold">Zones Linked</th>
                        <th className="py-3 px-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs font-sans">
                      {regions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-neutral-400 text-xs font-sans uppercase font-medium">
                            No region entities recorded in database.
                          </td>
                        </tr>
                      ) : (
                        regions.map((r, index) => {
                          const childZonesCount = zones.filter(
                            (z) => String(z.regionId?._id || z.regionId) === String(r._id)
                          ).length;
                          return (
                            <tr key={r._id} className="hover:bg-neutral-50/50 transition-colors">
                              <td className="py-3 px-4 text-xs text-neutral-400 font-medium">
                                {String(index + 1).padStart(2, '0')}
                              </td>
                              <td className="py-3 px-4 font-bold text-neutral-900">
                                {r.name}
                              </td>
                              <td className="py-3 px-4 font-bold text-VASAVI-blue">
                                {r.code}
                              </td>
                              <td className="py-3 px-4 text-neutral-600">
                                {r.districtId ? (
                                  <span className="bg-neutral-100 px-1.5 py-0.5 border border-neutral-200 font-medium">
                                    {r.districtId.name} ({r.districtId.code})
                                  </span>
                                ) : (
                                  <span className="text-neutral-400 font-medium">UNASSIGNED</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-neutral-600 font-medium">
                                {childZonesCount} ZONE(S)
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="inline-flex items-center space-x-2 text-xs font-semibold">
                                  <button
                                    onClick={() => handleEditItem('region', r)}
                                    className="border border-neutral-200 hover:border-VASAVI-blue hover:text-VASAVI-blue px-2.5 py-1 uppercase transition-colors"
                                  >
                                    [ EDIT ]
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteModal({
                                        isOpen: true,
                                        type: 'region',
                                        item: r,
                                        isDeleting: false,
                                        error: null,
                                      })
                                    }
                                    className="border border-neutral-200 hover:border-red-600 text-neutral-400 hover:text-red-600 px-2 py-1 uppercase transition-colors"
                                  >
                                    [ DELETE ]
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}

                {/* 3. ZONES TABLE */}
                {activeTab === 'zones' && (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50/80 text-[11px] font-sans font-semibold text-neutral-500 uppercase tracking-wider">
                        <th className="py-3 px-4 font-semibold">#</th>
                        <th className="py-3 px-4 font-semibold">Zone Name</th>
                        <th className="py-3 px-4 font-semibold">Code</th>
                        <th className="py-3 px-4 font-semibold">Parent Region</th>
                        <th className="py-3 px-4 font-semibold">District Hierarchy</th>
                        <th className="py-3 px-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs font-sans">
                      {zones.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-neutral-400 text-xs font-sans uppercase font-medium">
                            No zone entities recorded in database.
                          </td>
                        </tr>
                      ) : (
                        zones.map((z, index) => (
                          <tr key={z._id} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="py-3 px-4 text-xs text-neutral-400 font-medium">
                              {String(index + 1).padStart(2, '0')}
                            </td>
                            <td className="py-3 px-4 font-bold text-neutral-900">
                              {z.name}
                            </td>
                            <td className="py-3 px-4 font-bold text-VASAVI-blue">
                              {z.code}
                            </td>
                            <td className="py-3 px-4 text-neutral-600">
                              {z.regionId ? (
                                <span className="bg-neutral-100 px-1.5 py-0.5 border border-neutral-200 font-medium">
                                  {z.regionId.name} ({z.regionId.code})
                                </span>
                              ) : (
                                <span className="text-neutral-400 font-medium">UNASSIGNED</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-neutral-500 font-medium">
                              {z.regionId?.districtId ? (
                                <span>{z.regionId.districtId.code}</span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center space-x-2 text-xs font-semibold">
                                <button
                                  onClick={() => handleEditItem('zone', z)}
                                  className="border border-neutral-200 hover:border-VASAVI-blue hover:text-VASAVI-blue px-2.5 py-1 uppercase transition-colors"
                                >
                                  [ EDIT ]
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteModal({
                                      isOpen: true,
                                      type: 'zone',
                                      item: z,
                                      isDeleting: false,
                                      error: null,
                                    })
                                  }
                                  className="border border-neutral-200 hover:border-red-600 text-neutral-400 hover:text-red-600 px-2 py-1 uppercase transition-colors"
                                >
                                  [ DELETE ]
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Deletion Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.item && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 max-w-md w-full p-6 space-y-4 text-left shadow-xl">
            <div className="flex items-center space-x-2 text-red-600 font-sans text-xs font-semibold tracking-wider uppercase">
              <AlertTriangle className="w-4 h-4" />
              <span>SEC.PURGE // DRZ RECORD DELETION</span>
            </div>

            <h3 className="text-base font-sans font-bold uppercase tracking-wide text-neutral-900">
              Confirm Entity Disbandment
            </h3>

            <p className="text-xs text-neutral-600 font-sans font-normal leading-relaxed">
              You are about to permanently purge the following {deleteModal.type.toUpperCase()} entity from District V-324 hierarchy:
            </p>

            <div className="border border-neutral-200 bg-neutral-50 p-3 font-sans text-xs space-y-1">
              <div>
                <span className="text-neutral-400 font-medium">ENTITY:</span>{' '}
                <span className="font-bold text-neutral-900">{deleteModal.item.name}</span>
              </div>
              <div>
                <span className="text-neutral-400 font-medium">CODE:</span>{' '}
                <span className="font-bold text-VASAVI-blue">{deleteModal.item.code}</span>
              </div>
              <div>
                <span className="text-neutral-400 font-medium">CLASSIFICATION:</span>{' '}
                <span className="text-neutral-700 uppercase font-semibold">{deleteModal.type} Master</span>
              </div>
            </div>

            {deleteModal.error && (
              <div className="border border-red-200 bg-red-50 p-2.5 text-red-700 font-sans text-xs font-medium">
                {deleteModal.error}
              </div>
            )}

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end space-x-2 font-sans text-xs font-semibold">
              <button
                type="button"
                disabled={deleteModal.isDeleting}
                onClick={() =>
                  setDeleteModal({ isOpen: false, type: '', item: null, isDeleting: false, error: null })
                }
                className="border border-neutral-200 hover:border-neutral-400 px-4 py-2 text-neutral-600 uppercase transition-colors"
              >
                [ CANCEL ]
              </button>
              <button
                type="button"
                disabled={deleteModal.isDeleting}
                onClick={handleConfirmDelete}
                className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 uppercase transition-colors disabled:opacity-50"
              >
                {deleteModal.isDeleting ? 'PURGING...' : '[ CONFIRM PURGE ]'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
