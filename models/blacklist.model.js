import mongoose from "mongoose";
const {Schema, model} = mongoose;



const BlacklistSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    }
},{timestamps: true});


BlacklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Blacklist = model("Blacklist", BlacklistSchema);
export default Blacklist;