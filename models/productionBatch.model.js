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
    bakingTime:{
        type: Number,
        required: true
    },
    ovenTemp:{
        type: Number,
        required: true,
    },
    batchNumber:{
        type: String,
        required: true,
        unique: true
    },
    qrCode:{
        type: String,
    },
}, {timestamps: true});


const ProductionBatch = new model("ProductionBatch", productionBatchSchema);
export default ProductionBatch;