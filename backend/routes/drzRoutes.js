import express from 'express';
import District from '../models/District.js';
import Region from '../models/Region.js';
import Zone from '../models/Zone.js';
import { requireAuth, isAdmin } from '../middleware/authMiddleware.js';
import createAuditLog from '../utils/auditLogger.js';

const router = express.Router();

// ==========================================
// 1. DISTRICT CRUD ROUTES
// ==========================================

// GET /api/drz/districts - Retrieve all districts
router.get('/districts', async (req, res) => {
  try {
    const districts = await District.find().sort({ name: 1 });
    res.json({ success: true, count: districts.length, data: districts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/drz/districts/:id - Retrieve single district
router.get('/districts/:id', async (req, res) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ success: false, message: 'District record not found' });
    }
    res.json({ success: true, data: district });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/drz/districts - Create new district
router.post('/districts', requireAuth, isAdmin, async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'District name and code are mandatory fields.',
      });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const cleanName = String(name).trim();

    const existing = await District.findOne({ code: cleanCode });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A district with code [${cleanCode}] already exists.`,
      });
    }

    const newDistrict = await District.create({
      name: cleanName,
      code: cleanCode,
      description: description?.trim() || '',
    });

    await createAuditLog({
      module: 'DRZ',
      action: 'DISTRICT_CREATED',
      reference: newDistrict.code,
      user: req.user?.email || 'ADMIN',
      role: req.user?.role || 'admin',
      status: 'Success',
      remarks: `Created District [${newDistrict.name}] with code ${newDistrict.code}`,
      req,
    });

    res.status(201).json({
      success: true,
      message: `District [${newDistrict.name}] (${newDistrict.code}) created successfully.`,
      data: newDistrict,
    });
  } catch (error) {
    console.error('[DRZ // CREATE DISTRICT ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/drz/districts/:id - Update district
router.put('/districts/:id', requireAuth, isAdmin, async (req, res) => {
  try {
    const { name, code, description } = req.body;

    const district = await District.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ success: false, message: 'District record not found.' });
    }

    const cleanCode = code ? String(code).trim().toUpperCase() : district.code;
    const cleanName = name ? String(name).trim() : district.name;

    if (code && cleanCode !== district.code) {
      const conflict = await District.findOne({ code: cleanCode, _id: { $ne: district._id } });
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `Another district with code [${cleanCode}] already exists.`,
        });
      }
    }

    const oldValues = `${district.name} (${district.code})`;
    district.name = cleanName;
    district.code = cleanCode;
    if (description !== undefined) district.description = description.trim();
    await district.save();

    await createAuditLog({
      module: 'DRZ',
      action: 'DISTRICT_UPDATED',
      reference: district.code,
      user: req.user?.email || 'ADMIN',
      role: req.user?.role || 'admin',
      status: 'Success',
      remarks: `Updated District from '${oldValues}' to '${district.name} (${district.code})'`,
      req,
    });

    res.json({
      success: true,
      message: `District [${district.name}] updated successfully.`,
      data: district,
    });
  } catch (error) {
    console.error('[DRZ // UPDATE DISTRICT ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/drz/districts/:id - Delete district
router.delete('/districts/:id', requireAuth, isAdmin, async (req, res) => {
  try {
    const district = await District.findById(req.params.id);
    if (!district) {
      return res.status(404).json({ success: false, message: 'District record not found.' });
    }

    // Check if dependent regions exist
    const linkedRegionsCount = await Region.countDocuments({ districtId: district._id });
    if (linkedRegionsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete District [${district.name}] because ${linkedRegionsCount} region(s) are linked to it. Delete or reassign those regions first.`,
      });
    }

    await District.findByIdAndDelete(district._id);

    await createAuditLog({
      module: 'DRZ',
      action: 'DISTRICT_DELETED',
      reference: district.code,
      user: req.user?.email || 'ADMIN',
      role: req.user?.role || 'admin',
      status: 'Success',
      remarks: `Deleted District [${district.name}] (${district.code})`,
      req,
    });

    res.json({
      success: true,
      message: `District [${district.name}] (${district.code}) deleted successfully.`,
      data: district,
    });
  } catch (error) {
    console.error('[DRZ // DELETE DISTRICT ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 2. REGION CRUD ROUTES
// ==========================================

// GET /api/drz/regions - Retrieve all regions (supports ?districtId=...)
router.get('/regions', async (req, res) => {
  try {
    const filter = {};
    if (req.query.districtId) {
      filter.districtId = req.query.districtId;
    }
    const regions = await Region.find(filter)
      .populate('districtId', 'name code')
      .sort({ name: 1 });
    res.json({ success: true, count: regions.length, data: regions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/drz/regions/:id - Retrieve single region
router.get('/regions/:id', async (req, res) => {
  try {
    const region = await Region.findById(req.params.id).populate('districtId', 'name code');
    if (!region) {
      return res.status(404).json({ success: false, message: 'Region record not found.' });
    }
    res.json({ success: true, data: region });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/drz/regions - Create new region
router.post('/regions', requireAuth, isAdmin, async (req, res) => {
  try {
    const { name, code, districtId, description } = req.body;

    if (!name || !code || !districtId) {
      return res.status(400).json({
        success: false,
        message: 'Region name, code, and parent District are mandatory.',
      });
    }

    const parentDistrict = await District.findById(districtId);
    if (!parentDistrict) {
      return res.status(404).json({
        success: false,
        message: 'Specified parent District does not exist.',
      });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const cleanName = String(name).trim();

    const existing = await Region.findOne({ districtId, code: cleanCode });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A region with code [${cleanCode}] already exists within district [${parentDistrict.code}].`,
      });
    }

    const newRegion = await Region.create({
      name: cleanName,
      code: cleanCode,
      districtId,
      description: description?.trim() || '',
    });

    const populatedRegion = await newRegion.populate('districtId', 'name code');

    await createAuditLog({
      module: 'DRZ',
      action: 'REGION_CREATED',
      reference: newRegion.code,
      user: req.user?.email || 'ADMIN',
      role: req.user?.role || 'admin',
      status: 'Success',
      remarks: `Created Region [${newRegion.name}] (${newRegion.code}) under District [${parentDistrict.name}]`,
      req,
    });

    res.status(201).json({
      success: true,
      message: `Region [${newRegion.name}] created successfully under District [${parentDistrict.name}].`,
      data: populatedRegion,
    });
  } catch (error) {
    console.error('[DRZ // CREATE REGION ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/drz/regions/:id - Update region
router.put('/regions/:id', requireAuth, isAdmin, async (req, res) => {
  try {
    const { name, code, districtId, description } = req.body;

    const region = await Region.findById(req.params.id);
    if (!region) {
      return res.status(404).json({ success: false, message: 'Region record not found.' });
    }

    const targetDistrictId = districtId || region.districtId;
    if (districtId && String(districtId) !== String(region.districtId)) {
      const parentDistrict = await District.findById(districtId);
      if (!parentDistrict) {
        return res.status(404).json({ success: false, message: 'Specified parent District does not exist.' });
      }
    }

    const cleanCode = code ? String(code).trim().toUpperCase() : region.code;
    const cleanName = name ? String(name).trim() : region.name;

    if (code || districtId) {
      const conflict = await Region.findOne({
        districtId: targetDistrictId,
        code: cleanCode,
        _id: { $ne: region._id },
      });
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `Another region with code [${cleanCode}] already exists in this district.`,
        });
      }
    }

    const oldValues = `${region.name} (${region.code})`;
    region.name = cleanName;
    region.code = cleanCode;
    region.districtId = targetDistrictId;
    if (description !== undefined) region.description = description.trim();
    await region.save();

    const populatedRegion = await region.populate('districtId', 'name code');

    await createAuditLog({
      module: 'DRZ',
      action: 'REGION_UPDATED',
      reference: region.code,
      user: req.user?.email || 'ADMIN',
      role: req.user?.role || 'admin',
      status: 'Success',
      remarks: `Updated Region from '${oldValues}' to '${region.name} (${region.code})'`,
      req,
    });

    res.json({
      success: true,
      message: `Region [${region.name}] updated successfully.`,
      data: populatedRegion,
    });
  } catch (error) {
    console.error('[DRZ // UPDATE REGION ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/drz/regions/:id - Delete region
router.delete('/regions/:id', requireAuth, isAdmin, async (req, res) => {
  try {
    const region = await Region.findById(req.params.id);
    if (!region) {
      return res.status(404).json({ success: false, message: 'Region record not found.' });
    }

    // Check if dependent zones exist
    const linkedZonesCount = await Zone.countDocuments({ regionId: region._id });
    if (linkedZonesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete Region [${region.name}] because ${linkedZonesCount} zone(s) are linked to it. Delete or reassign those zones first.`,
      });
    }

    await Region.findByIdAndDelete(region._id);

    await createAuditLog({
      module: 'DRZ',
      action: 'REGION_DELETED',
      reference: region.code,
      user: req.user?.email || 'ADMIN',
      role: req.user?.role || 'admin',
      status: 'Success',
      remarks: `Deleted Region [${region.name}] (${region.code})`,
      req,
    });

    res.json({
      success: true,
      message: `Region [${region.name}] (${region.code}) deleted successfully.`,
      data: region,
    });
  } catch (error) {
    console.error('[DRZ // DELETE REGION ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 3. ZONE CRUD ROUTES
// ==========================================

// GET /api/drz/zones - Retrieve all zones (supports ?regionId=...)
router.get('/zones', async (req, res) => {
  try {
    const filter = {};
    if (req.query.regionId) {
      filter.regionId = req.query.regionId;
    }
    const zones = await Zone.find(filter)
      .populate({
        path: 'regionId',
        select: 'name code districtId',
        populate: { path: 'districtId', select: 'name code' },
      })
      .sort({ name: 1 });
    res.json({ success: true, count: zones.length, data: zones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/drz/zones/:id - Retrieve single zone
router.get('/zones/:id', async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id).populate({
      path: 'regionId',
      select: 'name code districtId',
      populate: { path: 'districtId', select: 'name code' },
    });
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone record not found.' });
    }
    res.json({ success: true, data: zone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/drz/zones - Create new zone
router.post('/zones', requireAuth, isAdmin, async (req, res) => {
  try {
    const { name, code, regionId, description } = req.body;

    if (!name || !code || !regionId) {
      return res.status(400).json({
        success: false,
        message: 'Zone name, code, and parent Region are mandatory.',
      });
    }

    const parentRegion = await Region.findById(regionId);
    if (!parentRegion) {
      return res.status(404).json({
        success: false,
        message: 'Specified parent Region does not exist.',
      });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const cleanName = String(name).trim();

    const existing = await Zone.findOne({ regionId, code: cleanCode });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A zone with code [${cleanCode}] already exists within region [${parentRegion.code}].`,
      });
    }

    const newZone = await Zone.create({
      name: cleanName,
      code: cleanCode,
      regionId,
      description: description?.trim() || '',
    });

    const populatedZone = await newZone.populate({
      path: 'regionId',
      select: 'name code districtId',
      populate: { path: 'districtId', select: 'name code' },
    });

    await createAuditLog({
      module: 'DRZ',
      action: 'ZONE_CREATED',
      reference: newZone.code,
      user: req.user?.email || 'ADMIN',
      role: req.user?.role || 'admin',
      status: 'Success',
      remarks: `Created Zone [${newZone.name}] (${newZone.code}) under Region [${parentRegion.name}]`,
      req,
    });

    res.status(201).json({
      success: true,
      message: `Zone [${newZone.name}] created successfully under Region [${parentRegion.name}].`,
      data: populatedZone,
    });
  } catch (error) {
    console.error('[DRZ // CREATE ZONE ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/drz/zones/:id - Update zone
router.put('/zones/:id', requireAuth, isAdmin, async (req, res) => {
  try {
    const { name, code, regionId, description } = req.body;

    const zone = await Zone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone record not found.' });
    }

    const targetRegionId = regionId || zone.regionId;
    if (regionId && String(regionId) !== String(zone.regionId)) {
      const parentRegion = await Region.findById(regionId);
      if (!parentRegion) {
        return res.status(404).json({ success: false, message: 'Specified parent Region does not exist.' });
      }
    }

    const cleanCode = code ? String(code).trim().toUpperCase() : zone.code;
    const cleanName = name ? String(name).trim() : zone.name;

    if (code || regionId) {
      const conflict = await Zone.findOne({
        regionId: targetRegionId,
        code: cleanCode,
        _id: { $ne: zone._id },
      });
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `Another zone with code [${cleanCode}] already exists in this region.`,
        });
      }
    }

    const oldValues = `${zone.name} (${zone.code})`;
    zone.name = cleanName;
    zone.code = cleanCode;
    zone.regionId = targetRegionId;
    if (description !== undefined) zone.description = description.trim();
    await zone.save();

    const populatedZone = await zone.populate({
      path: 'regionId',
      select: 'name code districtId',
      populate: { path: 'districtId', select: 'name code' },
    });

    await createAuditLog({
      module: 'DRZ',
      action: 'ZONE_UPDATED',
      reference: zone.code,
      user: req.user?.email || 'ADMIN',
      role: req.user?.role || 'admin',
      status: 'Success',
      remarks: `Updated Zone from '${oldValues}' to '${zone.name} (${zone.code})'`,
      req,
    });

    res.json({
      success: true,
      message: `Zone [${zone.name}] updated successfully.`,
      data: populatedZone,
    });
  } catch (error) {
    console.error('[DRZ // UPDATE ZONE ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/drz/zones/:id - Delete zone
router.delete('/zones/:id', requireAuth, isAdmin, async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);
    if (!zone) {
      return res.status(404).json({ success: false, message: 'Zone record not found.' });
    }

    await Zone.findByIdAndDelete(zone._id);

    await createAuditLog({
      module: 'DRZ',
      action: 'ZONE_DELETED',
      reference: zone.code,
      user: req.user?.email || 'ADMIN',
      role: req.user?.role || 'admin',
      status: 'Success',
      remarks: `Deleted Zone [${zone.name}] (${zone.code})`,
      req,
    });

    res.json({
      success: true,
      message: `Zone [${zone.name}] (${zone.code}) deleted successfully.`,
      data: zone,
    });
  } catch (error) {
    console.error('[DRZ // DELETE ZONE ERROR]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
