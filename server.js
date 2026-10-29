const express = require("express");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ message: "Hello Cloud!", service: "TDMU Notes API" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime_seconds: Math.round(process.uptime()) });
});

app.get("/hello", (req, res) => {
  res.json({
    message: "Hello Cloud từ TDMU Notes API",
    hostname: os.hostname(),
    time: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Server chạy tại cổng ${PORT}`);
});
