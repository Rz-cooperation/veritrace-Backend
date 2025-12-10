import mongoose from "mongoose";
const { Schema, model } = mongoose;

const QRScanSchema = new Schema(
    {
        // Removed companyId (Customers don't have this info, and we can find it via batchId)

        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductionBatch", 
            required: true,
            index: true, // Makes analytics queries faster
        },

        // The Location Data (Optional, as requested)
        location: {
            city: String,
            country: String,
            latitude: Number,
            longitude: Number,
        },

        // Device Info (Optional - helps detect if 1 person scans 500 times)
        deviceInfo: {
            type: String, // e.g., "iPhone 14 - Safari"
        },

        scannedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Scan = model("Scan", QRScanSchema);
export default Scan;