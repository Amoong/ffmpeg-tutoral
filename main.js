const { createFFmpeg, fetchFile } = FFmpeg;

// 초기화
const ffmpeg = createFFmpeg({
  log: true,
});
(async () => await ffmpeg.load())();

function setProgressBar(container) {
  console.log(container);
  const progressBar = container.querySelector(".progress-bar");

  console.log(progressBar);

  ffmpeg.setProgress((p) => {
    progressBar.style.transform = `scaleX(${p.ratio})`;
  });
}

const video = document.getElementById("sampleVideo");
const uploader = document.getElementById("uploader");
const buttons = document.querySelectorAll("button");
let videoFile;

uploader.addEventListener("change", uploadVideo);

function uploadVideo(e) {
  const {
    target: { files },
  } = e;
  videoFile = files[0];
  const blob = URL.createObjectURL(videoFile);
  video.src = blob;

  buttons.forEach((button) => {
    button.disabled = false;
  });
}

/**
 * 비디오 확장자 변환
 */
const conversionCont = document.getElementById("videoConversion");
const conversionBtn = conversionCont.querySelector("button");

conversionBtn.addEventListener("click", convertVideo);

async function convertVideo() {
  setProgressBar(conversionCont);

  ffmpeg.FS("writeFile", videoFile.name, await fetchFile(videoFile));

  await ffmpeg.run("-i", videoFile.name, "output.mov");
  const data = ffmpeg.FS("readFile", "output.mov");

  const videoUrl = URL.createObjectURL(
    new Blob([data.buffer], { type: "video/mov" })
  );

  downloadFile(videoUrl, "video.mov");
}

function downloadFile(url, fileName) {
  const img = document.createElement("img");
  img.src = url;

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
}

const croppingCont = document.getElementById("videoCropping");
const croppingBtn = croppingCont.querySelector("button");

croppingBtn.addEventListener("click", cropVideo);

async function cropVideo() {
  setProgressBar(croppingCont);

  ffmpeg.FS("writeFile", videoFile.name, await fetchFile(videoFile));

  const outputFileName = "output.mp4";

  await ffmpeg.run(
    "-i",
    videoFile.name,
    "-ss",
    "10",
    "-t",
    "5",
    outputFileName
  );
  const croppedVideo = ffmpeg.FS("readFile", outputFileName);

  const videoUrl = URL.createObjectURL(
    new Blob([croppedVideo.buffer], { type: "video/mp4" })
  );

  downloadFile(videoUrl, outputFileName);
}

/**
 * 썸네일
 */
const thumbnailCont = document.getElementById("gettingThumbnail");
const thumbnailBtn = thumbnailCont.querySelector("button");

thumbnailBtn.addEventListener("click", getThumbnail);

async function getThumbnail() {
  setProgressBar(thumbnailCont);

  const thumbFileName = "thumbnail.jpg";

  ffmpeg.FS("writeFile", videoFile.name, await fetchFile(videoFile));

  await ffmpeg.run(
    "-i",
    videoFile.name,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    thumbFileName
  );

  const thumbFile = ffmpeg.FS("readFile", thumbFileName);

  const thumbUrl = URL.createObjectURL(
    new Blob([thumbFile.buffer], { type: "image/jpg" })
  );

  downloadFile(thumbUrl, thumbFileName);
}

/**
 * 오디오 추출
 */
const extractingAudioCont = document.getElementById("extractingAudio");
const extractingBtn = extractingAudioCont.querySelector("button");

extractingBtn.addEventListener("click", extractAudio);

async function extractAudio() {
  setProgressBar(extractingAudioCont);

  const audioFileName = "audio.mp3";

  ffmpeg.FS("writeFile", videoFile.name, await fetchFile(videoFile));

  await ffmpeg.run("-i", videoFile.name, "-vn", audioFileName);

  const audio = ffmpeg.FS("readFile", audioFileName);
  const auidoUrl = URL.createObjectURL(
    new Blob([audio.buffer], { type: "audio/mp3" })
  );

  downloadFile(auidoUrl, audioFileName);
}

/**
 * 움짤
 */
const makingGifCont = document.getElementById("makingGif");
const gifBtn = makingGifCont.querySelector("button");

gifBtn.addEventListener("click", makeGif);

async function makeGif() {
  setProgressBar(makingGifCont);

  const gifFileName = "mygif.gif";

  ffmpeg.FS("writeFile", videoFile.name, await fetchFile(videoFile));

  await ffmpeg.run(
    "-i",
    videoFile.name,
    "-ss",
    "5",
    "-t",
    "2",
    "-r",
    "16",
    "-s",
    "640x360",
    gifFileName
  );

  const gifFile = ffmpeg.FS("readFile", gifFileName);
  const auidoUrl = URL.createObjectURL(
    new Blob([gifFile.buffer], { type: "image/gif" })
  );

  downloadFile(auidoUrl, gifFileName);
}

/**
 * 워터마크
 */
const watermarkCont = document.getElementById("watermark");
const watermarkBtn = watermarkCont.querySelector("button");

watermarkBtn.addEventListener("click", attachWatermark);

async function attachWatermark() {
  setProgressBar(watermarkCont);

  const imageFileName = "watermark.jpg";

  const fileInput = watermarkCont.querySelector("input");
  const { files } = fileInput;

  if (files.length === 0) {
    alert("Select file");
    return;
  }

  const imageFile = files[0];

  ffmpeg.FS("writeFile", imageFile.name, await fetchFile(imageFile));
  ffmpeg.FS("writeFile", videoFile.name, await fetchFile(videoFile));

  const ouputFileName = "output.mp4";

  await ffmpeg.run(
    "-i",
    videoFile.name,
    "-i",
    imageFile.name,
    "-filter_complex",
    "overlay=50:50",
    "-ss",
    "0",
    "-t",
    "10",
    ouputFileName
  );

  const gifFile = ffmpeg.FS("readFile", ouputFileName);
  const auidoUrl = URL.createObjectURL(
    new Blob([gifFile.buffer], { type: "video/mp4" })
  );

  downloadFile(auidoUrl, ouputFileName);
}
