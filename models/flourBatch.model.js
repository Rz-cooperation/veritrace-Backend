import mongoose from "mongoose";
const {Schema, model} = mongoose;



const flourBatchSchema = new Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true
    },
    flourType: {
        type: String,
        required: true,
    },
    supplier: {
        String: true
    },
    batchNumber: {
        type: String,
        required: true,
        unique: true
    },
    dateReceived:{
        type: Date,
        default: Date.now
    }
}, {timestamps: true});

const FlourBatch = model("FlourBatch", flourBatchSchema);
export default FlourBatch;