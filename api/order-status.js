import fetch from "node-fetch";

export default async function handler(req, res) {
  const { orderId } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(`https://sandbox.cashfree.com/pg/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01"
      }
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Order Status Error:", err);
    res.status(500).json({ error: "Failed to fetch order status" });
  }
}
