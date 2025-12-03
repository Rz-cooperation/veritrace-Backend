import mongoose from "mongoose";
const{Schema, model} = mongoose;




const QRScanSchema = new Schema({
    companyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    batchId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "productionBatch",
        required: true,
    },
    scannedAt: {
        type: Date,
        default: Date.now,
    }
});

const Scan = model("Scan", QRScanSchema);
export default Scan;



