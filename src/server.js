import express from "express";
import http from "http";
import SocketIO from "socket.io";

// variable
const app = express();
const PORT = 4000;

// middleware
app.set("view engine", "pug"); // 템플릿 설정 및 경로지정
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

// routing
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("home"));

// server 구동
const server = http.createServer(app);
const io = SocketIO(server);

// adapter
const publicRooms = () => {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = io;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
};

// 유저 정보
const sockets = [];

// socketIO 연결
io.on("connection", (socket) => {
  // init
  socket["nickname"] = "Anon";
  // 채팅방 접속
  socket.on("enter_room", (room, done) => {
    socket.join(room);
    done();
    socket.to(room).emit("welcome", socket.nickname);
    io.sockets.emit("rooms", publicRooms()); // 방 정보
  });
  // 채팅방 퇴장
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname)
    );
  });
  socket.on("disconnect", () => {
    io.sockets.emit("rooms", publicRooms()); // 방 정보
  });
  // 채팅
  socket.on("message", (msg, room, done) => {
    socket.to(room).emit("message", `${socket.nickname}: ${msg}`);
    done();
  });
  // 닉네임
  socket.on("nickname", (nickname, done) => {
    socket["nickname"] = nickname;
    done();
  });
});

server.listen(PORT, () => console.log(`✅ Listening on http://localhost:4000`));
