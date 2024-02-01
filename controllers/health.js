const os = require("os");
const { lookup } = require("geoip-lite");

module.exports.check = function (req, res) {
  let uptime = `${Math.floor(process.uptime())}s`;
  let loadavg = os.loadavg()[2];
  let time = new Date().toTimeString();
  res.json({
    uptime,
    loadavg,
    time,
  });
};

module.exports.loopBack = function (req, res) {
  const ipInfo = req.ipInfo;
  console.log(ipInfo);
  var message = `Hey, you are browsing from ${ipInfo.city}, ${ipInfo.country}`;
  const ip = "172.20.4.86";
  console.log(ip); // ip address of the user
  console.log(lookup(ip)); // location of the user
  let ua = req.header("User-Agent");
  res.json({
    ...req.useragent,
    ip,
  });
};
