import {getDashboardStats, createFlourBatch, getFlourBatches, createProductionBatch, getProductionBatches, generateQR} from "../controllers/company.controller.js"
import {verifyToken} from "../middlewares/auth.middleware.js"
import {Router} from "express";

const companyRouter = Router();


companyRouter.get("/dashboard", verifyToken, getDashboardStats);
companyRouter.post("/flourbatches", verifyToken, createFlourBatch);
companyRouter.get("/getflourbatches", verifyToken, getFlourBatches);
companyRouter.post("/productionBatches", verifyToken, createProductionBatch)
companyRouter.get("/getproductionbatches", verifyToken, getProductionBatches);
companyRouter.post("/batch/:id/qr", verifyToken, generateQR)

export default companyRouter;