import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import Blacklist from "../models/blacklist.model.js";



export const verifyToken = async(req, res, next) => {
    try{
        const token = req.headers["authorization"]?.split(" ")[1];
        if(!token){
            return res.status(400).json({message: "Access denied, no token provided" });
        }
        const isBlacklisted = await Blacklist.exists({ token });
    if (isBlacklisted) {
        return res.status(401).json({ message: "Session expired. Please login again." });
    }
        const verified = jwt.verify(token, JWT_SECRET);
        req.auth = verified;
        next();
    }catch(error){
        return res.status(400).json({message: "Invalid token provided"});
    }
}