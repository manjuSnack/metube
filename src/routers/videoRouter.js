import express from "express";
import {
  getUpload,
  postUpload,
  watch,
  getEdit,
  postEdit,
  deleteVideo,
} from "../controllers/videoController";
import { protectorMiddleware, videoUpload } from "../middlewares";

const ROUTE = "/:id([0-9a-f]{24})";

const videoRouter = express.Router();

videoRouter.route(ROUTE).get(watch);
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(videoUpload.fields([{ name: "video" }, { name: "thumb" }]), postUpload);
//- .post(videoUpload.single("video"), postUpload);
videoRouter
  .route(ROUTE + "/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(postEdit);
videoRouter
  .route(ROUTE + "/delete")
  .all(protectorMiddleware)
  .get(deleteVideo);

export default videoRouter;
