import express from "express";
import http from "http";
import WebSocket from "ws";

// -------- variable --------

const app = express();
const PORT = 4000;

// -------- variable --------

// ------------- middleware ----------------

// 템플릿 설정 및 경로지정
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

// ------------- middleware ----------------

// ------------- routing -----------------

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("home"));

// ------------- routing -----------------

const handleListen = () => console.log(`✅ Listening on http://localhost:4000`);

// http, ws 함께 돌리기
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anon";
  console.log("Connected to Browser ✅");
  socket.on("message", (message) => {
    const msg = JSON.parse(message);
    switch (msg.type) {
      case "message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${msg.payload}`)
        );
      case "nickname":
        socket["nickname"] = msg.payload;
    }
  });
});

server.listen(PORT, handleListen);
