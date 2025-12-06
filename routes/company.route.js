import {getDashboardStats, createFlourBatch, getFlourBatches} from "../controllers/company.controller.js"
import {verifyToken} from "../middlewares/auth.middleware.js"
import {Router} from "express";

const companyRouter = Router();


companyRouter.get("/dashboard", verifyToken, getDashboardStats);
companyRouter.post("/flourbatches", verifyToken, createFlourBatch);
companyRouter.get("/getflourbatches", verifyToken, getFlourBatches);


export default companyRouter;