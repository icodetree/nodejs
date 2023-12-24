const morgan = require("morgan");
const url = require("url");
const uuidAPIkey = require("uuid-apikey");
const cors = require("cors");

const express = require("express");
const app = express();

// 포트설정
app.set("port", process.env.PORT || 8080);

// 공통미들웨어
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const key = {
  apiKey: "XT0P98P-DGR492J-GR04P2J-M90XKN5",
  uuid: "ee8164a2-6c30-448a-8600-4b0aa241d9d4",
};

// 테스트를 위한 게시글 데이터
let boardList = [];
let numOfBoard = 0;

// 라우팅설정
app.get("/", (req, res) => {
  res.send("This is api.js");
});

// 게시글 API
app.get("/board", (req, res) => {
  res.send(boardList);
});

app.post("/board", (req, res) => {
  const board = {
    id: ++numOfBoard,
    user_id: req.body.user_id,
    data: new Date(),
    title: req.body.title,
    content: req.body.contnet,
  };
  boardList.push(board);

  res.redirect("/board");
});

app.put("/board:id", (req, res) => {
  // req.params.id값 찾아 리스트에서 삭제
  const findItem = boardList.find((item) => {
    return item.id == +req.params.id;
  });

  const idx = boardList.indexOf(findItem);
  boardList.splice(idx, 1);

  //   리스트에 새로운 요소 추가
  const board = {
    id: ++numOfBoard,
    user_id: req.body.user_id,
    data: new Date(),
    title: req.body.title,
    content: req.body.contnet,
  };
  boardList.push(board);

  res.redirect("/board");
});

app.delete("/board:id", (req, res) => {
  // req.params.id값 찾아 리스트에서 삭제
  const findItem = boardList.find((item) => {
    return item.id == +req.params.id;
  });

  const idx = boardList.indexOf(findItem);
  boardList.splice(idx, 1);

  res.redirect("/board");
});

// 게시글 API
app.get("/board/:apikey/:type", (req, res) => {
  let { type, apikey } = req.params;
  const queryData = url.parse(req.url, true).query;

  if (uuidAPIkey.isAPIkey(apikey) && uuidAPIkey.check(apikey, key.uuid)) {
    if (type === "search") {
      const keyword = queryData.keyword;
      const result = boardList.filter((e) => {
        return e.title.includes(keyword);
      });
      res.send(result);
    } else if (type === "user") {
      const user_id = queryData.user_id;
      const result = boardList.filter((e) => {
        return e.user_id === user_id;
      });
      res.send(result);
    } else {
      res.send("Wrong URL");
    }
  } else {
    res.send("wrong API key");
  }
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 실행중...");
});
