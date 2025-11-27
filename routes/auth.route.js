import { SignUp } from "../controllers/auth.controllers.js";
import { Router } from "express";


const authRouter = Router();

authRouter.post('/sign-up', SignUp);


export default authRouter;