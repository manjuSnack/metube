//const express = required("express");
import express from "express";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import { localsMiddleware, ffmpegConfig } from "./middlewares.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import apiRouter from "./routers/apiRouter";
import flash from "express-flash";

const app = express();
const logger = morgan("dev");

app.use(logger);
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(express.urlencoded({ extended: true })); //- pug
app.use(express.json()); //- Comment
app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

/*
app.use((req, res, next) => {
  console.log(res);
  req.sessionStore.all((error, sessions) => {
    console.log(sessions);
    next();
  });
});
*/

app.use(flash());
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads")); //upload file storage
app.use("/assets", express.static("assets")); // assets file storage

//- ffmpeg Config
app.use(ffmpegConfig);
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
