// frontend socket 연결
const socket = io();

// document
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

const handleRoomSubmit = (event) => {
  event.preventDefault();
  const input = form.querySelector("input");
  socket.emit("enter_room", input.value);
  input.value = "";
};

form.addEventListener("submit", handleRoomSubmit);
