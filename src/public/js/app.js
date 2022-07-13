// frontend socket 연결
const socket = io();

// document
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

// init
let roomName = "";
room.hidden = true;

// function
const showRoom = () => {
  const h3 = room.querySelector("h3");
  welcome.hidden = true;
  room.hidden = false;
  h3.innerText = `Room ${roomName}`;
};

const handleRoomSubmit = (event) => {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
};

form.addEventListener("submit", handleRoomSubmit);
