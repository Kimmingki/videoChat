const ul = document.querySelector("ul");
const form = document.querySelector("form");
const input = form.querySelector("input");

const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("message", async (message) => {
  console.log(await message.data.text());
});

const handleSubmit = (event) => {
  event.preventDefault();
  socket.send(input.value);
  input.value = "";
};

form.addEventListener("submit", handleSubmit);
