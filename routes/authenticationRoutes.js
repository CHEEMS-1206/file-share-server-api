import express from "express";
import bodyParser from "body-parser";

// import controllers for Authentication
import * as authControllers from "../controllers/auth/auth.js"

// define router
const authRouter = express.Router();

authRouter.post("/new-user/register",authControllers.register); // generate otp on email
authRouter.post("/new-user/email-verification",authControllers.otpForNewUser) // generate new otps
authRouter.post("/new-user/otp-verify",authControllers.otpForNewUserVerify) // check if the otp is correct
authRouter.post("/login",authControllers.login) // login user
authRouter.post("/forgot-password",authControllers.forgotPassword) // generates an otp
authRouter.post("/otp-verify",authControllers.otpVerifyForPasswordChange) // verify the otp
authRouter.post("/change-password", authControllers.changePassword) // overwrite the enw password

export default authRouter;