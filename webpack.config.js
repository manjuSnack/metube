const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const BASE_JS = "./src/client/js/";

//console.log(path.resolve(__dirname, "assets", "js"));
module.exports = {
  entry: {
    main: BASE_JS + "main.js",
    videoPlayer: BASE_JS + "videoPlayer.js",
    recorder: BASE_JS + "recorder.js",
    commentSection: BASE_JS + "commentSection.js",
  },
  //watch: true, // Turn on watch mode. This means that after the initial build, webpack will continue to watch for changes in any of the resolved files.
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/style.css", // Edit a css file path
    }),
  ],
  //- mode: "development", // option : development or production
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        //use: ["style-loader", "css-loader", "sass-loader"], // It's not use MiniCssExtractPlugin.
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};
