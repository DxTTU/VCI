import mongoose from 'mongoose';

/**
 * Member Schema
 * Clinical dossier specification for Vasavi Clubs International Individual Members
 */
const memberSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: [true, 'Vasavi Member ID is mandatory'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    // Step 1: Basic Personal Dossier
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [60, 'First name cannot exceed 60 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [60, 'Last name cannot exceed 60 characters'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required for Vasavi records'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Non-Binary', 'Other', 'Prefer Not to Disclose'],
      default: 'Prefer Not to Disclose',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required for community service & emergency readiness'],
    },
    occupation: {
      type: String,
      trim: true,
      maxlength: [100, 'Occupation descriptor cannot exceed 100 characters'],
    },

    // Step 2: Telecommunications & Physical Registry
    email: {
      type: String,
      required: [true, 'Primary electronic address is mandatory'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please supply a valid personal or corporate email address',
      ],
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Telephonic contact number is mandatory'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City classification is required'],
      trim: true,
    },
    state: {
      type: String,
      default: 'Tamil Nadu',
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },

    // Step 3: Vasavi Club Affiliation & Institutional Placement
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: [true, 'Institutional club affiliation is mandatory'],
      index: true,
    },
    membershipType: {
      type: String,
      enum: ['Regular', 'Associate', 'Affiliate', 'Honorary', 'Life', 'Student'],
      default: 'Regular',
    },
    role: {
      type: String,
      enum: ['member', 'admin'],
      default: 'member',
      index: true,
    },
    designation: {
      type: String,
      default: 'Vasavi Member',
    },
    sponsorMemberId: {
      type: String,
      trim: true,
      uppercase: true,
    },
    sponsorName: {
      type: String,
      trim: true,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'Transferred', 'Resigned', 'Suspended'],
      default: 'Active',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for Full Formal Name
memberSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const Member = mongoose.model('Member', memberSchema);

export default Member;
