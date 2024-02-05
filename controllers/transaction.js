const os = require("os");
const { lookup } = require("geoip-lite");
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

module.exports.cost = function (req, res) {
  const { total_word } = req.body;
  const estamitedToken = Math.ceil(total_word / 8);
  res.json({
    estamitedToken,
  });
};

module.exports.createIntend = async function (req, res) {
  try {
    console.log("api called and data ", req.body);

    const session = await stripe.checkout.sessions.create({
      success_url: "http://localhost:3000/success",
      line_items: [
        {
          price: "price_1OgRJiJggWefJ04AijoQnlvu",
          quantity: 2,
        },
      ],
      mode: "payment",
    });
    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    res.status(500).json({
      statusCode: 500,
      message: err instanceof Error ? err.message : "Internal server error",
    });
  }
};
