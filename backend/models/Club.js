import mongoose from 'mongoose';

/**
 * Club Schema
 * Clinical specification for Vasavi Clubs International Charter Entities
 */
const clubSchema = new mongoose.Schema(
  {
    clubNumber: {
      type: String,
      required: [true, 'Club registry number is mandatory'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    clubName: {
      type: String,
      required: [true, 'Official club name is mandatory'],
      trim: true,
      maxlength: [120, 'Club name cannot exceed 120 characters'],
    },
    district: {
      type: String,
      required: [true, 'District designation is mandatory'],
      trim: true,
      default: 'District V-324',
    },
    multipleDistrict: {
      type: String,
      trim: true,
      default: 'VCI 324',
    },
    region: {
      type: String,
      trim: true,
    },
    zone: {
      type: String,
      trim: true,
    },
    charterDate: {
      type: Date,
      required: [true, 'Charter date is mandatory'],
    },
    status: {
      type: String,
      enum: ['Active', 'Probationary', 'Inactive', 'Suspended'],
      default: 'Active',
      index: true,
    },
    meetingSchedule: {
      frequency: {
        type: String,
        enum: ['Weekly', 'Bi-Weekly', 'Monthly', 'First and Third Thursdays', 'Custom'],
        default: 'Bi-Weekly',
      },
      day: {
        type: String,
        default: 'Saturday',
      },
      time: {
        type: String,
        default: '19:00 IST',
      },
      venue: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
    },
    contactEmail: {
      type: String,
      required: [true, 'Official contact email is mandatory'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please supply a valid administrative email address',
      ],
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    totalMembers: {
      type: Number,
      default: 0,
      min: [0, 'Member count cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted identifier
clubSchema.virtual('fullDesignation').get(function () {
  return `${this.clubName} (ID: ${this.clubNumber} / ${this.district})`;
});

const Club = mongoose.model('Club', clubSchema);

export default Club;
