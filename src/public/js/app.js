// frontend socket 연결
const socket = io();

// chat document
const nickname = document.getElementById("nickname");
const form = nickname.querySelector("form");
const welcome = document.getElementById("welcome");
const room = document.getElementById("room");

// video document
const call = document.getElementById("call");
const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameras");

// chat init
let roomName = "";
welcome.hidden = true;
room.hidden = true;

// video init
let myStream;
let myPeerConnection;
let muted = false;
let cameraOff = false;
call.hidden = true;

// ---------------- Start video function part ------------------
const getCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      cameraSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
};
const getMidea = async (deviceId) => {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstrains = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : initialConstrains
    );
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
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

const handleCameraChange = async () => {
  await getMidea(cameraSelect.value);
};

const initCall = async () => {
  welcome.hidden = true;
  call.hidden = false;
  await getMidea();
  makeConnection();
};
// ---------------- End video function part ------------------

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
  room.hidden = false;
  form.addEventListener("submit", handleMessageSubmit);
};

const handleRoomSubmit = async (event) => {
  event.preventDefault();
  const input = welcome.querySelector("input");
  await initCall();
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

// event listen
form.addEventListener("submit", handleNickSubmit);
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
cameraSelect.addEventListener("input", handleCameraChange);

// socket event
socket.on("welcome", async (nickname, countUser) => {
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName);
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
socket.on("offer", async (offer) => {
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
});
socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});

// RTC (화상채팅)
const makeConnection = () => {
  myPeerConnection = new RTCPeerConnection();
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
};
