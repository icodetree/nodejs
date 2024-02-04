const axios = require("axios");
const cheerio = require("cheerio");

const url = "https://roadbook.co.kr/category/%EC%8B%A0%EA%B0%84%EC%86%8C%EA%B0%9C";

const getHtml = async (url) => {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.log(error);
  }
};

const extractDataFromHtml = (html) => {
  const ulList = [];
  const $ = cheerio.load(html);
  const $bodyList = $("div#searchList ol").children("li");

  $bodyList.each((i, elem) => {
    ulList[i] = {
      bookList: $(elem).find("a").text(),
      url: $(elem).find("a").attr("href"),
    };
  });

  return ulList.filter((n) => n.bookList);
};

getHtml(url)
  .then(extractDataFromHtml)
  .then(console.log)
  .catch(console.error);