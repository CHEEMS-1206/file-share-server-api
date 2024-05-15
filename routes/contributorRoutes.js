import express from "express";
import bodyParser from "body-parser";

// import controllers for contributors
import * as contributorControllers from "../controllers/contributor/contributor.js"

// define router
const contributorRouter = express.Router();

contributorRouter.get("/profile",contributorControllers.getProfileData) // get profile data
contributorRouter.get("/my-files",contributorControllers.myFiles) // all files uploaded
contributorRouter.get("/my-file/:file_id",contributorControllers.fileById) // details about particular file
contributorRouter.put("/my-file/:file_id", contributorControllers.updateFile) // update file details
contributorRouter.patch("/my-file/:file_id", contributorControllers.updateFile) // update file details
contributorRouter.delete("/my-file/:file_id", contributorControllers.deleteFile) // delete particular file
contributorRouter.post("/add-new", contributorControllers.addNewFile) // add new file
contributorRouter.get("/my-file-downloads", contributorControllers.downloadHistory) // get my file download history
contributorRouter.patch("/my-file/reset-password/:file_id", contributorControllers.resetPasswordForFile) // reset the file password

export default contributorRouter;
