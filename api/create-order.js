import fetch from "node-fetch";

// Helper function to create the Base64 auth token for Razorpay
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
    const { amount, currency } = req.body;

    // Razorpay requires the amount in the smallest currency unit (e.g., paise)
    const amountInPaise = Math.round(amount * 100);

    // Step 1: Create an Order with Razorpay
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${getAuthToken()}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: currency || "INR",
        receipt: `receipt_order_${Date.now()}`, // A unique receipt ID
      }),
    });

    if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error("Razorpay Order Error:", errorData);
        return res.status(orderResponse.status).json({ error: "Failed to create Razorpay order", details: errorData });
    }

    const orderData = await orderResponse.json();

    // Step 2: Create a Payment Link for that Order
    const linkResponse = await fetch("https://api.razorpay.com/v1/payment_links", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${getAuthToken()}`,
        },
        body: JSON.stringify({
            amount: amountInPaise,
            currency: currency || "INR",
            description: "Payment for Print Service",
            order_id: orderData.id
        })
    });

    if (!linkResponse.ok) {
        const errorData = await linkResponse.json();
        console.error("Razorpay Link Error:", errorData);
        return res.status(linkResponse.status).json({ error: "Failed to create payment link", details: errorData });
    }

    const linkData = await linkResponse.json();
    res.status(200).json(linkData);

  } catch (err) {
    console.error("Create Order/Link Error:", err);
    res.status(500).json({ error: "Failed to create order or payment link" });
  }
}
