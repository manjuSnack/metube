import User from "../models/user";
//import Video from "../models/video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) =>
  res.render("users/join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { name, username, email, password, confirmPassword, location } =
    req.body;
  const pageTitle = "Join";
  if (password !== confirmPassword) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "Password confirmation does not match.",
    });
  }
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("users/join", {
      pageTitle,
      errorMessage: "This username/email is already taken.",
    });
  }
  try {
    await User.create({
      name,
      username,
      email,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res
      .status(400)
      .render("users/join", { pageTitle, errorMessage: error._message });
  }
};
export const getLogin = (req, res) =>
  res.render("users/login", { pageTitle: "Login" });

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username, socialOnly: false });
  if (!user) {
    return res.status(400).render("users/login", {
      pageTitle,
      errorMessage: "An account with this username does not exists.",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("users/login", {
      pageTitle,
      errorMessage: "Wrong password",
    });
  }
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  // res.send(JSON.stringify(json));
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
export const getEdit = (req, res) => {
  return res.render("users/edit-profile", { pageTitle: "Edit Profile" });
};
export const postEdit = async (req, res) => {
  /* 
  * Code of Another World.
  const id = req.session.user.id;
  const { name, email, username, location } = req.body;
  */
  const pageTitle = "Edit Profile";
  const {
    session: {
      user: { _id, socialOnly, avatarUrl },
    },
    body: { name, email, username, location },
    file,
  } = req;
  console.log(file);
  const existsUsername = await User.exists({ username });
  const existsEmail = await User.exists({ email });

  // Quiz Challenge.
  if (username === req.session.user.username) {
  } else if (existsUsername === true || socialOnly === true) {
    return res.status(400).render("users/edit-profile", {
      pageTitle,
      errorMessage: `This ${username} is already taken. Or This ${username} can't be changed Github Username in anyway.`,
    });
  }
  if (email === req.session.user.email) {
  } else if (existsEmail === true || socialOnly === true) {
    return res.status(400).render("users/edit-profile", {
      pageTitle,
      errorMessage: `This ${email} is already taken. Or This ${email} can't be changed Github Email in anyway.`,
    });
  }
  //try {
  const isHeroku = process.env.NODE_ENV === "production";
  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? (isHeroku ? file.location : file.path) : avatarUrl,
      name, //name: name,
      email,
      username,
      location,
    },
    { new: true }
  );
  /* 
    * Code of Another world.
    req.session.user = {
    ...req.session.user,
    name,
    email,
    username,
    location,
  }; */
  req.session.user = updateUser;
  //return res.redirect("/users/edit");
  return res.redirect(`/users/${_id}`);

  /*
     * Code of Another World
  } catch (error) {
    return res.status(400).render("edit-profile", {
      pageTitle,
      errorMessage: `This username/email is already taken.`,
    });
  }
  */
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { oldPassword, newPassword, newPasswordConfirmation },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password); // in DB storage
  //const ok = await bcrypt.compare(oldPassword, req.session.user.password); in session Storage
  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The current password is incorrect.",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "Change Password",
      errorMessage: "The password does not match the confirmation.",
    });
  }
  //const user = await User.findById(_id);
  console.log("old pw / hash : ", user.password);
  user.password = newPassword;
  console.log("new pw / not hash : ", user.password);
  await user.save(); // DB Storage
  console.log("un new pw / hash : ", user.password);
  //req.session.user.password = user.password; // Session Storage
  return res.redirect("/users/logout");
};
export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "videos",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  console.log(user);
  if (!user) {
    return res.status(404).render("404", { pageTitle: "User not found." });
  }
  //const videos = await Video.find({ owner: user._id });
  return res.render("users/profile", {
    pageTitle: `${user.name} Profile`,
    user,
    //videos,
  });
};
