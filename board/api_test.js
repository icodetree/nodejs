const morgan = require("morgan");
const axios = require("axios");

const express = require("express");
const app = express();

// 포트설정
app.set("port", 3000);

// 공통미들웨어
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// axios
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/api_test.html");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 실행중...");
});
