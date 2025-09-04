// Corrected content for api/index.js
export default function handler(req, res) {
  res.status(200).json({
    message: "Print Backend is running successfully!",
    endpoints: ["/api/create-order", "/api/order-status", "/api/refund"],
  });
}