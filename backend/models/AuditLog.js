import mongoose from 'mongoose';

/**
 * AuditLog Schema
 * Immutable system telemetry and event trail for Vasavi Club International
 */
const auditLogSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    module: {
      type: String,
      required: [true, 'Module classification is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action identifier is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    reference: {
      type: String,
      trim: true,
      default: 'N/A',
    },
    user: {
      type: String,
      required: [true, 'User identifier is required'],
      trim: true,
      default: 'SYSTEM',
    },
    role: {
      type: String,
      trim: true,
      default: 'anonymous',
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: ['Success', 'Failed'],
      default: 'Success',
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: 'None recorded',
    },
  },
  {
    timestamps: false, // We use explicit timestamp per requirement
  }
);

// Compound index for efficient sorted querying
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
