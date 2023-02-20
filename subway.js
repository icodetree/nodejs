const morgan = require("morgan");
const axios = require("axios");
const express = require("express");
const app = express();

app.set("port", process.env.PORT || 8080);

// 공통미들웨어
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우팅
app.get("/subway", async (req, res) => {
  const serviceKey = "qL1QL2Oxca%2FmAs6NHcJrp0B7eq%2F86cU9t%2BW4YORy3iDP0dZPoGd5BOQwyogmqyM6da6BN8yjJ4SynjB25ajIJQ%3D%3D";
  const subwayUrl =
    "http://apis.data.go.kr/1613000/SubwayInfoService/getKwrdFndSubwaySttnList?";

  let paramsURI = encodeURI("serviceKey") + "=" + serviceKey;
  paramsURI += "&" + encodeURI("subwayStationName") + "=" + encodeURI("서울역");
  paramsURI += "&" + encodeURI("numOfRows") + "=" + encodeURI("10");
  paramsURI += "&" + encodeURI("pageNo") + "=" + encodeURI("1");
  paramsURI += "&" + encodeURI("_type") + "=" + encodeURI("json");

  const url = subwayUrl + paramsURI;

  console.log(paramsURI);

  try {
    const result = await axios.get(url);
    res.json(result.data);
  } catch (error) {
    console.log(error);
  }
});
app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 실행중...");
});
