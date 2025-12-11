import { signIn, SignUp, deleteAccount } from "../controllers/auth.controllers.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import upload  from "../middlewares/multer.js"


const authRouter = Router();

authRouter.post('/sign-up', upload.single('logo'), SignUp);
authRouter.post('/sign-in', upload.none(), signIn);
authRouter.delete("/delete-account", verifyToken, deleteAccount);



export default authRouter;