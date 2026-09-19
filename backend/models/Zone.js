import mongoose from 'mongoose';

/**
 * Zone Schema
 * Tertiary territorial division linking to a parent Region (e.g., Zone 1, Zone 2)
 */
const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Zone name is mandatory'],
      trim: true,
      maxlength: [100, 'Zone name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Zone code is mandatory'],
      trim: true,
      uppercase: true,
      index: true,
    },
    regionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Region',
      required: [true, 'Parent region reference is mandatory'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for uniqueness of code within a region
zoneSchema.index({ regionId: 1, code: 1 }, { unique: true });

const Zone = mongoose.model('Zone', zoneSchema);
export default Zone;
