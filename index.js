const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const app = express();

app.set("port", process.env.PORT || 3000);
app.use(express.static(__dirname + "/public"));
app.use(morgan("dev"));
app.use(cookieParser("secret@1234"));

app.use(
  session({
    secret: "secret@1234",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  if (req.session.name) {
    const output = `
    <h2>로그인한 사용자님</h2><br>
    <p>${req.session.name}님 안녕하세요</p><br>
    `;
    res.send(output);
  } else {
    const output = `
      <h2>로그인하지 않은 사용자입니다.</h2><br>
      <p>로그인 해주세요.</p><br>
    `;
    res.send(output);
  }
});

app.get("/login", (req, res) => {
  console.log(req.session);
  //세션쿠키를 사용할 경우
  req.session.name = "로드북";
  res.end("Login OK");
});
app.get("/logout", (req, res) => {
  res.clearCookie("connect.sid"); //세션쿠키 삭제
  res.end("Logout Ok");
});

//서버포트 연결
app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 실행중...");
});
