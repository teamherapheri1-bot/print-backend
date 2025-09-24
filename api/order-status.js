import fetch from "node-fetch";

const getAuthToken = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return Buffer.from(`${keyId}:${keySecret}`).toString("base64");
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // The bot will now send a 'paymentLinkId' as the query parameter
    const { paymentLinkId } = req.query; 

    if (!paymentLinkId) {
        return res.status(400).json({ error: "paymentLinkId is required" });
    }

    const response = await fetch(`https://api.razorpay.com/v1/payment_links/${paymentLinkId}`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Razorpay Status Error:", errorData);
        return res.status(response.status).json({ error: "Failed to fetch payment link status", details: errorData });
    }

    const data = await response.json();
    // The bot should check for a status of 'paid' in this response data
    res.status(200).json(data);

  } catch (err) {
    console.error("Order Status Error:", err);
    res.status(500).json({ error: "Failed to fetch order status" });
  }
}
