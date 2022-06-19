import express from "express";

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

// ------------- routing -----------------

// 서버 가동
app.listen(PORT, () => {
  console.log(`✅ Listening on http://localhost:4000`);
});
