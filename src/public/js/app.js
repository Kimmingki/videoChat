// frontend socket 연결
const socket = io();

// chat document
const nickname = document.getElementById("nickname");
const form = nickname.querySelector("form");
const welcome = document.getElementById("welcome");
const room = document.getElementById("room");

// chat init
let roomName = "";
welcome.hidden = true;
room.hidden = true;

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
