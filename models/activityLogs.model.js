import mongoose from "mongoose";
const { Schema, model } = mongoose;


const activityLogSchema = new Schema({
    companyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true,
    },
    action:{
        type: String,
        required: true
    },
    details: {
        type: String,
    },
}, {timestamps: true});


const ActivityLogs = model("ActivityLogs", activityLogSchema)
export default ActivityLogs;