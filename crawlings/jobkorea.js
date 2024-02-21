const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config({ path: "./nodemailer/.env" });
const nodemailer = require("nodemailer");

const cron = require("node-cron")

// Here, create the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD
  }
});

const getHTML = async (keyword) => {
  try {
    const html = (
      await axios.get(
        `https://www.jobkorea.co.kr/Search/?stext=${encodeURI(keyword)}`
      )
    ).data;
    return html;
  } catch (error) {
    console.log(error);
  }
};

const parsing = async (page) => {
  const $ = cheerio.load(page);
  const jobs = [];
  const $jobList = $(".post");
  $jobList.each((idx, node) => {
    const jobTitle = $(node).find(".title:eq(0)").text().trim();
    const company = $(node).find(".name:eq(0)").text().trim();
    const experience = $(node).find(".exp:eq(0)").text().trim();
    const education = $(node).find(".edu:eq(0)").text().trim();
    const regularYN = $(node).find(".option > span:eq(2)").text().trim();
    const region = $(node).find(".long:eq(0)").text().trim();
    const dueDate = $(node).find(".date:eq(0)").text().trim();
    const etc = $(node).find(".etc:eq(0)").text().trim();

    if (
      experience.indexOf("신입") > -1 ||
      experience.indexOf("경력무관") > -1
    ) {
      jobs.push({
        jobTitle,
        company,
        experience,
        education,
        regularYN,
        region,
        dueDate,
        etc,
      });
    }
  });

  return jobs;
};

const getJob = async (keyword) => {
  const html = await getHTML(keyword);
  const jobs = await parsing(html);

  console.log(jobs);
  return jobs;
};


const crawlingJob = async (keyword) => {
  const jobs = await getJob(keyword);

  const h = [];
  h.push(`<table style="border:1px solid black;border-collapse:collapse;">`);
  h.push(`<thead>`);
  h.push(`<tr>`);
  h.push(`<th style="border:1px solid black">구인제목</th>`);
  h.push(`<th style="border:1px solid black">회사명</th>`);
  h.push(`<th style="border:1px solid black">경력</th>`);
  h.push(`<th style="border:1px solid black">학력</th>`);
  h.push(`<th style="border:1px solid black">정규직여부</th>`);
  h.push(`<th style="border:1px solid black">지역</th>`);
  h.push(`<th style="border:1px solid black">구인마감일</th>`);
  h.push(`<th style="border:1px solid black">비고</th>`);
  h.push(`</th>`);
  h.push(`</thead>`);
  h.push(`<tbody>`);
  jobs.forEach((job) => {
    h.push(`<tr>`);
    h.push(`<td style="border:1px solid black">${job.jobTitle}</td>`);
    h.push(`<td style="border:1px solid black">${job.company}</td>`);
    h.push(`<td style="border:1px solid black">${job.experience}</td>`);
    h.push(`<td style="border:1px solid black">${job.education}</td>`);
    h.push(`<td style="border:1px solid black">${job.regularYN}</td>`);
    h.push(`<td style="border:1px solid black">${job.region}</td>`);
    h.push(`<td style="border:1px solid black">${job.dueDate}</td>`);
    h.push(`<td style="border:1px solid black">${job.etc}</td>`);
    h.push(`</td>`);
  });
  h.push(`</tbody>`);
  h.push(`</table>`);

  const emailData = {
    from: "master8407@naver.com",
    to: "bhy8407@gmail.com",
    subject: "웹퍼블리셔 구인 회사 정보",
    html: h.join(""),
  };

  await transporter.sendMail(emailData);
};

// 매일 아침 7시에 크롤링이 진행되고, 수집된 결과를 이메일로 전송
// 자동으로 실행되도록 서버에 저장하려면?
cron.schedule("0 7 * * *", async () => {
  crawlingJob("웹퍼블리셔");
})