// frontend socket 연결
const socket = io();

// document
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

// init
let roomName = "";
room.hidden = true;

// ---------------- Start function part ------------------
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

const showRoom = () => {
  const h3 = room.querySelector("h3");
  const form = room.querySelector("form");
  welcome.hidden = true;
  room.hidden = false;
  h3.innerText = `Room ${roomName}`;
  form.addEventListener("submit", handleMessageSubmit);
};

const handleRoomSubmit = (event) => {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
};
// ---------------- End function part ------------------

// event listen
form.addEventListener("submit", handleRoomSubmit);

// socket event
socket.on("welcome", () => addMessage("Someone Joined😍"));
socket.on("bye", () => addMessage("Someone left😭"));
socket.on("message", addMessage);
