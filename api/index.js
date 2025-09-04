// index.js
module.exports = (req, res) => {
  res.status(200).json({
    message: "Print Backend is running successfully!",
    endpoints: ["/api/create-order", "/api/order-status", "/api/refund"]
  });
};
