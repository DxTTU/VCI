import mongoose from 'mongoose';

/**
 * District Schema
 * Top-level territorial unit for Vasavi Clubs International (e.g., District V-324)
 */
const districtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'District name is mandatory'],
      trim: true,
      maxlength: [100, 'District name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'District code is mandatory'],
      unique: true,
      trim: true,
      uppercase: true,
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

const District = mongoose.model('District', districtSchema);
export default District;
