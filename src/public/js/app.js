const ul = document.querySelector("ul");
const nicknameForm = document.querySelector("#nickname");
const messageForm = document.querySelector("#message");
const nicknameInput = nicknameForm.querySelector("input");
const messageInput = messageForm.querySelector("input");

const socket = new WebSocket(`ws://${window.location.host}`);

const makeJson = (type, payload) => {
  const json = { type, payload };
  return JSON.stringify(json);
};

socket.addEventListener("message", async (message) => {
  const li = document.createElement("li");
  li.innerText = await message.data;
  ul.append(li);
});

const handleMessageSubmit = (event) => {
  event.preventDefault();
  socket.send(makeJson("message", messageInput.value));
  messageInput.value = "";
};

const handleNicknameSubmit = (event) => {
  event.preventDefault();
  socket.send(makeJson("nickname", nicknameInput.value));
  nicknameInput.value = "";
};

messageForm.addEventListener("submit", handleMessageSubmit);
nicknameForm.addEventListener("submit", handleNicknameSubmit);
