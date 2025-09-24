import fetch from "node-fetch";

const getAuthToken = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return Buffer.from(`${keyId}:${keySecret}`).toString("base64");
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // A refund needs the PAYMENT ID from the successful transaction
    const { payment_id, refund_amount } = req.body;

    if (!payment_id || !refund_amount) {
        return res.status(400).json({ error: "payment_id and refund_amount are required" });
    }

    // Razorpay also requires the refund amount in paise
    const amountInPaise = Math.round(refund_amount * 100);

    const response = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${getAuthToken()}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
      }),
    });

     if (!response.ok) {
        const errorData = await response.json();
        console.error("Razorpay Refund Error:", errorData);
        return res.status(response.status).json({ error: "Failed to process refund", details: errorData });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    console.error("Refund Error:", err);
    res.status(500).json({ error: "Failed to process refund" });
  }
}
