const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, ".env") });

const morgan = require("morgan");
const axios = require("axios");
const express = require("express");
const app = express();

// redis
const redis = require("redis");
const client = redis.createClient(6379, "127.0.0.1");

client.on("error", (err) => {
  console.log("Redis Error : " + err);
});

// 포트설정
app.set("port", process.env.PORT);

// 공통미들웨어
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우팅
app.get("/subway", async (req, res) => {
  await client.lrange("subwayItems", 0, -1, async (err, cachedItems) => {
    if (err) throw err;

    // 캐시가 있을경우 체크
    if (cachedItems.length) {
      res.send(`데이터 캐시가 있습니다. <br>
      지역 : ${cachedItems[0]} / 시간 : ${cachedItems[1]} <br>`);
    } else {
      const serviceKey = process.env.dataServiceKey;
      const subwayUrl =
        "http://apis.data.go.kr/1613000/SubwayInfoService/getKwrdFndSubwaySttnList?";

      let paramsURI = encodeURI("serviceKey") + "=" + serviceKey;
      paramsURI +=
        "&" + encodeURI("subwayStationName") + "=" + encodeURI("서울역");
      paramsURI += "&" + encodeURI("numOfRows") + "=" + encodeURI("10");
      paramsURI += "&" + encodeURI("pageNo") + "=" + encodeURI("1");
      paramsURI += "&" + encodeURI("_type") + "=" + encodeURI("json");

      const url = subwayUrl + paramsURI;

      try {
        const result = await axios.get(url);
        res.json(result.data);

        const subwayItem = {
          location: result.data,
        };

        subwayItem.forEach((val) => {
          client.rPush("subwayItem", val); // redis저장
        });

        console.log("너누구냐???", subwayItem.location);

        client.expire("subwayItem", 60 * 60);
        res.send("캐시된 데이터가 없습니다.");
      } catch (error) {
        console.log(error);
      }
    }
  });
});
app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 실행중...");
});
