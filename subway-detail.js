const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, ".env") });

const morgan = require("morgan");
const axios = require("axios");
const express = require("express");
const app = express();


app.set("port", process.env.PORT);

// 공통미들웨어
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우팅
app.get("/subway/detail", async (req, res) => {
  const serviceKey = process.env.dataServiceKey;
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
    const subwayItems = result.data.response.body.items.item;
    
    // subwayItems 변수를 HTML 형식으로 변환합니다.
    // 다음 redis 배우기
    let html = '<html><head><title>Subway Data</title></head><body><table border="1" style="border-collapse: collapse;"><tr><th>subwayRouteName</th><th>subwayStationId</th><th>subwayStationName</th></tr>';
    for (let i = 0; i < subwayItems.length; i++) {
      html += `<tr><td>${subwayItems[i].subwayRouteName}</td><td>${subwayItems[i].subwayStationId}</td><td>${subwayItems[i].subwayStationName}</td></tr>`;
    }
    html += '</table></body></html>';

    res.send(html)

  } catch (error) {
    console.log(error);
  }
});
app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 실행중...");
});
