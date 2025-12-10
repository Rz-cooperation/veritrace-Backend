import mongoose from "mongoose";
const { Schema, model } = mongoose;

const FraudAlertSchema = new Schema(
    {
        companyId: {
            type: Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
        },
        batchId: {
            type: Schema.Types.ObjectId,
            ref: "ProductionBatch",
            required: true,
        },
        severity: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"], // Helps you color code the frontend (Yellow, Orange, Red)
            default: "MEDIUM",
        },
        message: {
            type: String, // e.g., "Oven temp 500°C is dangerously high"
            required: true,
        },
        isResolved: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const FraudAlert = model("FraudAlert", FraudAlertSchema);
export default FraudAlert;