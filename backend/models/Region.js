import mongoose from 'mongoose';

/**
 * Region Schema
 * Secondary territorial division linking to a parent District (e.g., Region I, Region II)
 */
const regionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Region name is mandatory'],
      trim: true,
      maxlength: [100, 'Region name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Region code is mandatory'],
      trim: true,
      uppercase: true,
      index: true,
    },
    districtId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'District',
      required: [true, 'Parent district reference is mandatory'],
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

// Compound index for uniqueness of code within a district
regionSchema.index({ districtId: 1, code: 1 }, { unique: true });

const Region = mongoose.model('Region', regionSchema);
export default Region;
