import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";



export const verifyToken = async(req, res, next) => {
    try{
        const token = req.headers["Authorization"]?.split(" ")[1];
        if(!token){
            return res.status(400).json({message: "Access denied, no token provided" });
        }
        const verified = jwt.verify(token, JWT_SECRET);
        req.auth = verified;
        next();
    }catch(error){
        return res.status(400).json({message: "Invalid token provided"});
    }
}