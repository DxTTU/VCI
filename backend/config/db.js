import mongoose from 'mongoose';

/**
 * Establish connection to local MongoDB instance
 * Default URI: mongodb://localhost:27017/VASAVIclub
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/VASAVIclub';

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
    });

    console.log(`[SYS.DB // CONNECTED] Host: ${conn.connection.host} | Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[SYS.DB // ERROR] Failed to connect to MongoDB: ${error.message}`);
    console.warn(`[SYS.DB // DIAGNOSTIC] Verify that your MongoDB Compass or local mongod service is active on port 27017.`);
    // Do not terminate process in development so server can still serve health check info
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[SYS.DB // DISCONNECTED] Lost connection to MongoDB instance.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[SYS.DB // RECONNECTED] Re-established connection to MongoDB.');
});
