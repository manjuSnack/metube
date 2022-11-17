import express from "express";
import {
  registerView,
  createComment,
  getEditComment,
  postEditComment,
  deleteComment,
} from "../controllers/videoController";
import { protectorMiddleware } from "../middlewares";

const ROUTE = "/videos/:id([0-9a-f]{24})";

const apiRouter = express.Router();

/* 
apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
*/

apiRouter
  .route(ROUTE + "/view")
  .all(protectorMiddleware)
  .post(registerView);

apiRouter
  .route(ROUTE + "/comment")
  .all(protectorMiddleware)
  .post(createComment);

/*
apiRouter
  .route(ROUTE + "/edit")
  .all(protectorMiddleware)
  .get(getEditComment)
  .post(postEditComment);
*/

apiRouter
  .route(ROUTE + "/delete")
  .all(protectorMiddleware)
  .delete(deleteComment);

export default apiRouter;
