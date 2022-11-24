import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const isHeroku = process.env.NODE_ENV === "production";

const s3ImageUploader = multerS3({
  s3: s3,
  bucket: "metube-exercise",
  acl: "public-read",
  key: function (req, file, cb) {
    const fileName = Date.now().toString() + "-" + file.originalname;
    const path = "images/" + fileName;
    cb(null, path);
  },
});

const s3VideoUploader = multerS3({
  s3: s3,
  bucket: "metube-exercise",
  acl: "public-read",
  key: function (req, file, cb) {
    const fileName = Date.now().toString() + "-" + file.originalname;
    const path = "videos/" + fileName;
    cb(null, path);
  },
});

// Session information
export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.siteName = "Metube";
  res.locals.loggedInUser = req.session.user || {};
  res.locals.isHeroku = isHeroku;
  next();
};

// Login User
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Login in first");
    return res.redirect("/login");
  }
};

// Public User
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
};

// Upload File ( avatar images)
export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 3000000, // 3MB
  },
  storage: isHeroku ? s3ImageUploader : undefined,
});
export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 10000000, // 10MB
  },
  storage: isHeroku ? s3VideoUploader : undefined,
});

// ffmpeg Config - Error: SharedArrayBuffer is not defined.
export const ffmpegConfig = (req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
};
