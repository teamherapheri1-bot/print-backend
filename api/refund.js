import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { order_id, refund_amount, refund_id } = req.body;

    const response = await fetch(`https://sandbox.cashfree.com/pg/orders/${order_id}/refunds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01"
      },
      body: JSON.stringify({
        refund_amount,
        refund_id
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Refund Error:", err);
    res.status(500).json({ error: "Failed to process refund" });
  }
}
