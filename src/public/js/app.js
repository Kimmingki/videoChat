// frontend socket 연결
const socket = io();

// chat document
const nickname = document.getElementById("nickname");
const form = nickname.querySelector("form");
const welcome = document.getElementById("welcome");
const room = document.getElementById("room");
const hidden = document.getElementById("hidden");

// video document
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");

// chat init
let roomName = "";
welcome.hidden = true;
room.hidden = true;
hidden.hidden = true;

// video init
let myStream;
let muted = false;
let cameraOff = false;

// ---------------- Start chat function part ------------------
const roomTitle = (roomName, userCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (참여: ${userCount})`;
};

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.append(li);
};

const handleMessageSubmit = (event) => {
  event.preventDefault();
  const input = room.querySelector("input");
  const value = input.value;
  socket.emit("message", input.value, roomName, () =>
    addMessage(`You: ${value}`)
  );
  input.value = "";
};

const showChat = (roomName, userCount) => {
  roomTitle(roomName, userCount);
  const form = room.querySelector("form");
  welcome.hidden = true;
  room.hidden = false;
  form.addEventListener("submit", handleMessageSubmit);
};

const handleRoomSubmit = (event) => {
  event.preventDefault();
  const input = welcome.querySelector("input");
  socket.emit("enter_room", input.value, showChat);
  roomName = input.value;
  input.value = "";
};

const showRoom = () => {
  const form = welcome.querySelector("form");
  nickname.hidden = true;
  welcome.hidden = false;
  form.addEventListener("submit", handleRoomSubmit);
};

const handleNickSubmit = (event) => {
  event.preventDefault();
  const input = nickname.querySelector("input");
  socket.emit("nickname", input.value, showRoom);
};
// ---------------- End chat function part ------------------

// ---------------- Start video function part ------------------
const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      cameraSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
};
const getMidea = async () => {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myFace.srcObject = myStream;
    await getCameras();
  } catch (e) {
    console.log(e);
  }
};

const handleMuteClick = () => {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
};

const handleCameraClick = () => {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.innerText = "Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Camera On";
    cameraOff = true;
  }
};
// ---------------- End video function part ------------------

// media
getMidea();

// event listen
form.addEventListener("submit", handleNickSubmit);
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);

// socket event
socket.on("welcome", (nickname, countUser) => {
  roomTitle(roomName, countUser);
  addMessage(`${nickname} Joined😍`);
});
socket.on("bye", (nickname, countUser) => {
  roomTitle(roomName, countUser);
  addMessage(`${nickname} left😭`);
});
socket.on("message", addMessage);
socket.on("rooms", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
