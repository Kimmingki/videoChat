import express from "express";
import http from "http";
import SocketIO from "socket.io";

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

const server = http.createServer(app);
const io = SocketIO(server);

// 유저 정보
const sockets = [];

// socketIO 연결
io.on("connection", (socket) => {
  socket.on("enter_room", (room, done) => {
    socket.join(room);
    done();
  });
});

server.listen(PORT, handleListen);
