const os = require("os");
const { lookup } = require("geoip-lite");

module.exports.cost = function (req, res) {
  const { total_word } = req.body;
  const estamitedToken = Math.ceil(total_word / 8);
  res.json({
    estamitedToken,
  });
};
