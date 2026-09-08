import mongoose from 'mongoose';

/**
 * PST Schema (President, Secretary, Treasurer)
 * Clinical executive cabinet registry for VASAVI Clubs International
 */
const pstSchema = new mongoose.Schema(
  {
    lionYear: {
      type: String,
      required: [true, 'Lionistic operational year is required (e.g., 2024-2025)'],
      trim: true,
      match: [/^\d{4}-\d{4}$/, 'Lion year must conform to YYYY-YYYY format'],
      index: true,
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: [true, 'Parent club reference is mandatory'],
      index: true,
    },
    president: {
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: [true, 'Club President assignment is mandatory'],
      },
      officialEmail: {
        type: String,
        trim: true,
        lowercase: true,
      },
      directPhone: {
        type: String,
        trim: true,
      },
      termBio: {
        type: String,
        trim: true,
      },
    },
    secretary: {
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: [true, 'Club Secretary assignment is mandatory'],
      },
      officialEmail: {
        type: String,
        trim: true,
        lowercase: true,
      },
      directPhone: {
        type: String,
        trim: true,
      },
      termBio: {
        type: String,
        trim: true,
      },
    },
    treasurer: {
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: [true, 'Club Treasurer assignment is mandatory'],
      },
      officialEmail: {
        type: String,
        trim: true,
        lowercase: true,
      },
      directPhone: {
        type: String,
        trim: true,
      },
      termBio: {
        type: String,
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['Incumbent', 'Elect', 'Past', 'Interim'],
      default: 'Incumbent',
    },
    installedDate: {
      type: Date,
      default: Date.now,
    },
    termEndDate: {
      type: Date,
    },
    cabinetMotto: {
      type: String,
      trim: true,
      default: 'Fellowship and Service',
    },
    auditedFinancialsUploaded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Enforce unique PST roster per Club per operational Year
pstSchema.index({ club: 1, lionYear: 1 }, { unique: true });

const PST = mongoose.model('PST', pstSchema);

export default PST;
