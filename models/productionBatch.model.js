import mongoose from "mongoose";
const {Schema, model} = mongoose;



const productionBatchSchema = new Schema({
    companyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    flourBatchId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "FlourBatch",
        required: true,
    },
    bakingStartTime:{
        type: Date,
        required: true
    },
    bakingEndTime:{
        type: Date,
        required: true
    },
    ovenTemp:{
        type: Number,
        required: true,
    },
    batchNumber:{
        type: String,
        required: true,
        unique: true,
        match: [/^BATCH-\d+$/, "Batch number must be in the format 'BATCH-XXX' (e.g., BATCH-202)"],
        uppercase: true
    },
    qrCode:{
        type: String,
    },
    quantityProduced: {
        type: Number,
        required: true,
        min: [1, "Quantity must be at least 1"],
        default: 1
    }
}, {timestamps: true});


const ProductionBatch = new model("ProductionBatch", productionBatchSchema);
export default ProductionBatch;