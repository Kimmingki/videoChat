const ul = document.querySelector("ul");
const form = document.querySelector("form");
const input = form.querySelector("input");

const socket = new WebSocket(`ws://${window.location.host}`);

const handleSubmit = (e) => {
  e.preventDefault();
  socket.send(input.value);
  input.value = "";
};

form.addEventListener("submit", handleSubmit);
