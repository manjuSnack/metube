//require("dotenv").config();
import "dotenv/config";
import "./db";
import "./models/user";
import "./models/video";
import "./models/Comment";
import app from "./server";

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server Listening on http://localhost:${PORT} 🍪`);
});
