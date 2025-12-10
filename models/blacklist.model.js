import mongoose from "mongoose";
const {Schema, model} = mongoose;



const BlackSchemaList = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    }
},{timestamps: true});


BlacklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Blacklist = model("Blacklist", BlacklistSchema);
export default Blacklist;