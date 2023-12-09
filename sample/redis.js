const express = require("express");
const redis = require("redis");
const router = express.Router();

const client = redis.createClient(6379, "127.0.0.1");

router.get("/sm", function (req, res, next) {
  client.get("mykey", (err, value) => {
    console.log(value);
    client.quit(); // 작업이 완료되면 Redis 클라이언트를 닫습니다.
  });
});
module.exports = router;
