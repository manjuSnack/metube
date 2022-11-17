import Video from "../models/video";
import User from "../models/user";
import Comment from "../models/Comment";

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("videos/home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;

  const video = await Video.findById(id).populate("owner").populate("comments");
  //const owner = await User.findById(video.owner);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }

  return res.render("videos/watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found" });
  }
  //console.log(typeof video.owner, typeof _id); This types is different.
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not authorized");
    return res.status(403).redirect("/");
  }
  return res.render("videos/edit", {
    pageTitle: `Edit: ${video.title}`,
    video,
  });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ id: _id });
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) != String(_id)) {
    req.flash("error", "You are not the owner of the video.");
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  req.flash("success", "Changes saved.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("videos/upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  //- const { path: fileUrl } = req.file;
  const { video, thumb } = req.files;
  console.log(video, thumb); //- objects of videoUpload.fields in the videoRouter.js
  const { title, description, hashtags } = req.body;

  try {
    const newVideo = await Video.create({
      title,
      description,
      //- fileUrl,
      fileUrl: video[0].path, //- check on console.log(video)
      thumbUrl: thumb[0].path, //- check on console.log(thumb)
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id); // add at Array
    user.save();
    return res.redirect("/");
  } catch (error) {
    return res.render("videos/upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res.status(404).render("404", { pageTitle: "Video not found." });
  }
  if (String(video.owner) != String(_id)) {
    return res.status(403).redirect("/");
  }
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(`^${keyword}`, "i"),
      },
    }).populate("owner");
  }
  return res.render("videos/search", { pageTitle: "Search", videos });
};

//- video liked
export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  console.log(video.meta);
  return res.sendStatus(200);
};

//- Comment
export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;

  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text: text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({ newCommentId: comment._id }); //- add id ( to commentSection.js )
};

export const getEditComment = () => {};
export const postEditComment = () => {};

export const deleteComment = async (req, res) => {
  const {
    session: { user },
    params: { id }, //- comment id in apiRouter
  } = req;

  const comment = await Comment.findById(id).populate("video");

  console.log(comment);

  if (String(comment.owner) !== String(user._id)) {
    return res.sendStatus(404);
  }
  await Comment.findByIdAndDelete(id);
  comment.video.comments.splice(comment.video.comments.indexOf(id), 1); //- javascript
  comment.video.save();
  return res.sendStatus(201);
};
