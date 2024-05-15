import express from "express";
import bodyParser from "body-parser";

// import controllers for receiver
import * as receiverControllers from "../controllers/receiver/receiver.js";

// define router
const receiverRouter = express.Router();

receiverRouter.get("/profile",receiverControllers.getProfileData) // get profile data
receiverRouter.get("/all-files", receiverControllers.allFiles) // shows all the files
receiverRouter.get("/file/:file_id", receiverControllers.fileById) // details about certain file
receiverRouter.get("/all-contributors", receiverControllers.allContributors) // shows all the files
receiverRouter.get("/about-contributor/:contributor_id", receiverControllers.contributorByUserId) // details about certain file
receiverRouter.get("/contributor/files/:contributor_id", receiverControllers.filesByContributorId);
receiverRouter.post("/file/download/:file_id", receiverControllers.downloadFile) // download particular file
receiverRouter.get("/my-download-history", receiverControllers.downloadHistory) // history of all dnlds

export default receiverRouter;
