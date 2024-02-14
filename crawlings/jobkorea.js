const axios = require("axios");
const cheerio = require("cheerio");
require("dotenv").config({ path: "./nodemailer/.env" });
const nodemailer = require("nodemailer");

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
// 이메일 보내기
const crawlingJob = async (keyword) => {
  const jobs = await getJob(keyword);

  const h = [];
  h.push(`<table style="border:1px solid black;border-collapse:collapse;">`);
  h.push(`<thead>`);
  h.push(`<tr>`);
  h.push(`<th>구인제목</th>`);
  h.push(`<th>회사명</th>`);
  h.push(`<th>경력</th>`);
  h.push(`<th>학력</th>`);
  h.push(`<th>정규직여부</th>`);
  h.push(`<th>지역</th>`);
  h.push(`<th>구인마감일</th>`);
  h.push(`<th>비고</th>`);
  h.push(`</th>`);
  h.push(`</thead>`);
  h.push(`<tbody>`);
  jobs.forEach((job) => {
    h.push(`<tr>`);
    h.push(`<td>${job.jobTitle}</td>`);
    h.push(`<td>${job.company}</td>`);
    h.push(`<td>${job.experience}</td>`);
    h.push(`<td>${job.education}</td>`);
    h.push(`<td>${job.regularYN}</td>`);
    h.push(`<td>${job.region}</td>`);
    h.push(`<td>${job.dueDate}</td>`);
    h.push(`<td>${job.etc}</td>`);
    h.push(`</td>`);
  });
  h.push(`</tbody>`);
  h.push(`</table>`);

  const emailData = {
    from: "master8407@naver.com",
    to: "bhy8407@gmail.com",
    subject: "Node.js 구인 회사 정보",
    html: h.join(""),
  };

  await nodemailer.send(emailData);
};

crawlingJob("웹퍼블리셔");
