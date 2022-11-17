import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile; //- It's The event.data URL in recorder video

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl; //- a Video or jpg file URL to download
  a.download = fileName; //- a Video or jpg file name to download
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  //- encorder (ffmpeg : github.com/ffmpegwasm/ffmpeg.wasm)

  actionBtn.removeEventListener("click", handleDownload);
  actionBtn.innerText = "Transcoding...";
  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

  await ffmpeg.run("-i", files.input, "-r", "60", files.output); //- "-i" : input, "-r" : frame. "60" : 60 frame

  //- "-ss" : time move. "00:00:01" : time cut. "-frames:v" : screen shot. "1" : 1 screen shot. "thumbnail.jpg" : File name
  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  );

  //- save a Uint8Array type File
  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  //- binary data
  console.log("mp4File :", mp4File);
  console.log("mp4File Buffer :", mp4File.buffer);

  //- Change a binary data to mp4 file or jpg file.
  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  //- Changed a mp4 file or a jpg file
  console.log("mp4Blob :", mp4Blob);
  console.log("thumbBlob :", thumbBlob);

  //- It is possible to download with a URL
  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  // URL
  console.log("mp4Url :", mp4Url);
  console.log("thumbUrl :", thumbUrl);

  //- Download link and Thumbnail
  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  //- It's clean a browser memory
  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  //- It's clean a brower memory
  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  init();
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStart);
};

const handleStop = () => {
  actionBtn.innerText = "Download Recording";
  actionBtn.removeEventListener("click", handleStop);
  actionBtn.addEventListener("click", handleDownload);
  recorder.stop();
};

const handleStart = () => {
  //- actionBtn.innerText = "Stop Recording";
  actionBtn.innerText = "Recording";
  actionBtn.disabled = true;
  actionBtn.removeEventListener("click", handleStart);
  //- actionBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream, { mineType: "video/webm" });
  recorder.ondataavailable = (event) => {
    console.log("Blom :", event.data);
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();

    actionBtn.innerText = "Download";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload);
  };
  recorder.start();
  setTimeout(() => {
    recorder.stop();
  }, 5000);
};

//- video Preview
const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    //- video: true,
    video: {
      width: 1024,
      height: 576,
    },
  });
  console.log("stream :", stream);
  video.srcObject = stream;
  video.play();
};

//- a video Preview Run
init();

actionBtn.addEventListener("click", handleStart);
